/**
 * @file Process data with location information and outputs 
 * a cleaned json
 */

var locationJson = require('./../datae/raw_Location.json');
var processRawLocationData = require('./processRawLocationData');

var clean = processRawLocationData(locationJson);

var fs = require('fs');
var filename = './output/locationNoExpansion.json' 
fs.writeFile(filename, JSON.stringify(clean,null,1));
console.log('Output written on '+filename);

