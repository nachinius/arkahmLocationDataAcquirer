/**
 * Implements crawler's callback that process the allies info
 */

var cheerio = require('cheerio');

var clean = function(str) {
	return str.replace('\n', '').trim();
};


var obtainPrimaryDataFromHtml = function(html) {
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
			switch (i2) {
			case 0:
				obj[i].name = clean(ele.text());
				obj[i].link = ele.children('a').attr('href');
				break;
			case 1:
				obj[i].expansion = ele.find('a').attr('title');
				break;
			}
		});
	});
	
	return obj;
};

var obtainLinksFromData = function(obj) {
	var links = [];
	obj.forEach(function(v) {
		if (v.link) {
			links.push(v.link);
		}
	});
	return links;
};

var obtainSecondaryDataFromHtml =function(html) {
	var $ = cheerio.load(html);
	
	var obj = { info: []};
	
	obj.name = clean($('#firstHeading').text());
	
	$('#Card_info').parent().next().children().each(function(i,e) {
		obj.info.push(clean($(e).text()));
	});
	obj.text = clean($('#Card_info').parent().next().next().text());
	
	return obj;
};

var merger = function(primary, secondary) {
	var sec, pri;
	
	primary.forEach(function(e,i) {
		sec = secondary[e.link];
		pri = primary[i];
		delete pri.link;
		
		pri.info = sec.info;
		pri.text = sec.text;
	});
	
	return primary;
};

var options = {
		baseurl : 'www.arkhamhorrorwiki.com',
		filenameToSaveData : 'allies.json',
		primary : {
			location : '/Ally',
			obtainDataFromHtml : obtainPrimaryDataFromHtml
		},
		secondary : {
			obtainLinksFromData : obtainLinksFromData,
			obtainDataFromHtml : obtainSecondaryDataFromHtml,
			mergeData : merger
		}
	};

module.exports = {
		options : options
};