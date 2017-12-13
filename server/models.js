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

const centerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    // should this center be hidden on the front office?
    hidden: { type: Boolean, required: true, default: false },
    raw: { type: String, required: true },
  },
  { timestamps: true },
)
centerSchema.index({ id: 1 }, { unique: true })

exports.Center = mongoose.model('Center', centerSchema)
