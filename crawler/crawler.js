/**
 * Utility to retrieve a page, obtain information about it process that
 * information of it and links and retrieve, process, from those links' content.
 */

var Q = require('q');
var REQUEST = require('request');
var FS = require('fs');

var minimalConfiguration = {
	baseurl : 'www.mybaseaddress.dev',
	filenameToSaveData : 'callItLikeThis.json',
	primary : {
		location : '/SomePart',
		obtainDataFromHtml : function(html) {
			return {}
		},
	},
	secondary : {
		obtainLinksFromData : function(data) {
			return [];
		},
		obtainDataFromHtml : function(html) {
			return {};
		},
		mergeData : function(primaryData, secondaryData) {
			return {
			};
		},
	},
};

/**
 * Merge to an object instance the options and make sure it has the
 * minimalConfiguration as described by `minimalConfiguration` object structure
 * 
 * 
 * @param instance
 *            Object Instance
 * @param minimalConfiguration
 *            object
 * @param options
 *            object
 */
function mergeOptions(instance, minimalConfiguration, options) {
	// info must contains all keys and subkeys shown in minimalConfiguration
	Object.keys(minimalConfiguration).forEach(
			function(key) {
				if (typeof options[key] === 'undefined') {
					throw ("Crawler Constructor Undefined " + val);
				}
				if (typeof minimalConfiguration[key] === 'Object') {
					Object.keys(minimalConfiguration[key]).forEach(
							function(key2) {
								if (typeof options[key][key2] === 'undefined') {
									throw ("Crawler Constructor: Undefined "
											+ key + " " + key2);
								}
							});
				}
			});

	// copy options into this object
	Object.keys(options).forEach(function(key) {
		instance[key] = options[key];
	});

}

/**
 * @param options
 *            Object which must pass the minimalConfiguration
 */
var Crawler = function(options) {

	/**
	 * Main file
	 */
	this.process = function() {
		var acc = {};
        var that = this;
		that.requestHtml('http://'+that.baseurl+that.primary.location).then(
				that.obtainPrimaryDataFromHtml(acc)).then(
				that.obtainLinksFromPrimaryData(acc)).then(
				that.transformLinksToAbsolute(acc)).then(
				that.obtainSecondaryDataFromSecondaryHtml(acc)).then(
				that.mergePrimaryAndSecondaryData(acc)).then(
                function(data) {
                    return that.saveData(data);
                })
				.catch(function(err) {
                    console.log('unknown error', err);
				})
				.done(function() {
					console.log('FINISHED !');
				});
	};

	this.obtainPrimaryDataFromHtml = function(acc) {
		var that = this;
		return function(html) {
			acc.primary = that.primary.obtainDataFromHtml(html);
			return '';
		};
	};
	this.obtainLinksFromPrimaryData = function(acc) {
		var that = this;
		return function() {
			acc.links = that.secondary.obtainLinksFromData(acc.primary);
			return '';
		};
	};
	this.transformLinksToAbsolute = function(acc) {
		var that = this;
		return function() {
			acc.absoluteLinks = [];
			acc.links.forEach(function(e, i) {
				acc.absoluteLinks[e] = 'http://'+that.baseurl.trim('/') + e;
			});
			return '';
		};
	};

	this.obtainSecondaryDataFromSecondaryHtml = function(acc) {
		var that = this;
		return function() {

            var result = {};
            var promises = Object.keys(acc.absoluteLinks).map(function(e) {
				return that.requestHtml(acc.absoluteLinks[e]).then(function(obj) {
					var res = that.secondary.obtainDataFromHtml(obj);
                    result[e]=res;
					return res;
				});
			});
            
            return Q.all(promises).then(function() {
				acc.secondary = result;
				return '';
			});
		};
	};

	this.mergePrimaryAndSecondaryData = function(acc) {
		var that = this;
		return function() {
            console.log(acc);
			var obj = that.secondary.mergeData(acc.primary, acc.secondary);
            console.log(obj)
            return obj;
		};
	};

	this.htmlCacheDir = 'html/';
	this.dataDir = '/data/';

	this.saveData = function(data) {
        var filename = this.getDataFilename();
        console.log('Saving output ',filename);
		return Q.nfcall(FS.writeFile, filename, JSON.stringify(data, null, 1));
	};


	/**
	 * Given a url address, a simple identifier.
	 * 
	 * In this case, whatever is at the right of '/'
	 * 
	 * @return string which does not have any '/'
	 */
	this.getLastPart = function(url) {
		return url.split('/').splice(-1);
	};

	/**
	 * Transform an url address to a filename
	 * 
	 * @return string which is a valid filename
	 */
	this.urlToCachingFilename = function(url) {
		return process.cwd()+'/'+this.htmlCacheDir + this.getLastPart(url) + '.html';
	};

    this.getDataFilename = function() {
        return process.cwd() + this.dataDir + this.filenameToSaveData;
    }

	this.requestHttp = function(url) {
		return Q.nfcall(REQUEST, url).then(function(response) {
			if (response[0].statusCode == 200) {
				console.log('got good response for '+url);
				return response[0].body;
			} else {
                FS.appendFile('output.log', JSON.stringify({url: url, response: response},null,1));
                console.log('failed http request to ',url);
				return '';
			}
		});
	};

	/**
	 * Request a Promise for a Html content of url
	 * 
	 * @return {Promise}
	 */
	this.requestHtml = function(url) {
		var filename = this.urlToCachingFilename(url);
		var that = this;
        
        return Q.nfcall(FS.readFile, filename).then(function(fileData) {
            return fileData;
        }, function(fileDoesNotExists) {
				return that.requestHttp(url).then(function(html) {
					if (html) {
                        console.log('writing...'+filename);
						FS.writeFile(filename, html);
					}
					return html;
				});
        });
	};

	mergeOptions(this, minimalConfiguration, options);
};

module.exports = {
	Crawler : Crawler,
	minimal : minimalConfiguration
};
