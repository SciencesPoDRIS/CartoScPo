const { Center, Modification } = require('../models');
const { sendModificationVerdictToGuest } = require('../mailer');

exports.get = async ({ params }, res) => {
  const modification = await Modification.findOne({ _id: params.id });
  modification ? res.json({ modification }) : res.boom.notFound();
};

// TODO pagination
exports.list = async (req, res) =>
  res.json({ modifications: await Modification.find() });

// accept or reject
exports.update = async ({ params, body }, res) => {
  const modification = await Modification.findOne({ _id: params.id });
  if (!modification) return res.boom.notFound();

  // already processed
  if (modification.status !== 'pending') return res.boom.badRequest();

  switch (modification.verb) {
    case 'create':
      if (body.status === 'accepted') {
        const center = new Center({
          id: modification.centerId,
          ...modification.submittedCenter
        });
        await center.save();
      }
      break;

    case 'update': {
      const center = await Center.findOne({ id: modification.centerId });
      if (!center) return res.boom.notFound();

      if (body.status === 'accepted') {
        center.set(modification.submittedCenter);
        await center.save();
      }
      break;
    }

    case 'delete': {
      const center = await Center.findOne({ id: modification.centerId });
      if (!center) return res.boom.notFound();
      if (body.status === 'accepted') {
        await center.remove();
      }
      break;
    }

    default:
      return res.boom.badRequest();
  }

  modification.status = body.status;
  await modification.save();

  if (modification.notify && modification.email)
    sendModificationVerdictToGuest(
      modification,
      modification.email,
      modification.status
    );

  res.send('ok');
};
