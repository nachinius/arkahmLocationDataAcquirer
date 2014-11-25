/**
 * Implements callback that process the mythos pages
 */
var cheerio = require('cheerio');

var clean = function(str) {
	return str.replace('\n', '').trim();
};

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
				obj[i].type = clean(ele.text());
				break;
			case 2:
				obj[i].expansion = ele.children('a').attr('title');
				break;
			case 3:
				obj[i].gate = ele.children('a').attr('title');
				break;
			case 4:
				if (ele.children('a').length > 0) {
					obj[i].special = clean(ele.text());
				}
				break;
			}
		});

	}); // data.map

	return obj;
};

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
};

/**
 * Process secondary links
 * 
 * @return Object { title: text, type: text, gates: [text], clues: [text], text:
 *         text, movement: { white: text, black: text } }
 */
var obtainSecondaryDataFromHtml = function(html) {

	var $ = cheerio.load(html);

	var obj = {
		title : clean($('h1.firstHeading').text())
	};

	var data = $('div.SingleLineDL');

	data.find('p').each(function(i, e) {
		switch (i) {
		case 0: // type of mythos
			obj.type = clean($(e).text());
			break;
		case 1: // gates
			obj.gates = [];
			$(e).children('a').map(function(i2, e2) {
				obj.gates.push($(e2).attr('title'));
			});
			break;
		case 2: // location for clues
			obj.clues = [];
			$(e).children('a').map(function(i2, e2) {
				obj.clues.push($(e2).attr('title'));
			});
			break;
		case 4: // text
			obj.text = clean($(e).text());
			break;
		case 5: // pass (if rumor)
			obj.pass = clean($(e).text());
			break;
		case 6:// fail (if rumor)
			obj.fail = clean($(e).text());
			break;
		}
	});

	data.find('table tr').each(function(i, e) {
		if (i === 0) {
			obj.movement = {
				white : $(e).find('span').map(function(i, e) {
					return $(e).text();
				}).get()
			};
		} else if (i === 1) {
			obj.movement.black = $(e).find('span').map(function(i2, e2) {
				return $(e2).text();
			}).get();
		}
	});

	return obj;
};

var merger = function(primary, secondary) {
	var sec, pri;

	primary.forEach(function(e, i) {
		sec = secondary[e.link];
		pri = primary[i];
		delete pri.link;
		delete pri.gate;
		pri.gates = sec.gates;
		pri.clues = sec.clues;
		pri.text = sec.text;
		pri.movement = sec.movement;
		if(typeof sec.pass !== 'undefined') { 
			pri.pass = sec.pass;
		}
		if(typeof sec.fail !== 'undefined') {
			pri.fail = sec.fail;
		}
	});

	// add missing mythos
	primary
			.push({
				name : "A Sandstorm!?",
				type : "Environment (Weather)",
				"expansion" : "Curse of the Dark Pharaoh",
				"gates" : [ "Independence Square" ],
				"clues" : [ "Woods" ],
				"text" : "Mythos Ability: Against all reason, a sandstorm comes up out of nowhere and strikes Arkham, clogging the streets and burying whole building! Strangely, it seems to avoid certain places with dark reputations. Investigators must spend 2 additional movement points to enter any location marked with a green diamon. While this card is in play, instead of having an Arkham Encounter, any investigator in a street are may pass a Luck(-1) check to draw 1 Exhibit Item.",
				"movement" : {
					"white" : [ "Slash", "Star", "Triangle" ],
					"black" : [ "Hexagon" ]
				}

			});

	return primary;
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
		mergeData : merger
	}
};

module.exports = {
	options : options
};
