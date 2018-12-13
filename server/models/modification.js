const mongoose = require('mongoose');
const { toJSON } = require('./utils');
const { server } = require('config');

const modificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected'],
      required: true
    },
    verb: {
      type: String,
      default: 'update',
      enum: ['create', 'update', 'delete'],
      required: true
    },
    centerId: { type: String, required: true },
    // TODO
    oldCenter: mongoose.Schema.Types.Mixed,
    submittedCenter: mongoose.Schema.Types.Mixed,
    email: { type: String },
    notify: { type: Boolean }
  },
  { timestamps: true }
);
modificationSchema
  .index({ createdAt: -1, updatedAt: -1 }, { background: true }) // sorted by date
  .plugin(toJSON);

// Always sort by createdAt DESC, updatedAt DESC
modificationSchema.pre('find', function() {
  this.sort({ createdAt: -1, updatedAt: -1 });
});

// used in emails, so it should be the public host
modificationSchema.method('getURL', function getURL() {
  return `${server.backOfficeBaseUrl}/modifications/${this.id}`;
});

module.exports = mongoose.model('Modification', modificationSchema);
