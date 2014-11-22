/**
 *
 */

var mythos = require('./mythos.js');
var Crawler = require('./../crawler/crawler.js').Crawler;

//require('q').longStackSupport = true;

var c = new Crawler(mythos.options);
c.process();


