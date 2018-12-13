const { createTransport } = require('nodemailer');
const debug = require('debug')('mailer');
const { mailer: config } = require('config');
const { User } = require('./models');

const transport = createTransport(config.transport);

const sendMail = options => {
  options.subject = `${config.subject} ${options.subject}`;
  options.html = `${options.html}<p>${config.signature}</p>`;

  transport.sendMail(options, (err, info) => {
    if (err) return debug(err);
    debug(info);
  });
};

const getAdminsEmails = async () => {
  const users = await User.find();
  return users.map(u => u.email).join(', ');
};

const getCenterName = ({ oldCenter, submittedCenter }) =>
  oldCenter.name ||
  submittedCenter.name ||
  oldCenter.code ||
  submittedCenter.code;

exports.sendModificationToAdmins = async modification => {
  const centerName = getCenterName(modification);
  const link = modification.getURL();
  const options = {
    from: config.from,
    to: await getAdminsEmails(),
    subject: `Une demande de modification vient d'être soumise`,
    text: `Bonjour, une demande de modification concernant le centre ${centerName} vient d'être soumise. Pour la consulter: ${link}`,
    html: `<p>Bonjour, une demande de modification concernant le centre <strong>${centerName}</strong> vient d'être soumise.</p><p>Pour la consulter <a href="${link}">${link}</a></p>`
  };
  sendMail(options);
};

exports.sendModificationConfirmationToGuest = async (
  modification,
  guestEmail
) => {
  const centerName = getCenterName(modification);
  const options = {
    from: config.from,
    to: guestEmail,
    subject: `Votre demande de modification a bien été enregistrée`,
    text: `Bonjour, votre demande de modification concernant le centre ${centerName} a bien été enregistrée.`,
    html: `<p>Bonjour, votre demande de modification concernant le centre <strong>${centerName}</strong> a bien été enregistrée.</p>`
  };
  sendMail(options);
};

exports.sendModificationVerdictToGuest = async (
  modification,
  guestEmail,
  status
) => {
  const centerName = getCenterName(modification);
  const options = {
    from: config.from,
    to: guestEmail,
    subject: `Votre demande de modification a été traitée`,
    text: `Bonjour, votre demande de modification concernant le centre ${centerName} a été ${
      status === 'accepted' ? 'acceptée' : 'refusée'
    }.`,
    html: `<p>Bonjour, votre demande de modification concernant le centre <strong>${centerName}</strong> a été ${
      status === 'accepted' ? 'acceptée' : 'refusée'
    }.</p>`
  };
  sendMail(options);
};
