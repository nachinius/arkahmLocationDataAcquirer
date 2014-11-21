/**
 * Implements callback that process the mythos pages
 */
var cheerio = require('cheerio');

var clean = function(str) {
	return str.replace('\n', '').trim();
}

/**
 * process the html and extract the information in it
 * 
 * @return Array of Object whose keys may be: name, link, type, expansion, gate,
 *         special
 */
var obtainDataFromMythosHtml = function(html) {

	var $ = cheerio.load(html);

	var obj = [];

	var data = $('table tr');

	// take out the header titles
	var length = data.length;
	data = data.slice(1, length);

	// gets the content of each row
	data.map(function(i, e) {
		obj[i] = {};

		$(e).children('td').map(function(i2, e2) {
			var ele = $(e2);
			// first column: mythos name and link
			switch (i2) {
			case 0:
				obj[i].name = clean(ele.text());
				obj[i].link = ele.children('a').attr('href');
				break;
			case 1:
				obj[i].type = ele.text();
				break;
			case 2:
				obj[i].expansion = ele.children('a').attr('title');
				break;
			case 3:
				obj[i].gate = ele.children('a').attr('title');
				break;
			case 4:
				if (ele.children('a').length() > 0) {
					obj[i].special = clean(ele.text());
				}
				break;
			}
		});

	}); // data.map

	return obj;
}

/**
 * From the Array of Objects found from main page, obtain the links to follow
 */
var obtainLinksFromData = function(obj) {
	var links = [];
	obj.forEach(function(v) {
		if (v.link) {
			links.push(v.link);
		}
	});
	return links;
}

/**
 * Process secondary links
 * 
 * @return Object {
 * 		title: text,
 * 		type: text,
 * 		gates: [text],
 * 		clubs: [text],
 * 		text: text,
 * 		movement: {
 * 			white: text,
 * 			black: text
 * 		}
 * 	}
 */
var obtainSecondaryDataFromHtml = function(html) {

	var $ = cheerio.load(html);

	var obj = { title: clean($('h1.firstHeading').text())};
	
	var data = $('div.singleLineDL');


	data.children('p').each(function(i, e) {
		switch (i) {
		case 0:
			obj.type = clean($(e).text());
			break;
		case 1:
			obj.gates = [];
			$(e).children('a').map(function(i2, e2) {
				obj.gates.push($(e2).attr('title'));
			});
			break;
		case 2:
			obj.clubs = [];
			$(e).children('a').map(function(i2, e2) {
				obj.clubs.push($(e2).attr('title'));
			});
			break;
		case 3:
			obj.text = clean($(e).text());
			break;
		}
	});

	data.find('table span').each(function(i, e) {
		if (i === 0) {
			obj.movement = {
				white : clean($(e).text())
			};
		} else if (i === 1) {
			obj.movement.black = clean($(e).text());
		}
	});

	return obj;
};

var options = {
	baseurl : 'www.arkhamhorrorwiki.com',
	filenameToSaveData : 'mythos.json',
	primary : {
		location : '/Mythos',
		obtainDataFromHtml : obtainDataFromMythosHtml
	},
	secondary : {
		obtainLinksFromData : obtainLinksFromData,
		obtainDataFromHtml : obtainSecondaryDataFromHtml,
	}
}
