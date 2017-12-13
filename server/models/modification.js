const mongoose = require('mongoose')

const modificationSchema = new mongoose.Schema(
  {
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] }
  },
  { timestamps: true },
)
modificationSchema.index({ id: 1 }, { unique: true })

module.exports = mongoose.model('Modification', modificationSchema)

