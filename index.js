/**
 * 
 */
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var base = 'http://www.arkhamhorrorwiki.com';

/**
 * Process '/Location'
 * 
 * @param html
 * @param cbk(err,object) 
 */
function processLocationsFromHtml(html, cbk) {
	var $ = cheerio.load(html);

	var obj = [];

	var data = $('table tr');

	// eliminate the first row
	var length = data.length;
	data = data.slice(1, length);

	// gets content of each row
	data.map(function(i, e) {

		obj[i] = {
			//html : $(e).html(),
			sub : []
		};
		$(e).children('td').map(function(i2, e2) {
			var ele = $(e2);
			//obj[i].sub[i2] = ele.html();
			if (i2 == 0) {
				obj[i].location = {
					name : ele.text().replace('\n', '').trim(),
					link : ele.children('a').attr('href')
				};
			} else if (i2 == 1) {
				obj[i].neighborhood = {
					name : ele.text().replace('\n', '').trim(),
					link : ele.children('a').attr('href')
				}
			} else if (i2 == 2) {
				obj[i].stability = {
					type : ele.children('span').first().text()
				}
			} else if (i2 == 3) {
				obj[i].encounterA = {
					type : ele.children('a').attr('title')
				}
			} else if (i2 == 4) {
				obj[i].encounterB = {
					type : ele.children('a').attr('title')
				}
			} else if (i2 == 5) {
				obj[i].expansion = {
					type : ele.children('a').attr('title')
				}
			}
		});

	});

	cbk(null, obj);
}

function processSingleLocation(html, cbk) {
	var $ = cheerio.load(html);
	
	var result = {};
	
	if($('#Special_Encounter').length > 0) {
		result.special_encounter = $('#Special_Encounter').parent().next().text().replace('\n','').trim();
	}
	
	// get the card list
	var data = $('table tr');
	var length = data.length;
	var tr;
	// eliminate the header
	data = data.slice(1,length);
	// dive into each tr
	data.map(function(i, e) {
		result[i]={};
		$(e).children('td').map(function(i2,td) {
			if(i2==0) {
				result[i].text = $(td).text().replace('\n','').trim();
			} else if(i2==1) {
				result[i].skill = $(td).text().replace('\n','').trim();
			} else if(i2==2) {
				result[i].expansion = $(td).children('a').attr('title');
			}
		});
	});
	
	if(cbk) {
		cbk(null, result);
	}
}

function diveIntoLocation(obj, cbk) {
	
	var results = 0;
	var length = obj.length
	obj.forEach(function(ele, idx) {
		var link = base + '/'+ ele.location.link;
		var filename = urlToFilename(link);
		getAndProcess(link, filename, function(err,html) {
			processSingleLocation(html, function(err, data) {
				obj[idx].encounters = data;
				results++;
				if(results == length) {
					console.log('reached end');
					cbk(null, obj);
				}
			});
		});
	});
}

function saveToFile(filename, data, cbk) {
	if(typeof data != 'string') {
		data = JSON.stringify(data, null, 1);
	}
	fs.writeFile(filename, data, cbk);
}


function getAndProcess(url, filename, callback) {
	// Run from cache or get it
	if (fs.existsSync(filename)) {
		console.log('reading from file...',filename);
		fs.readFile(filename, callback);
	} else {
		console.log('performing request...',url,filename);
		performRequest(url, filename, callback);
	}
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
function performRequest(url, filename, cbk) {
	request(url, function(error, response, html) {
		if (!error) {
			console.log(response.body);
			fs.writeFile(filename, html);
		}
		cbk(error, html);
	});
}

/**
 * Transform an full URL to a filename
 */
var urlToFilename = function(url) {
	var parts = url.split('/');
	var last = parts.slice(-1);
	return 'html/'+last+'.html';
};

var urlToDataFilename = function(url) {
	var parts = url.split('/');
	var last = parts.slice(-1);
	return 'data/'+last+'.json';
}

var url = base + '/Location';
var filename = urlToFilename(url);
var dataFilename = urlToDataFilename(url);
var callback = function(err, data) {
	processLocationsFromHtml(data, function(err, data) {
		diveIntoLocation(data, function(err, data) {
			saveToFile(dataFilename, data, function() {
				console.log("writing...",dataFilename);
			});			
		});
	});
};

getAndProcess(url, filename, callback);




