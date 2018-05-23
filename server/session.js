const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const debug = require('debug')('redis')

const passport = require('passport')
const { Strategy } = require('passport-local')
const { server: config, redis } = require('config')
const { User } = require('./models')

// auto create admin account if no users in mongo at app launch
User.count({}, (err, count) => {
  if (!count)
    User.create({ email: config.adminEmail, password: config.adminPassword })
})

// use this middleware to protect routes
const checkAuth = (exports.checkAuth = (req, res, next) => {
  const rescue = {
    isAuthenticated: req.isAuthenticated(),
    headers: req.headers,
    session: req.session,
  }
  console.log('checkAuth', rescue)
  if (req.isAuthenticated()) {
    next()
  } else {
    res.boom.forbidden(JSON.stringify(rescue))
  }
})

let redisConnected = false

exports.plugSession = app => {
  const store = new RedisStore({ ...redis, logErrors: debug })
  store.on('connect', () => redisConnected = true)
  app.use(
    session({
      store,
      secret: config.secret,
      resave: false,
      saveUninitialized: false,
    }),
  )
  plugPassport(app)
  defineRoutes(app)
}

// users use emails as ids
function plugPassport(app) {
  app.use(passport.initialize())
  app.use(passport.session())

  const checkUser = (email, password, done) => {
    User.findOne({ email }, (err, user) => {
      if (err) return done(err)
      if (!user || !user.validPassword(password)) return done(null, false)

      user.connectedAt = new Date().toISOString()
      user.save().then(() => done(null, user))
    })
  }

  passport.use(new Strategy({ usernameField: 'email' }, checkUser))

  passport.serializeUser(({ email }, done) => done(null, email))

  passport.deserializeUser((email, done) => User.findOne({ email }, done))
}

function defineRoutes(app) {
  app.get('/session', (req, res) => {
    if (req.user) res.json(req.user.email)
    else res.boom.unauthorized()
  })

  app.post('/login', (req, res, next) => {
    if (!redisConnected) res.boom.serverUnavailable('redis not connected')
    passport.authenticate('local', (err, user) => {
      if (err) return next(err)
      if (!user) return res.boom.unauthorized()

      req.login(user, err => {
        if (err) return next(err)
        res.send('ok')
      })
    })(req, res, next)
  })

  app.post('/logout', checkAuth, (req, res) => {
    req.logout()
    res.send('ok')
  })
}
