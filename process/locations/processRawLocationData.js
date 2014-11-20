/**
 * Node file
 */


var _ = require('underscore');

var noExpansion = function(data) {
	var result = [];
	_.map(data,function(val,idx) {
        if(typeof val.expansion.type == 'undefined') {

            var location = {};
            location.name = val.location.name;
            location.neighborhood = val.neighborhood.name;
            location.encounters = [];
            _.map(val.encounters, function(v,i) {
                if(v.expansion && v.expansion.length === 0) {
                    location.encounters.push(
                        {
                        text: v.text
                    }
                    );
                }
            });
            result.push(location);
        }
	});
	
	return result;
}

module.exports = noExpansion;
