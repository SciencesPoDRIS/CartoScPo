const fs = require('fs')
const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const boom = require('express-boom')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const { server: config } = require('config')

const { plugSession, checkAuth } = require('./session')
const { centerRoutes, modificationRoutes, userRoutes } = require('./routes')
const PUBLIC = path.join(__dirname, '../back-office')

const app = express()

const spa = (req, res) => {
  debug('spa route', req.url)
  fs.readFile(`${PUBLIC}/index.html`, 'utf8', (err, index) => {
    // https://docs.angularjs.org/error/$location/nobase
    index = index.replace(
      '<base href="/" />',
      `<base href="${config.baseHref}">`,
    )
    res.send(index)
  })
}

app.use(cors()) // for schema.json requested by FO
app.use(express.json())
app.use(boom())
app.use(fileUpload())

app.get('/', spa)
app.get('/index.html', spa)
app.use(express.static(PUBLIC))

plugSession(app)

// public

app.get('/api/centers/:id', centerRoutes.get)
app.get('/api/centers', centerRoutes.list)
app.post('/api/centers', centerRoutes.create)
app.put('/api/centers/:id', centerRoutes.update)
app.delete('/api/centers/:id', centerRoutes.delete)

app.post('/api/upload-logo/:id', checkAuth, centerRoutes.uploadLogo)

// res to be consumed by front office
app.get('/api/export', centerRoutes.export)

// checkAuth

app.get('/api/modifications/:id', checkAuth, modificationRoutes.get)
app.get('/api/modifications', checkAuth, modificationRoutes.list)
app.patch('/api/modifications/:id', checkAuth, modificationRoutes.update)

app.get('/api/users/:id', checkAuth, userRoutes.get)
app.get('/api/users', checkAuth, userRoutes.list)
app.post('/api/users', checkAuth, userRoutes.create)
app.put('/api/users/:id', checkAuth, userRoutes.update)
app.delete('/api/users/:id', checkAuth, userRoutes.delete)

app.get('/*', spa)

app.listen(config.port, () => {
  debug(`Server listening on ${config.port}`)
  debug(`backOfficeBaseUrl,baseHref: ${config.backOfficeBaseUrl}${config.baseHref}`)
})
