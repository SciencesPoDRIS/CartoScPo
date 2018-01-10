#!/usr/bin/env node

// This script parse and adjust the content of data.json
// to populate the 'centers' collection in the mongodb

const argv = process.argv.slice(2)
// danger!
const clearCenters = argv[0] === 'clear'

const path = require('path')

const DATA = path.join(__dirname, '../app/data/data.json')
const { allCenters: centers } = require(DATA)

const SCHEMA = path.join(__dirname, '../back-office/schema.json')
const { properties: schema } = require(SCHEMA)

const { Center } = require(path.join(__dirname, '../server/models'))

// new: old
const fixes = {
  name: 'Intitulé (centre ou unité de recherche)',
  cnrs: 'CNRS (Oui/Non)',
  menesr: 'MENESR (Oui/Non)',
  director_name: 'Directeur',
  staff_url: 'Lien vers la page "personnel" sur le site Web du centre',
  staff_url_cnrs: 'Lien vers la page "personnel" du site Web du CNRS',
  topic_major: "Discipline principale  selon l'annuaire du MENESR",
  topic_minor: "Disciplines secondaires  selon l'annuaire du MENESR",
  subject_terms: "Mots-clés sujet  selon l'annuaire du MENESR",
  hal: 'Publications versées dans HAL (oui/non)',
  repository: 'Publications versées dans un dépôt institutionnel (oui/non)',
  oa_policy: 'Préconisations pour le dépôt en open access des publications',
  thesis_number: 'Nombre de thèses soutenues en 2015', // year is different
  library: 'Centre de documentation ou bibliothèque en propre (oui/non)',
  library_name: 'Centre de documentation ou bibliothèque en propre : Intitulé',
}

const castBoolean = v => v.toLowerCase() === 'oui'

// iterate through 'tabs' (administration, ecole, recherche…)
function findFieldValue(rawCenter, fieldId, { label, type }) {
  label = fixes[fieldId] || label
  let fieldValue = null
  Object.values(rawCenter).forEach(tab => {
    if (tab[label]) {
      switch (type) {
        case 'boolean':
          fieldValue = castBoolean(tab[label])
          break

        case 'number':
          fieldValue = isNaN(tab[label]) ? null : Number(tab[label])
          break

        case 'string':
        case 'markdown':
        case 'url':
        case 'email':
        case 'tel':
        case 'person':
        default:
          fieldValue = tab[label]
      }
    }
  })
  return fieldValue
}

// handle sub schema, like 'schools' or 'addresses'
// this part is hardcoded considering the time budget of the project
function findArrayFieldValue(rawCenter, fieldId) {
  switch (fieldId) {
    case 'schools':
      return rawCenter.ecole.ecoles.map(ecole => ({
        number: ecole.numero,
        name: ecole.intitule,
        director_name: ecole.directeur,
        email: ecole.courriel,
      }))
    case 'affiliations':
      return rawCenter.administration['Etablissements de rattachement']
        .split('\r\n')
        .map(name => ({ name: name.replace('* ', '') }))
  }
}

// handle duo of a checkbox and a classic input, like "Collections auprès d'éditeurs"
// this part is hardcoded considering the time budget of the project
function findBooleanItemFieldValue(rawCenter, fieldId) {
  switch (fieldId) {
    case 'collections':
      return {
        enabled: castBoolean(
          rawCenter.publication["Collections auprès d'éditeurs (oui/non)"],
        ),
        titles:
          rawCenter.publication["Collections auprès d'éditeurs : description"],
      }
    case 'journal':
      return {
        enabled: castBoolean(
          rawCenter.publication['Revues en propre (oui/non)'],
        ),
        titles: rawCenter.publication['Revues en propre : description'],
      }
    case 'data_repository':
      return {
        enabled: castBoolean(
          rawCenter.publication[
            'Archivage des données de la recherche (oui/non)'
          ],
        ),
        projects:
          rawCenter.publication[
            'Archivage des données de la recherche : description des projets'
          ],
      }
  }
}

function sanitize(rawCenter) {
  return Array.from(Object.entries(schema)).reduce(
    (c, [fieldId, fieldProps]) => {
      switch (fieldProps.type) {
        case 'array':
          c[fieldId] = findArrayFieldValue(rawCenter, fieldId)
          break

        case 'boolean-item':
          c[fieldId] = findBooleanItemFieldValue(rawCenter, fieldId)
          break

        default:
          c[fieldId] = findFieldValue(rawCenter, fieldId, fieldProps)
          break
      }
      return c
    },
    { id: rawCenter.administration.id },
  )
}

function saveToMongo(cleanedCenter) {
  return new Center(cleanedCenter).save()
}

// let's go

if (clearCenters) {
  Center.remove({}, (err, { result }) =>
    console.log(`${result.n} centers deleted`),
  )
}

Promise.all(
  Object.values(centers)
    .map(sanitize)
    .map(saveToMongo),
)
  .then(console.log, console.error)
  .then(() => process.exit())
