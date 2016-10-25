#!/usr/bin/env node

var  Baby = require('babyparse'),
	 fs = require('fs'),
	 lodash = require('lodash');

// store csv (each onglet (cf google drive)) in object
var csv = {
			administration : 	'Donnees_centres_de_recherche_SP_2015 - Description administrative.csv',
			personnel : 		'Donnees_centres_de_recherche_SP_2015 - Personnel.csv',
			ecole : 			'Donnees_centres_de_recherche_SP_2015 - Ecoles doctorales.csv',
			recherche : 		'Donnees_centres_de_recherche_SP_2015 - Thématiques de recherche.csv',
			publication: 		'Donnees_centres_de_recherche_SP_2015 - Publications.csv',
			ressources: 		'Donnees_centres_de_recherche_SP_2015 - Ressources documentaires.csv'
		};

/*
 * Transform csv to json & push it in array
 */
var allData = [];
lodash.forIn(csv, function (v, k) {
	
	var content = fs.readFileSync(v, { encoding: 'utf8' });
	var parsed = Baby.parse(content, { header: true });

	for (var i = 0, len = parsed.data.length; i < len; i++) {
		//create a reagex
		if (parsed.data[i]['Code Unité'] && parsed.data[i]['Code Unité'].length > 0) {
			var code = parsed.data[i]['Code Unité'].replace(' ', '');

			//need regex
			code = code.replace(/\t/g, '');
			code = code.replace(/\n/g, '');
			code = code.replace(/\r/g, '');
			code = code.replace(/;/g, '');
			code = code.replace('        ', '');
			code = code.replace('\'', '');
            code = code.replace(/ /g, '');

			parsed.data[i].id = code.toLowerCase();

			parsed.data[i].theme = k;
		}
	}

	allData.push(parsed.data);
});

console.log("csv parsed");


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

// clean data
var allCenters = {};
 lodash.forIn(allData, function (v, k) {
	k = k.replace(/ /g,'');
	k = k.replace(/;/g,'_');
 	allCenters[k] = arrayToListofObj(v);
 })


/*
 * create adress object of key administration (aka onlget description administration)
 */ 
lodash.forIn(allCenters, function (v, k) {
	var adressesGeo = [],
		ecoles = [];

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

	if (v.hasOwnProperty('administration')) {
		var adress = v.administration['Adresse(s)'].replace(/\n/g, '');
		adress = v.administration['Adresse(s)'].split(';');
		var coordinates = v.administration['Géolocalisation(s)'].split(';');
		var cities = v.administration['Ville'].split(';');

		// clean coordinate and transform to integer
		coordinates = lodash.map(coordinates, clean);

		// create object adress
		for (var i = 0, len = adress.length; i < len; i++) {
			adressesGeo.push({
				adresse: adress[i],
				lat: coordinates[i][0],
				lon: coordinates[i][1],
				city: cities[i],
				active: true
			})
		}

		v.administration.adressesGeo = adressesGeo;
	}

	if (v.hasOwnProperty('ecole')) {

		var numeroEcole = v.ecole['Numéro de l\'Ecole Doctorale'].split(';')
		 	intituleEcole = v.ecole['Intitulé de l\'Ecole Doctorale'].split(';'),
		 	directeurEcole = v.ecole['Directeur de l\'Ecole Doctorale'].split(';'),
		 	courrielEcole = v.ecole['Courriel de l\'Ecole doctorale'].split(';');

		// create object adress
		for (var i = 0, len = numeroEcole.length; i < len; i++) {
			numeroEcole[i] = numeroEcole[i].replace(/\n/g, '');
			if (intituleEcole[i])
				intituleEcole[i] = intituleEcole[i].replace(/\n/g, '');
			if (directeurEcole[i])
				directeurEcole[i] = directeurEcole[i].replace(/\n/g, '');
			if (courrielEcole[i])
				courrielEcole[i] = courrielEcole[i].replace(/\n/g, '');

			ecoles.push({
				numero: numeroEcole[i],
				intitule: intituleEcole[i],
				directeur: directeurEcole[i],
				courriel: courrielEcole[i]
			})
		}

		
		v.ecole.ecoles = ecoles;
	}

	// clean recherche data
	var recherche = {};

	lodash.forIn(v.recherche, function (v, k) {
		k = k.replace(/\n/g,'');
		k = k.replace(/\*/g,' ');
		// v = v.replace(/\n/g,'');
		// if (v.indexOf(';') !== -1)
		// 	v = v.split(';');
		recherche[k] = v;
	})

	v.recherche = recherche;
});

console.log("allCenters Done");

// clean allWords function -> huge regex ;)
function cleanWord(content) {
	content = content.replace(/ /gi , ' ');
	content = content.replace(/\,/gi , ' ');
	content = content.replace(', ' , ' ');
	content = content.replace(/,/g , ' ');
	content = content.replace(/\:/gi , ' ');
	content = content.replace(': ' , ' ');
	content = content.replace(/\;/gi , ' ');
	content = content.replace('; ' , ' ');
	content = content.replace('-' , ' ');
	content = content.replace('(' , ' ');
	content = content.replace(/\)/gi, ' ');
	content = content.replace('\n' , ' ');
	content = content.replace('\/' , ' ');
	content = content.replace(/#/gi , ' ');
	content = content.replace(/\./gi , ' ');
	//content = content.replace(/\*/gi , ' ');

	return content;
}

// create list of all words 
var allWords = [];
lodash.forIn(allCenters, function(tab, center) {
	lodash.forIn(tab, function(contentTab, tabName){
		lodash.forIn(contentTab, function(content, prop){
			
			if (Array.isArray(content) && prop !== 'adressesGeo') {

				var arrayContent = '';

				lodash.forEach(content, function (d) {
					// create a long string of all axes
					arrayContent = arrayContent + ' ' + d + ' ';
				})
				arrayContent = cleanWord(arrayContent);
				arrayContent = arrayContent.toLowerCase();
				arrayContent = arrayContent.split(' ');
				allWords = allWords.concat(arrayContent);
			}
			else if (prop === 'Intitulé (centre ou unité de recherche)'
				|| prop === 'Sigle ou acronyme'
				|| prop === 'Ville' 
				|| prop === 'Etablissements de rattachement'
				|| prop === 'Axes de recherche'
				|| prop === 'Acronyme (nom court)' 
				) {

				content = cleanWord(content);
				content = content.toLowerCase();
				content = content.split(' ');

				allWords = allWords.concat(content);
			}
		})
	})
});

allWords = lodash.uniq(allWords);
allWords = allWords.filter(function (d) {
	return d.length > 2;
});

console.log("list of all words in data created");

// create slug for all props -> to script csv to json
var allProps = [];
lodash.forIn(allCenters, function(tab, center) {
	
	lodash.forIn(tab, function(contentTab, tabName){
		
		lodash.forIn(contentTab, function(content, prop){
			if (prop === 'Intitulé (centre ou unité de recherche)' || prop === 'Sigle ou acronyme' || prop === 'Ville' || prop === 'Etablissements de rattachement' || prop === 'Axes de recherche' || prop === 'Acronyme (nom court)') {

				var id = center + '_' + tabName + '_' + prop;

				if (Array.isArray(content)) {
					lodash.forEach(content, function(d) {
						allProps.push({content: d, id: id });
					})
				}
				allProps.push({content: content, id: id });
			}
		})
	})
});

console.log("allProps created");

//Create object with allCenters, allWords & index
var data = {};
data.allCenters = allCenters;
data.allWords = allWords;
data.allProps = allProps; 

data = JSON.stringify(data);

console.log("allCenters stringify");
console.log("There are : ", lodash.size(allCenters), " unique centers.");
console.log("There are : ", allWords.length, " unique words.");
console.log("There are : ", allProps.length, " unique contents indexed.");

//write data in file
fs.writeFile('data.json', data);

