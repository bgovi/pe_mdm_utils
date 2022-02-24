/*
This module defines the payload structure for crud operations:


*/
const id_check = require('../indentifier_check/identifier_check.js')
var reserved_columns = ['id', '_created_at','_updated_at' ,'_last_user_id']

let default_values = [
    'default', 'current_timestamp', 'current_time','null',
    'current_date', 'localtime', 'localtimestamp', ""
]


//route_token:
let route_object = {
    'route_token': "", //json_web_token (contains accessible route information?)
    'query_params': "",
}

let query_params = [{
    "crud_type": "", //only needed for save route 
    "data": "", //object or array of objects: {x:"valx", y:"valy"} or [{x:"valx1", y:"valy1"},{x:"valx2", y:"valy2"}]
    "default_fields": "",
    "set_fields": "",
    "on_conflict": "",
    "on_constraint": "",
    "where": "",
    "page": "",
    "search_filter": "", //string or object with quick filter type:
    "search_rank": "", //bool
    "returning": "",
    "order_by": ""
}]

//return_object
//need immediate rejection
//need to check column values
let insert_params = [{
    "default_fields": "",
    "on_conflict": "",
    "on_constraint": "",
    "set_fields": ""
}]

function is_reserved_column(column_name) {
    if (reserved_columns.includes(column_name)) { return true }
    return false
}

function returning_str(query_param) {
    if (! query_param.hasOwnProperty('returning') ) { return '"id"' }
    let rtx = query_param['returning']
    if (typeof rtx === 'string') {
        if (rtx == "*") {return "*"}
        if ( id_check.valid_identifier(rtx)) { return '"'+rtx+'"' }
    }
    if (! Array.isArray(rtx) ) {return '"id"'}

    let rtx_out = []
    for (let i =0; i < rtx.length; i++) {
        if ( id_check.valid_identifier(rtx[i])) { rtx_out.push( '"'+rtx+'"' ) }
    }
    if (rtx_out.length == 0) { return '"id"' }

    return rtx_out.join(' , ')
}

function default_value(psql_reserved_constant) {
    /*
    if name in list return value otherwise return default

    if empty string return "''"
    */
    if (default_values.includes(psql_reserved_constant)) {return psql_reserved_constant}
    return 'default'
}

module.exports = {
    'is_reserved_column': is_reserved_column,
    'returning_str': returning_str
}