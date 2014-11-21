/**
 * Implements callback that process the mythos pages
 */
var cheerio = require('cheerio');

function ObtainDataFromMythosHtml(html) {
    
    var $ = cheerio.load(html);

    var obj = [];

    var data = $('table tr');

    // take out the header titles
    var length = data.length;
    data = data.slice(1, length);

    // gets the content of each row
    data.map(function(i,e) {
        obj[i] = {};

        $(e).children('td').map(function(i2,e2) {
            var ele = $(e2);
            // first column: mythos name and link
            switch(i2) {
                case 0:
                    obj[i].name = ele.text().replace('\n','').trim();
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
                    if(ele.children('a').length()>0) {
                        obj[i].special = ele.text().replace('\n','').trim();
                    }
                    break;
            }
        });

    }); // data.map

    return obj;
}


