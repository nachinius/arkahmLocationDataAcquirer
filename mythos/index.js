/**
 * New node file
 */
var fs = require('fs');

var getter = function() {
	
	this.urlToDataFilename = function(url) {
		var parts = url.split('/');
		var last = parts.slice(-1);
		return 'data/raw_'+last+'.json';
	}
	
	this.urlToFilename = function(url) {
		var parts = url.split('/');
		var last = parts.slice(-1);
		return 'html/'+last+'.html';
	};
	
	this.saveDataToFile(filename, data, cbk) {
		if(typeof data != 'string') {
			data = JSON.stringify(data, null, 1);
		}
		fs.writeFile(filename, data, cbk);
	}

	/**
	 * Performes a http request to `url`, save it in `filename` and use `cbk` to
	 * process and transform the obtained `html`
	 * 
	 * @param url
	 *            to retrieve
	 * @param filename
	 *            to use for caching
	 * @param cbk
	 *            Function that process the html
	 */
	this.performRequest(url, filename, cbk) {
		request(url, function(error, response, html) {
			if (!error) {
				console.log('receiving <--'+url,'saving-->'+filename);
				fs.writeFile(filename, html);
			}
			cbk(error, html);
		});
	}
	
	
	this.getAndProcess = function(url, filename, callback) {		
		// Run from cache or get it
		if (fs.existsSync(filename)) {
			console.log('reading from file...',filename);
			fs.readFile(filename, callback);
		} else {
			console.log('performing request...',url,filename);
			performRequest(url, filename, callback);
		}
	}
	
	this.paralelize = function(links, cbkLinks, fixLink, cbk) {
		var that = this;
		var results = 0;
		var length = links.length;
		links.forEach(function(link,idx) {
			var link = fixLink(link);
			var file = that.urlToFilename(link);
			this.getAndProcess(link, file, function(err, html) {
				cbkLinks(html, function(err, dataFromALink) {
					links[idx]
				});
			})
			
		})
	}
	
	this.process = function(cbk) {
		
		this.getAndProcess(this.url, this.filename, 
				
				
				
		if(cbk) {
			cbk();
		}
	}
	
}