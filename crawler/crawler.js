/**
 * Utility to retrieve a page, 
 * obtain information about it
 * process that information of it and links
 * and retrieve, process, from those links' content.
 */

var Q = require('q');
var REQUEST = require('request');
var FS = require('fs');

var minimalConfiguration = {
		baseurl : 'www.arkhamhorrorwiki.com',
		filenameToSaveData: '',
		primary: {
			location: '/Mythos',
			obtainDataFromHtml: function() {},
		},
		secondary: {
			obtainLinksFromData: function() {},
			obtainDataFromHtml: function() {},
			mergeData: function() {},
		},
};

/**
 * Merge to an object instance the options and
 * make sure it has the minimalConfiguration as
 * described by `minimalConfiguration` object structure
 *  
 * 
 * @param instance Object Instance
 * @param minimalConfiguration object
 * @param options object
 */
function mergeOptions(instance, minimalConfiguration, options) {
	// info must contains all keys and subkeys shown in minimalConfiguration
	Object.keys(minimalConfiguration).forEach(function(val,idx) {
		if(typeof options[idx] === 'undefined') {
			throw ("Crawler Constructor Undefined "+idx);
		}
		if(typeof val === 'Object') {
			Object.keys(val).forEach(function(v2,i2) {
				if(typeof options[idx][i2] === 'undefined') {
					throw ("Crawler Constructor: Undefined "+idx+" "+"i2");
				}
			});
		}
	});
	
	// copy options into this object
	Object.keys(options).forEach(function(val, idx) {
		instance[idx] = val;
	});
	
}

/**
 * @param options Object which must pass the minimalConfiguration
 */
var Crawler = function(options) {
	
	/**
	 * Main file
	 */
	this.process = function() {
		
		this.requestHtml(this.primary.location)
		.then(this.primary.obtainDataFromHtml)
		.then(this.secondary.obtainLinksFromData)
		.then(this.secondary.obtainDataFromHtml)
		.then(this.mergeData)
		.done(this.saveData);
	};
	
	this.htmlCacheDir = './html/';
	this.dataDir = './data/';

	/**
	 * Given a url address, a simple identifier.
	 * 
	 * In this case, whatever is at the right of '/'
	 * @return string which does not have any '/'
	 */
	this.getLastPart = function(url) {
		return url.split('/').slice(-1);
	}
	
	/**
	 * Transform an url address to a filename
	 * @return string which is a valid filename
	 */
	this.urlToCachingFilename = function(url) {
		return this.htmlCachedDir + this.getLastPart(url) +'.html';
	}
	
	this.requestHttp = function(url, filename) {
		return Q.nfcall(REQUEST, url).then(function(response) {
			if(response[0].status === '200') {
				return response[0].body;
			} else {
				return '';
			}
		});
	}
	
	/**
	 * Request a Promise for a Html content of url
	 * 
	 * @return {Promise}
	 */
	this.requestHtml = function(url) {
		var filename = this.urlToCachingFilename(url);
		return Q.nfcall(FS.exists, filename).then(function(exists) {
			if(exists) {
				return Q.nfcall(FS.readFile, filename);
			} else {
				return this.requestHttp(url, filename).then(function(html) {
					if(html) {
						FS.writeFile(filename, html);
					}
					return html;
				});
			}
		});
	}
	
	
	//mergeOptions(this, minimalConfiguration, options);
}

module.exports = {
		Crawler: Crawler,
		minimal: minimalConfiguration
}
