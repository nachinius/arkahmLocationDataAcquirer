/**
 * New node file
 */

var otherWorlds = require('./otherWorlds.js');
var Crawler = require('./../crawler/crawler.js').Crawler;

//require('q').longStackSupport = true;

var c = new Crawler(otherWorlds.options);
c.process();


