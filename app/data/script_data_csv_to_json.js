#!/usr/bin/env node

var  Baby = require('babyparse'),
	 fs = require('fs'),
	 lodash = require('lodash');

// store csv (each onglet (cf google drive)) in object
var csv = { 
			administration : 'Donnees_centres_de_recherche_SP_2015 - Description administrative.csv',
			personnel : 'Donnees_centres_de_recherche_SP_2015 - Personnel.csv',
			ecole : 'Donnees_centres_de_recherche_SP_2015 - Ecoles doctorales.csv',
			recherche : 'Donnees_centres_de_recherche_SP_2015 - Thématiques de recherche.csv'
			};

// transform csv to json & push it in array
var allData = [];
lodash.forIn(csv, function (v, k) {
	
	var content = fs.readFileSync(v, { encoding: 'utf8' });
	var parsed = Baby.parse(content, { header: true });

	for (var i = 0, len = parsed.data.length; i < len; i++) {
		//create a reagex
		if (parsed.data[i]['Code Unité'] && parsed.data[i]['Code Unité'].length > 0) {
			var code = parsed.data[i]['Code Unité'].replace(' ', '');
			code = code.replace(/\t/g, '');
			code = code.replace(/\n/g, '');
			code = code.replace(/\r/g, '');
			code = code.replace(';', '');
			code = code.replace('        ', '');
			code = code.replace('\'', '');

			parsed.data[i].id = code.toLowerCase();
			
			parsed.data[i].theme = k;
		}
	}

	allData.push(parsed.data);
});
	
// transform array of center in list of center with Code Unité as key
 allData = lodash.flatten(allData);
 allData = lodash.groupBy(allData, 'id');

// transform array of onglet by center to list of object with onglet as key
function arrayToListofObj(array) {
	var obj = {};

	array.forEach(function (d) {	
		obj[d["theme"]] = d;
	})

	return obj;
}

var allCenters = {};
 lodash.forIn(allData, function (v, k) {
	k = k.replace(/ /g,'');
	k = k.replace(/;/g,'_');
 	allCenters[k] = arrayToListofObj(v);
 })


// create adress object of key administration (aka onlget description administration)
lodash.forIn(allCenters, function (v, k) {
	var adressesGeo = [];

	if (v.hasOwnProperty('administration')) {

		var adress = v.administration['Adresse(s)'].replace(/\n/g, '');
		adress = v.administration['Adresse(s)'].split(';');
		var coordinates = v.administration['Géolocalisation(s)'].split(';');
		var cities = v.administration['Ville'].split(';');

		// clean coordinate and transform to integer
		function clean(d) {
			// create a regex
			d = d.replace('(', '');
			d = d.replace(')', '');
			d = d.replace(/\n/g, '');
			d = d.split(',');
			d[0] = Number(d[0]);
			d[1] = Number(d[1]);

			return d;
		}

		coordinates = lodash.map(coordinates, clean);

		for (var i = 0, len = adress.length; i < len; i++) {
			adressesGeo.push({
				adresse: adress[i],
				lat: coordinates[i][0],
				lon: coordinates[i][1],
				city: cities[i]
			})
		}
	v.administration.adressesGeo = adressesGeo;
	}

	// clean recherche data
	var recherche = {};

	 lodash.forIn(v.recherche, function (v, k) {
		k = k.replace(/\n/g,'');
		k = k.replace(/\*/g,' ');
		v = v.replace(/\n/g,'');
		if (v.indexOf(';') !== -1)
			v = v.split(';');
		recherche[k] = v;
	})

	v.recherche = recherche;

})


// convert to json
allCenters = JSON.stringify(allCenters);

// write data in file
fs.writeFile('data.json', allCenters);

