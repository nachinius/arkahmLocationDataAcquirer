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
				obj[i].link = ele.children('a').attr('href');
				break;
			case 1:
				obj[i].movement = clean(ele.text());
				break;
			case 2:
				obj[i].toughness = clean(ele.text());
				break;
			case 3:
				obj[i].dimension = clean(ele.text());
				break;
			case 4:
				obj[i].type = clean(ele.text());
				break;
			case 5:
				obj[i].expansion = ele.find('a').attr('title');
				break;
			case 6:
				obj[i].quantity = clean(ele.text());
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
	
	var obj = {};
	obj.awareness = clean($('.MonsterInfoBox tr').find('.AwarenessAggressive').text());
	
	var data = $('.MonsterCombatStats').find('.HorrorRating');
	obj.horrorRating = clean(data.text());
	var next = data.next();
	obj.horrorDamage = clean(next.text());
	next = next.next();
	obj.toughness = clean(next.text());
	next = next.next();
	obj.combatRating = clean(next.text());
	next = next.next();
	obj.combatDamage = clean(next.text());
	
	return obj;
};

var merger = function(primary, secondary) {
	var sec, pri;
	
	primary.forEach(function(e,i) {
		sec = secondary[e.link];
		pri = primary[i];
		delete pri.link;
		
		pri.awareness = sec.awareness;
		pri.horrorRating = sec.horrorRating;
		pri.horrorDamage = sec.horrorDamage;
		pri.toughness = sec.toughness;
		pri.combatRating = sec.combatRating;
		pri.combatDamage = sec.combatDamage;
	});
	
	return primary;
};

var options = {
		baseurl : 'www.arkhamhorrorwiki.com',
		filenameToSaveData : 'monsters.json',
		primary : {
			location : '/Monster',
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