#!/usr/bin/env node

const { readFile, writeFile } = require('fs');
const { join } = require('path');
const { parse } = require('babyparse');

readFile(join(__dirname, 'metadata.csv'), 'utf8', (err, content) => {
  if (err) throw err;

  const { data } = parse(content, { header: true });
  writeFile(
    join(__dirname, 'metadata.json'),
    JSON.stringify(data, null, 2),
    err => {
      if (err) throw err;
    }
  );
});
