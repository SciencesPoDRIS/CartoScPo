#!/usr/bin/env node

// This script parse and adjust the content of data.json
// to populate the 'centers' collection in the mongodb

const path = require('path');
const { argv } = require('yargs');

const clearCenters = argv.clear || argv.c;
const updateCenters = argv.update || argv.u;
const dryRun = argv.dry || argv.d;

const dataPath = argv.path || argv.p || path.join(__dirname, '../app/data');

const DATA = dataPath + '/data.json';
const { allCenters: centers } = require(DATA);

const SCHEMA = path.join(__dirname, '../back-office/schema.json');
const { properties: schema } = require(SCHEMA);

const { Center } = require(path.join(__dirname, '../server/models'));

// new: old
const fixes = {
  name: 'Intitulé (centre ou unité de recherche)',
  cnrs: 'CNRS (Oui/Non)',
  menesr: 'MENESR (Oui/Non)',
  director_name: 'Directeur',
  staff_url: 'Lien vers la page "personnel" sur le site Web du centre',
  staff_url_cnrs: 'Lien vers la page "personnel" du site Web du CNRS',
  topic_major: 'Discipline principale  selon l\'annuaire du MENESR',
  topic_minor: 'Disciplines secondaires  selon l\'annuaire du MENESR',
  subject_terms: 'Mots-clés sujet  selon l\'annuaire du MENESR',
  hal: 'Publications versées dans HAL (oui/non)',
  repository: 'Publications versées dans un dépôt institutionnel (oui/non)',
  oa_policy: 'Préconisations pour le dépôt en open access des publications',
  thesis_number: 'Nombre de thèses soutenues en 2015', // year is different
  library_name: 'Centre de documentation ou bibliothèque en propre : Intitulé',
  library_description:
    'Centre de documentation ou bibliothèque en propre : description et fonds spécifiques',
  information_skills_training: 'Offre de formations documentaires',
  libraries_network_list:
    'Collaborations documentaires (Couperin, ISORE, participations aux réseaux IST...)',
  national_structure_number: 'Numero_National_de_Structure',
  rnsr_url: 'Lien_RNSR',
  scanr_url: 'Lien_ScanR',
  wikidata: 'wikidata',
  wikipedia_url: 'Lien_wikipedia',
  update_date: 'Date de mise à jour'
};

const castBoolean = v => v.toLowerCase() === 'oui' || v.toLowerCase() === 'ok';

const castString = v =>
  v.trim().toLowerCase() === 'x' ? null : v.trim() === '' ? null : v;

// to avoid false positive during json diff when a modification
// is submitted and a field was not explicitely "touched by the user" ref: #53
function crlfToLf(value) {
  // also trim lines (useful in list)
  return typeof value === 'string' ? value.replace(/ *\r\n/g, '\n') : value;
}

// iterate through 'tabs' (administration, ecole, recherche…)
function findFieldValue(rawCenter, fieldId, { label, type }) {
  label = fixes[fieldId] || label;
  let fieldValue = null;
  Object.values(rawCenter).forEach(tab => {
    if (tab[label]) {
      switch (type) {
      case 'boolean':
        fieldValue = castBoolean(tab[label]);
        break;

      case 'number':
        fieldValue = isNaN(tab[label]) ? null : Number(tab[label]);
        break;

      case 'string':
      case 'markdown':
      case 'url':
      case 'email':
      case 'tel':
      case 'address':
      case 'coords':
      case 'person':
      default:
        fieldValue = castString(tab[label]);
      }
    }
  });
  return crlfToLf(fieldValue);
}

// handle sub schema, like 'schools' or 'addresses'
// this part is hardcoded considering the time budget of the project
function findArrayFieldValue(rawCenter, fieldId) {
  switch (fieldId) {
  case 'addresses':
    return rawCenter.administration.addressesGeo.map(addr => ({
      city: addr.city,
      address: addr.address,
      latitude: addr.lat,
      longitude: addr.lon
    }));

  case 'schools':
    return rawCenter.ecole.ecoles.map(ecole => ({
      number: ecole.numero,
      name: ecole.intitule,
      director_name: ecole.directeur,
      email: ecole.courriel
    }));

  case 'affiliations':
    return crlfToLf(
      rawCenter.administration['Etablissements de rattachement']
    )
      .split('\n')
      .map(name => ({ name: name.replace('* ', '') }));

  case 'phones':
    return crlfToLf(rawCenter.administration['Téléphone'])
      .split('\n')
      .map(number => ({ number }));
  }
}

// handle duo of a checkbox and a classic input, like "Collections auprès d'éditeurs"
// this part is hardcoded considering the time budget of the project
function findBooleanItemFieldValue(rawCenter, fieldId) {
  switch (fieldId) {
  case 'collections':
    return {
      enabled: castBoolean(
        rawCenter.publication['Collections auprès d\'éditeurs (oui/non)']
      ),
      titles: crlfToLf(
        rawCenter.publication['Collections auprès d\'éditeurs : description']
      )
    };

  case 'library':
    return {
      enabled: castBoolean(
        rawCenter.ressources[
          'Centre de documentation ou bibliothèque en propre (oui/non)'
        ]
      ),
      titles: crlfToLf(
        rawCenter.ressources[
          'Centre de documentation ou bibliothèque en propre : Intitulé'
        ]
      ),
      url: rawCenter.ressources['Site Web']
    };

  case 'journal':
    return {
      enabled: castBoolean(
        rawCenter.publication['Revues en propre (oui/non)']
      ),
      titles: crlfToLf(
        rawCenter.publication['Revues en propre : description']
      )
    };

  case 'data_repository':
    return {
      enabled: castBoolean(
        rawCenter.publication[
          'Archivage des données de la recherche (oui/non)'
        ]
      ),
      projects: crlfToLf(
        rawCenter.publication[
          'Archivage des données de la recherche : description des projets'
        ]
      )
    };
  }
}

// like Section CNRS
function findCheckListFieldValue(rawCenter, fieldId) {
  switch (fieldId) {
  case 'cnrs_sections':
    return (
      crlfToLf(rawCenter.recherche['Sections CNRS'])
        .split('\n')
      // remove star
        .map(s => s.slice(2))
    );
  }
}

function sanitize(rawCenter) {
  return Array.from(Object.entries(schema)).reduce(
    (sanitizedCenter, [fieldId, fieldProps]) => {
      switch (fieldProps.type) {
      case 'array':
        sanitizedCenter[fieldId] = findArrayFieldValue(rawCenter, fieldId);
        break;

      case 'boolean-item':
        sanitizedCenter[fieldId] = findBooleanItemFieldValue(
          rawCenter,
          fieldId
        );
        break;

      case 'check-list':
        sanitizedCenter[fieldId] = findCheckListFieldValue(
          rawCenter,
          fieldId
        );
        break;

      default: {
        // here, hidden is the special field indicating if the center
        // should be visible on the FO. So false by default
        let value =
            fieldId === 'hidden'
              ? false
              : findFieldValue(rawCenter, fieldId, fieldProps);
          // attempt to fix with a dummy value to pass mongoose validation
        if (fieldProps.required && value === null) {
          // eslint-disable-next-line no-console
          console.error(
            'wrong value',
            rawCenter.administration.id,
            fieldId,
            fieldProps.type,
            value
          );
          if (fieldProps.type === 'number') value = 0;
          if (fieldProps.type === 'tel') value = 0;
        }
        if (
          value === 'X' &&
            (fieldId === 'url' || fieldId === 'staff_url_cnrs')
        )
          value = '';
        sanitizedCenter[fieldId] = value;
        break;
      }
      }
      return sanitizedCenter;
    },
    { id: rawCenter.administration.id }
  );
}

function saveToMongo(cleanedCenter) {
  if (dryRun) {
    console.log('dry run: nothing is saved in mongo'); // eslint-disable-line no-console
    return cleanedCenter;
  }

  const create = () => {
    console.log('creating…', cleanedCenter.id, cleanedCenter.code); // eslint-disable-line no-console
    return new Center(cleanedCenter).save();
  };

  const update = found => {
    console.log('updating…', cleanedCenter.id, cleanedCenter.code); // eslint-disable-line no-console
    for (let key in cleanedCenter) {
      found[key] = cleanedCenter[key];
    }
    return found.save();
  };

  if (updateCenters) {
    return Center.findOne({ id: cleanedCenter.id }).then(found =>
      found ? update(found) : create()
    );
  }

  return create();
}

// let's go

if (clearCenters) {
  Center.remove(
    {},
    (err, { result }) => console.log(`${result.n} centers deleted`) // eslint-disable-line no-console
  );
}

Promise.all(
  Object.values(centers)
    .map(sanitize)
    .map(saveToMongo)
)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(
      `Saved ${Object.keys(centers).length} centers: ${Object.keys(centers)}.`
    );
    process.exit();
  })
  .catch(err => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
