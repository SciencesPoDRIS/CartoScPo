const mongoose = require('mongoose')

const modificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected'],
      required: true,
    },
    centerId: { type: String, required: true },
    email: { type: String },
  },
  { timestamps: true },
)
modificationSchema.index({ createdAt: -1, updatedAt: -1 }, { background: true }) // sorted by date

// Always sort by createdAt DESC, updatedAt DESC
modificationSchema.pre('find', function() {
  this.sort({ createdAt: -1, updatedAt: -1 })
})

module.exports = mongoose.model('Modification', modificationSchema)
