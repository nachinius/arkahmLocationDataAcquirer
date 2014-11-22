/**
 *
 */

var mCrawler = require('./crawler');
var q = require('q').longStackSupport =true;

var crawler = new mCrawler.Crawler(mCrawler.minimal);

crawler.requestHttp('http://www.arkhamhorrorwiki.com/Mythos').done(function() {
	console.log('done');
});

