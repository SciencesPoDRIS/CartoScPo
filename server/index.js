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

app.get('/api/centers/:id', centerRoutes.get)
app.get('/api/centers', centerRoutes.list)
app.post('/api/centers', centerRoutes.create)
app.put('/api/centers/:id', centerRoutes.update)
app.patch('/api/centers/:id/visibility', centerRoutes.updateVisbility)

app.get('/api/modifications/:id', checkAuth, modificationRoutes.get)
app.get('/api/modifications', checkAuth, modificationRoutes.list)
app.patch('/api/modifications/:id', checkAuth, modificationRoutes.update)

app.get('/api/users', checkAuth, userRoutes.list)
app.post('/api/users', checkAuth, userRoutes.create)
app.delete('/api/users/:email', checkAuth, userRoutes.delete)

// single page application
app.get('/*', (req, res) => res.sendFile(`${PUBLIC}/index.html`))

app.listen(config.port, () => debug(`Server listening on ${config.port}`))
