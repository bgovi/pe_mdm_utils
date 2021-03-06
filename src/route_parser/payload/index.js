/*
This module defines the payload structure for crud operations

row_data : {'column_name1': 'column_value1', 'column_name2': 'column_value2'}

Also provides functions to process
*/
const idx = require('../indentifier_check')

var reserved_columns = [
    /*
    These are special variables that are expected to be handled a certain way.
    These are filtered out in insert/update/delete routes. _created_at, updated_at
    and _deleted_at should be type timestamp
    
    _created_at and _updated_at set default value now(). _updated_at updated through trigger
    _last_user_id is bigint allow null and updated by a trigger.
    _deleted_at is updated through _deleted_at trigger. If has timestamp value thats when it
    was deleted

    id is not allowed to be set by an insert or update statement
    */
    'id', '_created_at','_updated_at','_deleted_at'  ,'_last_user_id'
]

let default_values = [
    /*
    These are default values that can be direclty entered into crud operations. These
    */
    'default', 'current_timestamp', 'current_time','null',
    'current_date', 'localtime', 'localtimestamp', ""
]


function ReturnValidDefaultValue(psql_reserved_constant) {
    /*
    if name in default_values list return value otherwise return default
    This function sanitizes values as they are direclty entered into sql string

    if empty string return "''"
    */
    for (var i = 0; i < default_values.length; i++) {
        if (default_values[i] === psql_reserved_constant ) {
            return default_values[i]
        }
    }
    return 'default'
}

function DefaultObject(default_row_data) {
    /*
    return object with sanitized default values
    default_row_data : {'column_name1': 'default_value1', 'column_name2': 'default_value2'}

    Checks if default_value is acceptable. If not returns default. for the column_name
    */
    let def_object = {}
    let row_keys = Object.keys(default_row_data)
    for (var i = 0; i < row_keys.length; i++) {
        let rowKey = row_keys[i]
        if ( ! idx.ValidIdentifier(rowKey)) { continue }
        let dval   = default_row_data[ rowKey ]
        let defval = ReturnValidDefaultValue(dval)
        def_object[rowKey] = defval 
    }
    return def_object
}



//data structure expected for client.
let route_object = {
    'route_token': "", //json_web_token (contains accessible route information?)
    'query_params': "", //contains payload 
}

let query_params = [
    /*
    Array of objects. Contains information for crud operations.
    Operation order is not preserved.
    */
    {
    "crud_type": "", //only needed for save route 
    "data": "", //array of objects: [{x:"valx1", y:"valy1"},{x:"valx2", y:"valy2"}]
    "default_fields": "", //object with default type {x:"default_value_x", y:"default_value_y"}
    "set_fields": "",  //array that has columns that should be used for set
    "on_conflict": "", //string a-zA-Z0-9
    "on_constraint": "", //string a-zA-Z0-9
    "where": "", //array of objects: [{x:"valx1", y:"valy1"},{x:"valx2", y:"valy2"}]
    "offset": "", //should be integer greater or equal to 0
    "limit": "", //should be positive integer
    "search_filter": "", //string or object with quick filter type:
    "search_rank": "", //bool
    "returning": "", //array of fields to used for returning [id, column_1, xxx] //defaults to id?
    "order_by": ""  // [{'col1': 'asc}, {'col_2': 'desc'}] 
    }
]




function IsReservedColumn(column_name) {
    /*
    This funciton checks if input column is reserved. Used to filter out payload
    in crud operations (insert, update, delete) 

    All json data should be passed to a function if used.
    */
    if (reserved_columns.includes(column_name)) { return true }
    return false
}

function IsReservedColumnError(column_name) {
    if (IsReservedColumn(column_name)) {
        throw new Error(`${column_name} is reserved key word. reserved names are ${reserved_columns}`)
    }
}



/*
This module contains all the wrapper functions than handle the returned output for all routes.


    ExtractNodeId pulls the row_node_id generated by ag-grid. This tracks which row the data is comming from
    on the client side

    QueryError and QuerrySuccess are wrappers for all get and custom get route return objects

    //this is the final output wrapper for insert/delete/update/upsert. This object gets send
    //to the client. May just send empty arrays for insert, update, upsert, and delete.
    //Maybe check if array first. othewise send empty array

    from (insert,update,delete, function)
    output:
        output: [{data: row1, is_error: bool, error_msg: "", node_id: int/null}]
    from select:
        output: [{row1}, {row2}]

    is_error is for errors that happen at the route level i.e. a server error.
    in the output array error values can be added to each crud operation.

    may add row preservation:
*/
function ReturnOutput(schema_name, table_name,crud_type,output, is_error=false, err_msg="") {
    output = {
        'schema_name': schema_name,
        'table_name': table_name,
        'crud_type': crud_type,
        'is_error': is_error,
        'error_msg': err_msg,
        'output': output
    }
    return output
}





module.exports = {
    'IsReservedColumn': IsReservedColumn,
    'IsReservedColumnError': IsReservedColumnError,
    'ReturnValidDefaultValue': ReturnValidDefaultValue,
    'ReturnOutput': ReturnOutput,
    'DefaultObject': DefaultObject
}