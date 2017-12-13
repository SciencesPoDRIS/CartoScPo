#!/usr/bin/env node

// This script parse and adjust the content of data.json
// to populate the 'centers' collection in the mongodb

const path = require('path')

const DATA = path.join(__dirname, '../app/data/data.json')
const { allCenters: centers } = require(DATA)

const SCHEMA = path.join(__dirname, '../back-office/schema.json')
const { properties: schema } = require(SCHEMA)

const { Center } = require(path.join(__dirname, '../server/models'))

// new: old
const fixes = {
  cnrs: 'CNRS (Oui/Non)',
  menesr: 'MENESR (Oui/Non)',
  staff_url: 'Lien vers la page "personnel" sur le site Web du centre',
  staff_url_cnrs: 'Lien vers la page "personnel" du site Web du CNRS',
  topic_major: "Discipline principale  selon l'annuaire du MENESR",
  topic_minor: "Disciplines secondaires  selon l'annuaire du MENESR",
  subject_terms: "Mots-clés sujet  selon l'annuaire du MENESR",
  collections: "Collections auprès d'éditeurs (oui/non)",
  collections_titles: "Collections auprès d'éditeurs : description",
  journal: 'Revues en propre (oui/non)',
  journal_titles: 'Revues en propre : description',
  hal: 'Publications versées dans HAL (oui/non)',
  repository: 'Publications versées dans un dépôt institutionnel (oui/non)',
  oa_policy: 'Préconisations pour le dépôt en open access des publications',
  data_repository: 'Archivage des données de la recherche (oui/non)',
  data_projects:
    'Archivage des données de la recherche : description des projets',
}

// iterate through 'tabs' (administration, ecole, recherche…)
function findFieldValue(rawCenter, fieldId, { label, type }) {
  label = fixes[fieldId] || label
  let fieldValue = null
  Object.values(rawCenter).forEach(tab => {
    if (tab[label]) {
      switch (type) {
        case 'boolean':
          fieldValue = tab[label].toLowerCase() === 'oui'
          break

        case 'number':
          fieldValue = isNaN(tab[label]) ? null : Number(tab[label])
          break

        case 'string':
        case 'markdown':
        case 'url':
        case 'email':
        default:
          fieldValue = tab[label]
      }
    }
  })
  return fieldValue
}

function sanitize(rawCenter) {
  return Array.from(Object.entries(schema)).reduce(
    (c, [fieldId, fieldProps]) => {
      c[fieldId] = findFieldValue(rawCenter, fieldId, fieldProps)
      return c
    },
    { id: rawCenter.administration.id },
  )
}

function saveToMongo(cleanedCenter) {
  return new Center(cleanedCenter).save()
}

// let's go
Promise.all(
  Object.values(centers)
    .map(sanitize)
    .map(saveToMongo),
).then(console.log, console.error)
.then(() => process.exit())
