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

      case 'boolean-item':
        acc[fieldId] = new mongoose.Schema(
          {
            enabled: { type: Boolean },
            ...getMongooseFields(fieldProps.item),
          },
          { _id: false },
        )
        break

      default: {
        let { type, required } = fieldProps
        acc[fieldId] = {
          type: getType(type),
          // required,
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
    // should this center be hidden on the front office?
    hidden: { type: Boolean, required: true, default: false },
    ...mongooseFields,
  },
  { timestamps: true },
)
centerSchema.index({ id: 1 }, { unique: true }).plugin(toJSON)

module.exports = mongoose.model('Center', centerSchema)
