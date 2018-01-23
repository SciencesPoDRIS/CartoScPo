const { Modification } = require('../models')

exports.get = async ({ params }, res) => {
  const modification = await Modification.findOne({ _id: params.id })
  modification ? res.json({ modification }) : res.boom.notFound()
}

exports.list = async (req, res) =>
  res.json({ modifications: await Modification.find() })

exports.update = async ({ params, body }, res) => {
  const modification = await Modification.findOne({ _id: params.id })
  if (!modification) return res.boom.notFound()

  // TODO
  modification.status = body.status
  modification.save()
  res.send('ok')
}
