const { User } = require('../models')

exports.get = async ({ params }, res) => {
  const user = await User.findOne({ _id: params.id })
  user ? res.json({ user }) : res.boom.notFound()
}

exports.list = async (req, res) => res.json({ users: await User.find() })

exports.create = async ({ body }, res) => {
  await User.create({ email: body.user.email, password: body.user.password })
  res.send('ok')
}

exports.update = async ({ params, body }, res) => {
  const user = await User.findOne({ _id: params.id })
  if (!user) return res.boom.notFound()

  user.set({ email: body.user.email, password: body.user.password })
  await user.save()
  res.send('ok')
}

exports.delete = async ({ params }, res) => {
  await User.remove({ _id: params.id })
  res.send('ok')
}
