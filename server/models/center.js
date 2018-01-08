const path = require('path')
const mongoose = require('mongoose')
const { toJSON } = require('./utils')

const SCHEMA = path.join(__dirname, '../../back-office/schema.json')
const { properties: schema } = require(SCHEMA)

const getType = str => {
  switch (str) {
    case 'number':
      return Number
    case 'boolean':
      return Boolean
    default:
      return String
  }
}

const mongooseFields = Array.from(Object.entries(schema)).reduce(
  (acc, [fieldId, { type, required }]) => {
    acc[fieldId] = {
      type: getType(type),
      // required,
    }
    return acc
  },
  {},
)

delete mongooseFields.id

const centerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    // should this center be hidden on the front office?
    hidden: { type: Boolean, required: true, default: false },
    ...mongooseFields
  },
  { timestamps: true },
)
centerSchema.index({ id: 1 }, { unique: true })
.plugin(toJSON)

module.exports = mongoose.model('Center', centerSchema)
