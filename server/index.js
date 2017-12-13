const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const boom = require('express-boom')
const { server: config } = require('config')

const { Center, Modification } = require('./models')
const PUBLIC = path.join(__dirname, '../back-office')

const app = express()

app.use(express.static(PUBLIC))
app.use(express.json())
app.use(boom())

app.get('/api/centers/:id', async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  center ? res.json({ center }) : res.boom.notFound()
})

app.get('/api/centers', (req, res) => {
  Center.find().then(centers => res.json({ centers }))
})

app.put('/api/centers/:id', ({ params, body }, res) => {
  Center.update(
    { id: params.id },
    { $set: { ...body.center } },
    { upsert: true },
    err => {
      if (err) return res.boom.badRequest()
      const m = new Modification({ centerId: params.id })
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

app.get('/api/modifications', (req, res) => {
  Modification.find().then(modifications => res.json({ modifications }))
})

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
