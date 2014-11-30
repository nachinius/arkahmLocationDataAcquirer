/**
 * Implements crawler's callback that process the monsters info
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
				break;
			case 1:
				obj[i].blue = clean(ele.text());
				break;
			case 2:
				obj[i].green = clean(ele.text());
				break;
			case 3:
				obj[i].red = clean(ele.text());
				break;
			case 4:
				obj[i].yellow = clean(ele.text());
				break;
			case 5:
				obj[i].expansion = ele.find('a').attr('title');
				break;
			}
		});
	});

    var links = {};
    var k, v;
    $('#List_of_other_world_encounters').parent().next().find('a').map(function(i,e) {
    	v = $(e);
    	links[clean(v.text())] = v.attr('href');
    })

    obj.forEach(function(e,i) {
        obj[i].link = links[e.name];
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
	
	var obj = {};

	
	
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
				obj[i].text = clean(ele.text());
				break;
			case 1:
				obj[i].skill = clean(ele.text());
				break;
			case 2:
				obj[i].expansion = $(e2).find('a').attr('title');
				break;
			}
		});
	});
	return obj;
};

var merger = function(primary, secondary) {
	var sec, pri;
	
	primary.forEach(function(e,i) {
		sec = secondary[e.link];
		pri = primary[i];
		delete pri.link;
		
		pri.encounters = sec;
	});
	
	return primary;
};

var options = {
		baseurl : 'www.arkhamhorrorwiki.com',
		filenameToSaveData : 'otherWorld.json',
		primary : {
			location : '/Other_World',
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
