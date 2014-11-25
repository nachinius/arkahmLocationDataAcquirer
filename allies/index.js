/**
 * New node file
 */

var allies = require('./allies.js');
var Crawler = require('./../crawler/crawler.js').Crawler;

//require('q').longStackSupport = true;

var c = new Crawler(allies.options);
c.process();


