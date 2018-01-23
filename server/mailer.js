const { createTransport } = require('nodemailer')
const debug = require('debug')('mailer')
const { mailer: config } = require('config')
const { User } = require('./models')

const transport = createTransport(config.transport)

const sendMail = options => {
  transport.sendMail(options, (err, info) => {
    if (err) return debug(err)
    debug(info)
  })
}

const getAdminsEmails = async () => {
  const users = await User.find()
  return users.map(u => u.email).join(', ')
}

exports.sendModificationToAdmins = async modification => {
  const centerCode = modification.oldCenter.code
  const link = modification.getURL()

  const options = {
    from: config.from,
    to: await getAdminsEmails(),
    subject: `[bobib] Une demande de modification vient d'être soumise`,
    text: `Bonjour, une demande de modification concernant le centre ${centerCode} vient d'être soumise. Pour la consulter: ${link}`,
    html: `<p>Bonjour, une demande de modification concernant le centre <strong>${centerCode}</strong> vient d'être soumise.</p><p>Pour la consulter <a href="${link}">${link}</a></p>`,
  }
  sendMail(options)
}

exports.sendModificationConfirmationToGuest = async (
  modification,
  guestEmail,
) => {
  const centerCode = modification.oldCenter.code

  const options = {
    from: config.from,
    to: guestEmail,
    subject: `[bobib] Votre demande de modification a bien été enregistrée`,
    text: `Bonjour, votre demande de modification concernant le centre ${centerCode} a bien été enregistrée.`,
    html: `Bonjour, votre demande de modification concernant le centre <strong>${centerCode}</strong> a bien été enregistrée.`,
  }
  sendMail(options)
}

exports.sendModificationVerdict = () => {}
