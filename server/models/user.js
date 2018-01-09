const { createHash } = require('crypto')
const mongoose = require('mongoose')
const { server: config } = require('config')
const { toJSON } = require('./utils')

function hashPassword(password) {
  return createHash('sha1')
    .update(config.salt + String(password))
    .digest('hex')
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: {
      type: String,
      match: /.{3}/,
      required: true,
      set: hashPassword,
    },
    connectedAt: { type: Date },
  },
  { timestamps: true },
)
userSchema
  .index({ email: 1 }, { unique: true })
  .plugin(toJSON, { hide: ['password'] })

userSchema.method('validPassword', function validPassword(password) {
  return this.password === hashPassword(password)
})

module.exports = mongoose.model('User', userSchema)
