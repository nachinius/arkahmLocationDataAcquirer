/**
 * New node file
 */

var monsters = require('./monsters.js');
var Crawler = require('./../crawler/crawler.js').Crawler;

//require('q').longStackSupport = true;

var c = new Crawler(monsters.options);
c.process();


