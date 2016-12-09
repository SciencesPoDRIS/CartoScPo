#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var Baby = require('babyparse');

fs.readFile(path.join(__dirname, 'metadata.csv'), 'utf8', function (err, content) {
  if (err) throw err;

  var parsed = Baby.parse(content, { header: true });
  fs.writeFile(path.join(__dirname, 'metadata.json'), JSON.stringify(parsed.data, null, 2));
});
