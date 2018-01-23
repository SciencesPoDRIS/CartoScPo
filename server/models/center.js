const path = require('path')
const debug = require('debug')('mongoose')
const mongoose = require('mongoose')
const { toJSON } = require('./utils')

// the mongoose schema is auto created from this file
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

const getMongooseFields = schema =>
  Array.from(Object.entries(schema)).reduce((acc, [fieldId, fieldProps]) => {
    switch (fieldProps.type) {
      // sub schemas like 'schools' or addresses
      case 'array':
        acc[fieldId] = [
          new mongoose.Schema(getMongooseFields(fieldProps.item), {
            _id: false,
          }),
        ]
        break

      // like 'Collections auprès d'éditeurs ?'
      case 'boolean-item':
        acc[fieldId] = new mongoose.Schema(
          {
            ...getMongooseFields(fieldProps.item),
            enabled: { type: Boolean },
          },
          { _id: false },
        )
        break

      // like 'Sections CNRS'
      case 'check-list':
        acc[fieldId] = [{ type: String }]
        break

      default: {
        let { type, required } = fieldProps
        acc[fieldId] = {
          type: getType(type),
          required: Boolean(required),
        }
        break
      }
    }
    return acc
  }, {})

const mongooseFields = getMongooseFields(schema)

delete mongooseFields.id

const centerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    ...mongooseFields,
  },
  { timestamps: true },
)
centerSchema.index({ id: 1 }, { unique: true }).plugin(toJSON)

const logError = (err, res, next) => {
  debug(err)
  next(err)
}

centerSchema.post('save', logError)
centerSchema.post('update', logError)

module.exports = mongoose.model('Center', centerSchema)
