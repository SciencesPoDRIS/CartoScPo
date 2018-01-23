const { Center, Modification, sanitizeCenter } = require('../models')
const { sendModificationToAdmins, sendModificationConfirmationToGuest } = require('../mailer')

exports.get = async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  center ? res.json({ center }) : res.boom.notFound()
}

exports.list = async (req, res) =>
  res.json({ centers: await Center.find() }),


exports.create =  ({ body, user }, res) => {
  const center = new Center(body.center)
  center.save(err => {
    if (err) return res.boom.badRequest()
    const m = new Modification({
      centerId: body.center.id,
      center: center.toJSON(),
      email: user ? user.email : body.email,
      // only guests should be notified
      notify: Boolean(body.email),
    })
    m.save()
    res.send('ok')
  })
}

exports.update = async ({ params, body, user }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  const oldCenter = sanitizeCenter(center.toJSON())
  const submittedCenter = sanitizeCenter(body.center)

  if (user) {
    try {
      // auto-accept but create a modif as a log
      center.set(submittedCenter)
      await center.save()
      const m = new Modification({
        centerId: params.id,
        oldCenter,
        submittedCenter,
        email: user.email,
        notify: false,
        status: 'accepted',
      })
      await m.save()
      res.send('ok')
    } catch (err) {
      // mainly validation errors that should not happen in regular scenarii
      // since the angular form should block the submission
      return res.boom.badRequest()
    }
  } else {
    const m = new Modification({
      centerId: params.id,
      oldCenter,
      submittedCenter,
      email: body.email,
      notify: Boolean(body.email),
    })
    await m.save()
    sendModificationToAdmins(m)
    if (body.email) sendModificationConfirmationToGuest(m, body.email)
    res.send('ok')
  }
}

exports.updateVisbility =  async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  await Center.update({ id: params.id }, { $set: { hidden: !center.hidden } })
  res.send({ hidden: !center.hidden })
}
