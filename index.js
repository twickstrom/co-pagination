/** File Name: node_modules/railway-pagination/index.js
* Purpose: railway-pagination main file.
* Original author: Anatoliy C.
*
* Update History
* Name            Date       Description
* --------------- ---------- ------------------------------------------------------------------------------
* Asp3ctus        14/03/2013 - Migrate to compund and new jugglingdb api
* Jude L.         04/26/2012 - Updated the paginateCollection to allow the passing of order option to the Model.all routine.
* Jude L.         05/19/2012 - Updated the paginateCollection to allow the passing of where option to the Model.all routine
                              if one is provided.
**/

exports.init = function (compound) {
    // add view helper
    compound.helpers.HelperSet.prototype.paginate = paginateHelper;
    // add orm method
    // sorry, jugglingdb only for now
    compound.on('models', function(){
        for(var m in compound.models){
            if(compound.models.hasOwnProperty(m)){
                compound.models[m].paginate = paginateCollection;
            }
        }

    });
};

// global view helper
function paginateHelper(collection,step,params) {
    if (!collection.totalPages || collection.totalPages < 2) return '';
    
    if (step) {
    	switch(typeof step) {
    		case 'number':
    			step = step;
				break;
			case 'object':
				params = step;
				step = 5;
				break;
		}
    } else {
	    step = 5;
	    params = {};
    }
    
    var page = parseInt(collection.currentPage, 10),
    	pages = collection.totalPages,
		html = '<div class="' + (params.paginationClass || "pagination") + '">',
		prevClass = 'prev' + (page === 1 ? ' disabled': ''),
		nextClass = 'next' + (page === pages ? ' disabled': ''),
		linkObj = { class: (params.linkClass || '') }
    
    html += '<ul><li class="' + prevClass + '">';
	if(page === 1) {
		linkObj.disabled = true;
	}
    html += this.link_to((params.first || '&larr; First'), '?page=1', linkObj);
    html += this.link_to((params.prev || '&larr; Previous'), '?page=' + (page - 1), linkObj);
    html += '</li>';

    var start = ( page <= step ) ? 1 : page-step;
    var end   = page+step;
		
    if ( page > pages-step )
    {
        start = pages-(step*2);
    }
	
	if(start < 1)
	{
		start = 1;
	}
	
    if ( end < (step*2) )
    {
        end = step*2;
    }

    if ( end > pages )
    {
        end = pages;
    }

    for (var i = start; i <= end; i++ ) {
        if (i == page) {
            html += '<li class="active"><a href="#" class="active ' + (params.linkClass || '') + '">' + i + '</a></li>';
        } else {
			delete linkObj['disabled'];
            html += '<li>' + this.link_to(i, '?page=' + i, linkObj) + '</li>';
        }
    }
    if(page === pages) {
	    linkObj.disabled = true;
    } else {
	    delete linkObj['disabled'];
    }
    
    console.log();
    
    html += '<li class="' + nextClass + '">';
    html += this.link_to((params.next || 'Next &rarr;'), '?page=' + (page + 1), linkObj);
    html += this.link_to((params.last || 'Last &rarr;'), '?page=' + pages, linkObj);
    html += '</li></ul></div>';
    return html;
};

// orm method
function paginateCollection(opts, callback) {
    var limit   = opts.limit   || 10;
    var page    = opts.page    || 1;
    var order   = opts.order   ||'1';
    var where   = opts.where;
    var include = opts.include;
    var Model = this;

    if (where != null) {
        Model.count({where: where}, function (err, totalRecords) {
            Model.all({limit: limit, offset: (page - 1) * limit, order: order, where: where, include: include}, function (err, records) {
                if (err) return callback(err);
                records.totalRecords = totalRecords;
                records.currentPage = page;
                records.totalPages = Math.ceil(totalRecords / limit);
                callback(null, records);
            });
        })
    } else {
        Model.count(function (err, totalRecords) {
            Model.all({limit: limit, offset: (page - 1) * limit, order: order, include: include }, function (err, records) {
                if (err) return callback(err);
                records.totalRecords = totalRecords;
                records.currentPage = page;
                records.totalPages = Math.ceil(totalRecords / limit);
                callback(null, records);
            });
        })
    }

}
