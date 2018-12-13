const path = require('path');
const _ = require('lodash');
const { createPatch } = require('rfc6902');
const { Center, Modification, sanitizeCenter } = require('../models');
const {
  sendModificationToAdmins,
  sendModificationConfirmationToGuest
} = require('../mailer');

exports.get = async ({ params }, res) => {
  const center = await Center.findOne({ id: params.id });
  center ? res.json({ center }) : res.boom.notFound();
};

exports.list = async (req, res) => {
  res.json({ centers: await Center.find() });
};

const createModificationAndSendEmails = async (
  centerId,
  oldCenter,
  submittedCenter,
  email,
  verb
) => {
  const m = new Modification({
    centerId,
    oldCenter,
    submittedCenter,
    email,
    notify: Boolean(email),
    verb
  });
  await m.save();
  sendModificationToAdmins(m);
  if (email) sendModificationConfirmationToGuest(m, email);
};

exports.create = async ({ body, user }, res) => {
  const submittedCenter = sanitizeCenter(body.center);

  if (user) {
    try {
      const center = new Center(body.center);
      await center.save();
      const m = new Modification({
        centerId: body.center.id,
        oldCenter: {},
        submittedCenter,
        email: user.email,
        notify: false,
        status: 'accepted',
        verb: 'create'
      });
      m.save();
      res.send('ok');
    } catch (err) {
      return res.boom.badRequest();
    }
  } else {
    await createModificationAndSendEmails(
      body.center.id,
      {},
      submittedCenter,
      body.email,
      'create'
    );
    res.send('ok');
  }
};

exports.update = async ({ params, body, user }, res) => {
  const center = await Center.findOne({ id: params.id });
  if (!center) return res.boom.notFound();

  const oldCenter = sanitizeCenter(center.toJSON());
  const submittedCenter = sanitizeCenter(body.center);

  // don't create an empty modif
  const diffs = createPatch(oldCenter, submittedCenter);
  if (!diffs.length) return res.boom.badRequest('no-diffs');

  if (user) {
    try {
      // auto-accept but create a modif as a log
      center.set(submittedCenter);
      await center.save();
      const m = new Modification({
        centerId: params.id,
        oldCenter,
        submittedCenter,
        email: user.email,
        notify: false,
        status: 'accepted',
        verb: 'update'
      });
      await m.save();
      res.send('ok');
    } catch (err) {
      // mainly validation errors that should not happen in regular scenarii
      // since the angular form should block the submission
      return res.boom.badRequest();
    }
  } else {
    await createModificationAndSendEmails(
      params.id,
      oldCenter,
      submittedCenter,
      body.email,
      'update'
    );
    res.send('ok');
  }
};

exports.delete = async ({ params, body, user }, res) => {
  const center = await Center.findOne({ id: params.id });
  if (!center) return res.boom.notFound();

  const oldCenter = sanitizeCenter(center.toJSON());
  const submittedCenter = {};

  if (user) {
    await Center.remove({ id: params.id });
    const m = new Modification({
      centerId: params.id,
      oldCenter,
      submittedCenter,
      email: user.email,
      notify: false,
      status: 'accepted',
      verb: 'delete'
    });
    await m.save();
  } else {
    await createModificationAndSendEmails(
      params.id,
      oldCenter,
      submittedCenter,
      body.email,
      'delete'
    );
  }
  res.send('ok');
};

// this should roughly respect the same output than app/data/script_data_csv_to_json.js
exports.export = async (req, res) => {
  const centers = (await Center.find()).filter(c => !c.hidden);
  const words = getWords(centers);
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.send({ centers, words });
};

exports.uploadLogo = async ({ params, files }, res) => {
  if (!files) return res.boom.badRequest('No files to handle');

  const center = await Center.findOne({ id: params.id });
  if (!center) return res.boom.notFound('No center found with this Id');

  const { file } = files;
  if (!file) return res.boom.badRequest();

  try {
    await file.mv(
      path.resolve(`${__dirname}/../../app/img/logos/${center.id}.jpeg`)
    );
    res.send('ok');
  } catch (ex) {
    return res.boom.badRequest("Can't move file");
  }
};

// TODO: this should be elasticlunr stemmer's role to do it, on the client side
const keysList = [
  'acronym',
  'name',
  'addresses',
  'affiliations',
  'research_areas'
];
function getWords(centers) {
  var words = [];
  centers.forEach(c => {
    Object.keys(c.toJSON()).forEach(k => {
      let content = c[k];
      if (!keysList.includes(k)) return;

      if (Array.isArray(content)) {
        if (k === 'addresses') {
          content = content.map(c => c.address).join(' ');
        }
        if (k === 'affiliations') {
          content = content.map(c => c.name).join(' ');
        }
      }
      content = cleanWord(content).split(' ');
      words = words.concat(content);
    });
  });

  words = _.uniq(words)
    .filter(w => w.length > 2)
    .sort();
  return words;
}

function cleanWord(content) {
  if (typeof content !== 'string') return '';
  return content
    .replace(/ /g, ' ')
    .replace(/\,|\:|\;/g, ' ')
    .replace(', ', ' ')
    .replace(/,/g, ' ')
    .replace(': ', ' ')
    .replace('; ', ' ')
    .replace('-', ' ')
    .replace('(', ' ')
    .replace(/\)/g, ' ')
    .replace(/\n|\r/g, ' ')
    .replace('/', ' ')
    .replace(/#/g, ' ')
    .replace(/\./g, ' ')
    .replace(/[cdl]['’]/g, '')
    .toLowerCase();
}
