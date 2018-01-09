const omit = (obj, ...excludedKeys) =>
  Object.entries(obj)
    .filter(([key]) => !excludedKeys.includes(key))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})

exports.toJSON = (schema, options = {}) => {
  const { hide = [] } = options


  if (!schema.methods.hasOwnProperty('toJSON')) {
    schema.method('toJSON', function() {
      return omit(this.toObject({ virtuals: true }), '_id', '__v', ...hide)
    })
  }
}
