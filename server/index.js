const path = require('path')
const debug = require('debug')('express')
const express = require('express')
const boom = require('express-boom')
const { server: config } = require('config')

const { plugSession, checkAuth } = require('./session')
const { centerRoutes, modificationRoutes, userRoutes } = require('./routes')
const PUBLIC = path.join(__dirname, '../back-office')

const app = express()

app.use(express.static(PUBLIC))
app.use(express.json())
app.use(boom())

plugSession(app)

// public

app.get('/api/centers/:id', centerRoutes.get)
app.get('/api/centers', centerRoutes.list)
app.post('/api/centers', centerRoutes.create)
app.put('/api/centers/:id', centerRoutes.update)
app.delete('/api/centers/:id', centerRoutes.delete)

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

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
