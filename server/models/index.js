const { mongo } = require('config')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

if (!mongoose.connection.db) {
  mongoose.connect(mongo.uri, {
    promiseLibrary: global.Promise,
    useMongoClient: true,
  })
} else {
  mongoose.models = {}
  mongoose.connection.models = {}
  mongoose.connection.removeAllListeners()
}

exports.connection = mongoose.connection
exports.Center = require('./center')
exports.Modification = require('./modification')

