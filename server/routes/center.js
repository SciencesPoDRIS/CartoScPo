const { createPatch } = require('rfc6902')
const { Center, Modification, sanitizeCenter } = require('../models')
const {
  sendModificationToAdmins,
  sendModificationConfirmationToGuest,
} = require('../mailer')

exports.get = async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id })
  center ? res.json({ center }) : res.boom.notFound()
}

exports.list = async (req, res) => {
  res.json({ centers: await Center.find() })
}

exports.create = async ({ body, user }, res) => {
  const submittedCenter = sanitizeCenter(body.center)
  if (user) {
    try {
      const center = new Center(body.center)
      await center.save()
      const m = new Modification({
        centerId: body.center.id,
        oldCenter: {},
        submittedCenter,
        email: user.email,
        notify: false,
        status: 'accepted',
        verb: 'create'
      })
      m.save()
      res.send('ok')
    } catch (err) {
      return res.boom.badRequest()
    }
  } else {
    const m = new Modification({
      centerId: body.center.id,
      oldCenter: {},
      submittedCenter,
      email: body.email,
      notify: Boolean(body.email),
      verb: 'create'
    })
    await m.save()
    sendModificationToAdmins(m)
    if (body.email) sendModificationConfirmationToGuest(m, body.email)
    res.send('ok')
  }
}

exports.update = async ({ params, body, user }, res) => {
  const center = await Center.findOne({ id: params.id })
  if (!center) return res.boom.notFound()

  const oldCenter = sanitizeCenter(center.toJSON())
  const submittedCenter = sanitizeCenter(body.center)

  // don't create an empty modif
  const diffs = createPatch(oldCenter, submittedCenter)
  if (!diffs.length) return res.boom.badRequest()

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
        verb: 'update'
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
      verb: 'update'
    })
    await m.save()
    sendModificationToAdmins(m)
    if (body.email) sendModificationConfirmationToGuest(m, body.email)
    res.send('ok')
  }
}
