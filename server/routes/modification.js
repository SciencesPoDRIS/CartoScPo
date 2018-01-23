const { Center, Modification } = require('../models')
const { sendModificationVerdictToGuest } = require('../mailer')

exports.get = async ({ params }, res) => {
  const modification = await Modification.findOne({ _id: params.id })
  modification ? res.json({ modification }) : res.boom.notFound()
}

exports.list = async (req, res) =>
  res.json({ modifications: await Modification.find() })

exports.update = async ({ params, body }, res) => {
  const modification = await Modification.findOne({ _id: params.id })
  if (!modification) return res.boom.notFound()

  // already processed
  if (modification.status !== 'pending') return res.boom.badRequest()

  const center = await Center.findOne({ id: modification.centerId })
  if (!center) return res.boom.notFound()

  switch (modification.verb) {
    // TODO
    case 'create':
      break

    case 'update':
      if (body.status === 'accepted') {
        center.set(modification.submittedCenter)
        await center.save()
      }
      if (modification.notify && modification.email)
        sendModificationVerdictToGuest(
          modification,
          modification.email,
          body.status,
        )
      break

    // TODO
    case 'delete':
      break

    default:
      return res.boom.badRequest()
  }

  modification.status = body.status
  await modification.save()
  res.send('ok')
}
