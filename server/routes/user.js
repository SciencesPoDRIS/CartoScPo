const { User } = require('../models')

exports.list = async (req, res) => res.json({ users: await User.find() })

exports.create = async ({ body }, res) => {
  await User.create({ email: body.user.email, password: body.user.password })
  res.send('ok')
}

exports.delete = async ({ params }, res) => {
  await User.remove({ email: params.email })
  res.send('ok')
}
