#!/usr/bin/env node

// This script generates data.json from the `centers` collection

const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '../app/data/data.json')
const data = require(DATA)

const { Center } = require(path.join(__dirname, '../server/models'))

// TODO
Center.find().then(centers => {
  data.allCenters = centers
  fs.writeFile(path.join(__dirname, '../app/data/data2.json'), JSON.stringify(data), () => process.exit())
})
