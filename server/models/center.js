const mongoose = require('mongoose')

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

module.exports = mongoose.model('Center', centerSchema)
