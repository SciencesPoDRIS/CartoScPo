const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const boom = require('express-boom')
const { server: config } = require('config')

const { plugSession, checkAuth } = require('./session')
const { Center, Modification, User } = require('./models')
const PUBLIC = path.join(__dirname, '../back-office')

const app = express()

app.use(express.static(PUBLIC))
app.use(express.json())
app.use(boom())

plugSession(app)

app.get('/api/centers/:id', async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  center ? res.json({ center: center.toJSON() }) : res.boom.notFound()
})

app.get('/api/centers', async (req, res) =>
  res.json({ centers: (await Center.find()).map(c => c.toJSON()) }),
)

app.put('/api/centers/:id', ({ params, body, user }, res) => {
  Center.update(
    { id: params.id },
    { $set: { ...body.center } },
    { upsert: true },
    err => {
      if (err) return res.boom.badRequest()
      const m = new Modification({
        centerId: params.id,
        email: user ? user.email : body.email,
        // only guests should be notified
        notify: Boolean(body.email)
      })
      m.save()
      res.send('ok')
    },
  )
})

app.patch('/api/centers/:id/visibility', async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  await Center.update({ id: params.id }, { $set: { hidden: !center.hidden } })
  res.send({ hidden: !center.hidden })
})

app.get('/api/modifications', checkAuth, async (req, res) =>
  res.json({ modifications: (await Modification.find()).map(m => m.toJSON()) }),
)

app.get('/api/users', checkAuth, async (req, res) =>
  res.json({ users: (await User.find()).map(u => u.toJSON()) }),
)

app.post('/api/users', checkAuth, async ({ body }, res) => {
  await User.create({ email: body.user.email, password: body.user.password })
  res.send('ok')
})

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
