const mongoose = require('mongoose')
const { toJSON } = require('./utils')

const modificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected'],
      required: true,
    },
    centerId: { type: String, required: true },
    // TODO
    center: mongoose.Schema.Types.Mixed,
    email: { type: String },
    notify: { type: Boolean },
  },
  { timestamps: true },
)
modificationSchema.index({ createdAt: -1, updatedAt: -1 }, { background: true }) // sorted by date
.plugin(toJSON)

// Always sort by createdAt DESC, updatedAt DESC
modificationSchema.pre('find', function() {
  this.sort({ createdAt: -1, updatedAt: -1 })
})

module.exports = mongoose.model('Modification', modificationSchema)
