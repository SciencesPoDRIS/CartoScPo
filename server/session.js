const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { server: config } = require('config')
const { User } = require('./models')

// auto create admin account if no users at app launch
User.count({}, function(err, count) {
  if (!count) User.create({ email: config.adminEmail, password: config.adminPassword })
})

const checkAuth = (exports.checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.boom.forbidden()
  }
})

exports.plugSession = app => {
  // SESSION / PASSPORT

  app.use(session({ secret: config.secret }))
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      (email, password, done) => {
        User.findOne({ email }, (err, user) => {
          if (err) return done(err)
          if (!user || !user.validPassword(password)) return done(null, false)

          return done(null, user)
        })
      },
    ),
  )

  passport.serializeUser((user, done) => done(null, user.email))

  passport.deserializeUser((email, done) =>
    User.findOne({ email }, (err, user) => done(err, user)),
  )

  app.post('/login', (req, res, next) => {
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
