const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const boom = require('express-boom')
const { server: config } = require('config')

const { plugSession, checkAuth } = require('./session')
const { Center, Modification, User, sanitizeCenter } = require('./models')
const PUBLIC = path.join(__dirname, '../back-office')

const app = express()

app.use(express.static(PUBLIC))
app.use(express.json())
app.use(boom())

plugSession(app)

app.get('/api/centers/:id', async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  center ? res.json({ center }) : res.boom.notFound()
})

app.get('/api/centers', async (req, res) =>
  res.json({ centers: await Center.find() }),
)

app.post('/api/centers', ({ body, user }, res) => {
  const center = new Center(body.center)
  center.save(err => {
    if (err) return res.boom.badRequest()
    const m = new Modification({
      centerId: body.center.id,
      center: center.toJSON(),
      email: user ? user.email : body.email,
      // only guests should be notified
      notify: Boolean(body.email),
    })
    m.save()
    res.send('ok')
  })
})

app.put('/api/centers/:id', async ({ params, body, user }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  const oldCenter = sanitizeCenter(center.toJSON())
  const submittedCenter = sanitizeCenter(body.center)

  if (user) {
    try {
      // auto-accept but create a modif as a log
      center.set(submittedCenter)
      await center.save()
      const m = new Modification({
        centerId: params.id,
        oldCenter,
        submittedCenter,
        email: user.email,
        notify: false,
        status: 'accepted',
      })
      await m.save()
      res.send('ok')
    } catch (err) {
      // mainly validation errors that should not happen in regular scenarii
      // since the angular form should block the submission
      return res.boom.badRequest()
    }
  } else {
    const m = new Modification({
      centerId: params.id,
      oldCenter,
      submittedCenter,
      email: body.email,
      notify: Boolean(body.email),
    })
    await m.save()
    res.send('ok')
  }
})

app.patch('/api/centers/:id/visibility', async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  await Center.update({ id: params.id }, { $set: { hidden: !center.hidden } })
  res.send({ hidden: !center.hidden })
})

app.get('/api/modifications/:id', checkAuth, async ({ params }, res) => {
  const modification = await Modification.findOne({ _id: params.id })
  modification ? res.json({ modification }) : res.boom.notFound()
})

app.patch(
  '/api/modifications/:id',
  checkAuth,
  async ({ params, body }, res) => {
    const modification = await Modification.findOne({ _id: params.id })
    if (!modification) return res.boom.notFound()

    // TODO
    modification.status = body.status
    modification.save()
    res.send('ok')
  },
)

app.get('/api/modifications', checkAuth, async (req, res) =>
  res.json({ modifications: await Modification.find() }),
)

app.get('/api/users', checkAuth, async (req, res) =>
  res.json({ users: await User.find() }),
)

app.post('/api/users', checkAuth, async ({ body }, res) => {
  await User.create({ email: body.user.email, password: body.user.password })
  res.send('ok')
})

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
