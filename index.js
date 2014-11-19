/**
 * 
 */
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var filename = 'html.html';
var url = 'http://www.arkhamhorrorwiki.com/Location';


function processLocationsHtml(html, cbk) {
	var $ = cheerio.load(html);

	var json = {
		content : [],
		titles: []
	};

	var data = $('table tr');

	// process the tiles on the first row
	$('table tr').first().children('th').each(function(i,e) {
		json.titles.push({i:i, e: $(e).text()});
	});
	
	// eliminate the first row
	var length = data.length;
	data = data.slice(1,length);
	
	// gets content of each row
	data.map(function(i,e) {
			
		json.content[i] = { html: $(e).html(), sub: []};
		$(e).children('td').map(function(i2,e2) {
			var ele = $(e2);
			json.content[i].sub[i2] = ele.html();
			if(i2==0) {
				json.content[i].location = {
						name : ele.text().replace('\n','').trim(),
						link : ele.children('a').attr('href')
				}; 
			} else if (i2==1) {
				json.content[i].neighborhood = {
						name : ele.text().replace('\n','').trim(),
						link: ele.children('a').attr('href')
				} 
			} else if (i2==2) {
				json.content[i].stability = {
						type: ele.children('span').first().text()
				}
			} else if (i2==3) {
				json.content[i].encounterA= {
						type: ele.children('a').attr('title')
				}
			} else if (i2==4) {
				json.content[i].encounterB = {
						type: ele.children('a').attr('title')
				}
			} else if (i2==5) {
				json.content[i].expansion  = {
						type: ele.children('a').attr('title')
				}
			}
		});
		
	});
	
	

	var response = JSON.stringify(json, null, 1);
	fs.writeFile('output.json', response, function(err) {
		console.log(response);
		console.log('Check your project directory for the output.json file');
	});

	if(cbk) {
		cbk(response);
	}
}

function performRequest(url, filename, processHtml) {
	request(url, function(error, response, html) {
		if (!error) {
			console.log(response.body);
			fs.writeFile(filename, html);
			
			processHtml(html);
		}
	});
}

filename = 'html/location.html';
// Run from cache or get it
if (fs.existsSync(filename)) {
	console.log('reading from file...');
	fs.readFile(filename, function(err, data) {
		processLocationsHtml(data);
	});
} else {
	console.log('performing request...');
	performRequest(url, filename, processLocationsHtml);
}
