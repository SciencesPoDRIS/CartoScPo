const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const { server: config } = require('config')

const PUBLIC = path.join(__dirname, '../back-office')
const app = express()

app.use(express.static(PUBLIC))

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
