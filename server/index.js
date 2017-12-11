const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const { server: config } = require('config')

const PUBLIC = path.join(__dirname, '../back-office')
const DB = path.join(__dirname, '../app/data/data.json')

const db = require(DB)

const app = express()

app.use(express.static(PUBLIC))

app.get('/api/centers', (req, res) => {
  const centers = Array.from(Object.entries(db.allCenters)).map(
    ([id, center]) => {
      center.id = id
      return center
    },
  )
  res.json({ centers })
})

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
