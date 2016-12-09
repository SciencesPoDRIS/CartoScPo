#!/usr/bin/env node

var Baby = require('babyparse');
var fs = require('fs');
var lodash = require('lodash');

// store csv (each onglet (cf google drive)) in object
var csvs = {
  administration: 'Donnees_centres_de_recherche_SP_2015 - Description administrative.csv',
  personnel:      'Donnees_centres_de_recherche_SP_2015 - Personnel.csv',
  ecole:          'Donnees_centres_de_recherche_SP_2015 - Ecoles doctorales.csv',
  recherche:      'Donnees_centres_de_recherche_SP_2015 - Thématiques de recherche.csv',
  publication:    'Donnees_centres_de_recherche_SP_2015 - Publications.csv',
  ressources:     'Donnees_centres_de_recherche_SP_2015 - Ressources documentaires.csv'
};

/* structure we want to obtain:
{
  "centerId": {
    // raw (but cleaned)
    administration: {…},
    personnel: {…}
    …
  }
}
*/

function trimNL (str) {
  return str
    .replace(/^[\t|\r|\n]/g, '')
    .replace(/[\t|\r|\n]$/g, '')
    .trim();
}

// primary key
// examples of returned ids: 'ea7033', 'fre3706', 'umr3320'
var KEY_CODE = 'Code Unité';
var RE_CODE = /([a-zA-Z]+)\s*([0-9]+)/;
function getCenterId (code) {
  var m = RE_CODE.exec(code);
  return (m[1] + m[2]).toLowerCase();
}

// csv to JSON

function getAllData (csvs) {
  return lodash.map(csvs, function (v, csv) {
    var content = fs.readFileSync(v, { encoding: 'utf8' });
    // columns names are in parsed.meta.fields
    var parsed = Baby.parse(content, { header: true });

    return parsed.data.map(function (center) {
      delete center[''];
      Object.keys(center).forEach(function (key) {
        center[key] = trimNL(center[key]);
      });
      // temp, used for grouping
      center.id = getCenterId(center[KEY_CODE]);
      center.csv = csv;
      return center;
    });
  });
}

// transform array of centers in list of centers with clean Code Unité as key
var allData = lodash.flatten(getAllData(csvs));
allData = lodash.groupBy(allData, 'id');

var allCenters = {};
lodash.forIn(allData, function (lines, centerId) {
  allCenters[centerId] = lines.reduce(function (acc, line) {
    var csv = line.csv;
    // remove groupng helpers
    delete line.csv;
    // delete line.id;
    acc[csv] = line;
    return acc;
  }, {});
});
console.log('csv parsed', 'centerIds', Object.keys(allCenters).sort());

var RE_COORDS = /(\-?\d+\.\d+),\s*(\-?\d+\.\d+)/;
function getCoords (str) {
  var m = RE_COORDS.exec(str)
  return [Number(m[1]), Number(m[2])];
}

function trimStar(str) {
  if (!str) return '';
  return str.replace(/\*/, '').trim();
}

// create address object of key administration (aka onglet description administration)
lodash.forIn(allCenters, function (v) {
  if (v['administration']) {
    var addresses = v.administration['Adresse(s)'].split(';');
    var coordinates = v.administration['Géolocalisation(s)'].split(';').map(getCoords);
    var cities = v.administration['Ville'].split(';');

    v.administration.addressesGeo = addresses.map(function (a, i) {
      return {
        address: trimNL(a),
        lat: coordinates[i][0],
        lon: coordinates[i][1],
        city: trimNL(cities[i]),
        active: true
      };
    });
  }

  if (v['ecole']) {
    var numeroEcoles = v.ecole['Numéro de l\'Ecole Doctorale'].split(/;|\n/);
    var intituleEcoles = v.ecole['Intitulé de l\'Ecole Doctorale'].split(/;|\n/);
    var directeurEcoles = v.ecole['Directeur de l\'Ecole Doctorale'].split(/;|\n/);
    var courrielEcoles = v.ecole['Courriel de l\'Ecole doctorale'].split(/;|\n/);

    v.ecole.ecoles = numeroEcoles
      .filter(function (n) {
        return n && n !== 'X';
      })
      .map(function (n, i) {
        // console.log(n, intituleEcoles[i], directeurEcoles[i], courrielEcoles[i])
        return {
          numero: trimStar(n),
          intitule: trimStar(intituleEcoles[i]),
          directeur: trimStar(directeurEcoles[i]),
          courriel: trimStar(courrielEcoles[i])
        };
      });
  }

  // clean recherche data
  var recherche = {};

  lodash.forIn(v.recherche, function (v, k) {
    k = k.replace(/\n/g, '');
    k = k.replace(/\*/g, ' ');
    // v = v.replace(/\n/g,'');
    // if (v.indexOf(';') !== -1)
    // 	v = v.split(';');
    recherche[k] = v;
  });

  v.recherche = recherche;
});

console.log('allCenters Done');

// clean allWords function -> huge regex ;)
function cleanWord(content) {
  return content.replace(/ /g , ' ')
    .replace(/\,|\:|\;/g , ' ')
    .replace(', ' , ' ')
    .replace(/,/g , ' ')
    .replace(': ' , ' ')
    .replace('; ' , ' ')
    .replace('-' , ' ')
    .replace('(' , ' ')
    .replace(/\)/g, ' ')
    .replace(/\n|\r/g , ' ')
    .replace('\/' , ' ')
    .replace(/#/g , ' ')
    .replace(/\./g , ' ')
    .replace(/[cdl]['’]/g , '')
    .toLowerCase();
}

// create list of all words
// TODO: this should be elasticlunr stemmer's role to do it.
var allWords = [];
lodash.forIn(allCenters, function(tab) {
  lodash.forIn(tab, function(contentTab) {
    lodash.forIn(contentTab, function(content, prop) {
      if (Array.isArray(content) && prop !== 'addressesGeo') {
        var arrayContent = '';
        lodash.forEach(content, function (d) {
          // create a long string of all axes
          arrayContent = arrayContent + ' ' + d + ' ';
        });
        arrayContent = cleanWord(arrayContent).split(' ');
        allWords = allWords.concat(arrayContent);
      }
      else if (prop === 'Intitulé (centre ou unité de recherche)'
          || prop === 'Sigle ou acronyme'
          || prop === 'Ville'
          || prop === 'Etablissements de rattachement'
          || prop === 'Axes de recherche'
          || prop === 'Acronyme (nom court)'
          ) {

        content = cleanWord(content).split(' ');
        allWords = allWords.concat(content);
      }
    });
  });
});

allWords = lodash.uniq(allWords).filter(function (d) {
  return d.length > 2;
}).sort();

console.log('list of all words in data created');

// create slug for all props -> to script csv to json
var allProps = [];
lodash.forIn(allCenters, function(tab, center) {
  lodash.forIn(tab, function(contentTab, tabName){
    lodash.forIn(contentTab, function(content, prop){
      if (prop === 'Intitulé (centre ou unité de recherche)'
       || prop === 'Sigle ou acronyme'
       || prop === 'Ville'
       || prop === 'Etablissements de rattachement'
       || prop === 'Axes de recherche'
       || prop === 'Acronyme (nom court)') {
        var id = center + '_' + tabName + '_' + prop;

        if (Array.isArray(content)) {
          lodash.forEach(content, function(d) {
            allProps.push({content: d, id: id });
          });
        }
        allProps.push({content: content, id: id });
      }
    });
  });
});

console.log('allProps created');

var data = {
  allCenters: allCenters,
  allWords: allWords,
  allProps: allProps
};

console.log('There are : ', lodash.size(allCenters), ' unique centers.');
console.log('There are : ', allWords.length, ' unique words.');
console.log('There are : ', allProps.length, ' unique contents indexed.');

fs.writeFile('data.json', JSON.stringify(data, null, 2));

