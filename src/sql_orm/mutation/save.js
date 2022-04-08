/*
This module handles all of the primary crud operations.

CRUD Operations API. Below are common input parameters used for the crud opeartions: Insert, Update, Upsert, Delete. Save is
a wrapper function for these fields



*/
const is = require('./server_return')
const ds = require('./query_permissions')
const us = require('./query_params')




// {
//     "crud_type": "", //only needed for save route 
//     "data": "", //array of objects: [{x:"valx1", y:"valy1"},{x:"valx2", y:"valy2"}]
//     "default_fields": "", //object with default type {x:"default_value_x", y:"default_value_y"}
//     "set_fields": "",  //array that has columns that should be used for set
//     "on_conflict": "",
//     "on_constraint": "",
//     "where": "",
//     "page": "", //object {'offset': val, 'limit': val}
//     "search_filter": "", //string or object with quick filter type:
//     "search_rank": "", //bool
//     "returning": "", //array of fields to used for returning [id, column_1, xxx] //defaults to id?
//     "order_by": ""  // [{'col1': 'asc}, {'col_2': 'desc'}] 
// }



async function Insert(req, rowx, route_model, table_name, route_name, saveParams ) {
    //main insert function.
}

async function Update (req, rowx, route_model, table_name, route_name, update_filter, saveParams) {
    //
}

async function Delete(req, rowx, route_model, table_name, route_name, saveParams) {
    /*
    may add delete conditions to where statement?
    */
}

async function Maps(res, route_model, query_clause, table_name, route_name) {
    /*
    Creates jsonRows that contain values user can enter for autocomplete.

    query_clause: {parameters to send to sequelize} i.e. attribtues: where, raw: true, include

    Model.findAll({
    where: {
        [Op.and]: [
            Sequelize.literal('RAW SQL STATEMENT WHICH WONT BE ESCAPED!!!')
        ]
    }
    })
    */
    try {
        var rs = await route_model.findAll(query_clause) //active users i.e. Admin, User, New
        var rs_map = srf.ReturnMaps(table_name, route_name, rs)
        res.json(rs_map)
    } catch (err) {
        var map_error = srf.ReturnMapError(table_name, route_name, [], srf.ProcessError(err) )
        res.json(map_error)
    }
}

async function MapsRaw(res, table_name, route_name, sql_string, replacementsObject) {
    /*
    Arguments:
        req, res:
        columnObject: Object sent by route. Contains information on columns to be used in get query.
        CreateQuery: Function sent by route to assemble get string.
    */
   try {
        //check read permissions
        // add columns for allow update and allow_delete
        var rs = await sequelize.query(sql_string,
            {replacements: replacementsObject, type:sequelize.QueryTypes.SELECT } )
        var rs_map = srf.ReturnMaps(table_name, route_name, rs)
        res.json(rs_map)

    } catch (err) {
        var map_error = srf.ReturnMapError(table_name, route_name, [], srf.ProcessError(err) )
        res.json(map_error)
    }
}






function DeleteWhereClause(req, row_id, rowx, save_params_object) {
    //run default if null
    //save_params_object['delete']['where_function'](req, row_id, rowx)
    //else blah
    if (save_params_object['delete']['where_function'] !== null ) {
        var where_clause = save_params_object['delete']['where_function'](req, row_id, rowx)
        return where_clause
    } else {
        return {where: {'id': row_id}}
    }
}

function UpdateWhereClause(req, row_id, rowx, save_params_object) {
    /*
    Used to generate custom or default where clause. if custom function available it will
    be stored in the save_params_object
    */
    //run default if null
    if (save_params_object['update']['where_function'] !== null ) {
        var where_clause = save_params_object['update']['where_function'](req, row_id, rowx)
        return where_clause
    } else {
        return {where: {'id': row_id}}
    }
}

function CreateSaveParamsObject(args) {
    /*
    args is a javascript object that has the same strcutre as save_params variable below. It used to overwrite default options.

    Used to assemble the custom params object. Make sure all key values are valid. 
    custom_update = null, custom_insert = null, custom_delete = null, custom_upsert = null,
    custom_update_permission = null, custom_insert_permission = null, custom_delete_permission = false, custom_upsert_permission = null

    async crud_function (req, row_id,row_node_id, rowx): provides a way to create a fully customized crud function for each route.
        for delete return a value where value >= 0. where value referes to the number of rows affected
        update function must return an array [value] where value >= 0. where value referes to the number of rows affected
        for insert and upsert returns json row of the affected row.
    allow_crud: determines if the crud operation should even be considered
    async permissions_function (req, row_id,row_node_id, rowx): custom permissions check to see if crud operation should continue. throw new Error when it
        should be stopped
    async additional_check (req, row_id,row_node_id, rowx): An additionaly permissions check. runs after custom permissions or default permissions have been
        run. throws error if fails.

    where_function (req, row_id, rowx) Returns the sequelize query_parameters for update or delete. Mainly add update and delete protections.

    Crud Return Types:
        create: {row_data}
        upsert: [{row_data}, null]
        delete: integer
        update: [integer]

    append_user_id_as: []. Append is a list of keys for the user_id that are added by the server to rowx rows. This is done the user_id to each
        row before being sent to the database. For example append_user_id_as = ['last_modified_by_user_id']. Will add  req['user_id']} 
        to each rowx row as 'last_modified_by_user_id': req['user_id'] 
    */
    var save_params = {
        'insert': {'crud_function': null, 'permission_function': null, 'additional_check': null, 'allow_crud': false}, 
        'update': { 'crud_function': null , 'permission_function': null, 'additional_check': null, 'allow_crud': false, 'where_function': null },
        'delete': { 'crud_function': null , 'permission_function': null, 'additional_check': null, 'allow_crud': false, 'where_function': null},
        'upsert': {'crud_function': null , 'permission_function': null, 'additional_check': null, 'allow_crud': false} ,
        'append_user_id_as': []
    }
    //loop through if error throw
    for (var crud_operation in args) {
        if (crud_operation == 'append_user_id_as') {continue}
        for (var param in args[crud_operation]) {
            if (save_params[crud_operation][param] === undefined) {
                throw new Error(`the key pair ${crud_operation} and ${param} were not found in save params objeced. use valid keys`)
            }
            if (param == "allow_crud") {
                //check if true or false
                var bx = args[crud_operation][param]
                if (typeof bx !== 'boolean') {throw new Error(`not a boolean`)}
                save_params[crud_operation][param] = bx
            }
            else {
                var func =  args[crud_operation][param]
                if (typeof func !== 'function' ) {throw new Error(`not a function?`)}
                save_params[crud_operation][param] = func    
            }
        }
    }
    if (args.hasOwnProperty('append_user_id_as')) {
        args['append_user_id_as'].forEach(user_key => save_params['append_user_id_as'].push(user_key))
    }

    return save_params
}

function AddUserIdToRow(rowx, req, saveParams) {
    //adds the current users id to the row. Used to track who made the last modification.
    var user_id = er.ExtractUserId(req)
    if (saveParams['append_user_id_as'].length <= 0) {return}
    saveParams['append_user_id_as'].forEach( user_key => rowx[user_key] = user_id)
}

async function Save(req, res, route_model, table_name, route_name, update_filter, saveParams){
    /*
    saveParams is a javascript object that contains parameters on how to run the insert, delete, update
    and upsert functions. Its created by using CreateSaveParamsObject in each route. custom arguments and functions
    can be added at the rotue level to specify specialy approaches to crud operations or disable routes entierly
    */

    try{
        var req_body = req['body']
        var insert_output = await Promise.all( req_body['insert'].map(data_row => {
            return Insert(req, data_row, route_model, table_name, route_name, saveParams)
         }) )
        var update_output = await Promise.all( req_body['update'].map(data_row => {
            return Update( req, data_row, route_model, table_name,route_name, update_filter, saveParams)

        }) )
        var delete_output = await Promise.all( req_body['delete'].map(data_row => {
            return Delete( req, data_row, route_model, table_name,route_name, saveParams)
        }) )
        var upsert_output = await Promise.all( req_body['upsert'].map(data_row => {
            return Upsert( req, data_row, route_model, table_name, route_name, saveParams)
        }) )
        var output = srf.ReturnOutput(insert_output, update_output, delete_output, upsert_output,table_name, route_name)
        res.json(output)
    } catch (err) {
        var err_output = srf.ReturnOutputError(srf.ProcessError(err), insert_rows, update_rows, delete_rows, upsert_rows, table_name, route_name)
        res.json(err_output)
    }
}

async function GetRawString(req, res, table_name, route_name, columnObject, CreateQuery) {
    /*
    Arguments:
        req, res:
        columnObject: Object sent by route. Contains information on columns to be used in get query.
        CreateQuery: Function sent by route to assemble get string.
    */
   try {
        //check read permissions
        // add columns for allow update and allow_delete
        var query_restraints =  qparam.CreateQueryParamaters(req, columnObject)
        var query_options = query_restraints['query_options']

        var where_string = query_options['where']
        var orderby_string  = query_options['order_by']
        var pagination_string = query_options['pagination']
        var outer_statement =  query_options['outer_statement']
        var replacementsObject = query_options['replacements']
        var sql_string = CreateQuery(where_string, orderby_string, pagination_string, outer_statement, req) 
        
        //allow_update i.e. AllowModification goes here?
        var user_rows = await sequelize.query(sql_string,
            {replacements: replacementsObject, type:sequelize.QueryTypes.SELECT } )
        res.json(srf.QuerySuccess(user_rows, table_name, route_name) )
    } catch (err) {
        res.json( srf.QueryError(srf.ProcessError(err), table_name, route_name) )
    }
}

async function GetRawStringRouter(res, table_name, route_name, sql_string, replacementsObject) {
    /*
    Arguments:
        req, res:
        query arguments are processed at router level. sql string created at router level.
    */
   try {
        //check read permissions
        // add columns for allow update and allow_delete
        var rs = await sequelize.query(sql_string,
            {replacements: replacementsObject, type:sequelize.QueryTypes.SELECT } )
        res.json(srf.QuerySuccess(rs, table_name, route_name) )
    } catch (err) {
        res.json( srf.QueryError(srf.ProcessError(err), table_name, route_name) )
    }
}



async function GetSequelize(req, res, route_model, query_clause, table_name, route_name) {
    /*
    uses sequelize to generate get route

    query_arguments: {parameters to send to sequelize} i.e. attribtues: where, raw: true, include

    Model.findAll({
    where: {
        [Op.and]: [
            Sequelize.literal('RAW SQL STATEMENT WHICH WONT BE ESCAPED!!!')
        ]
    }
    })
    //extract pagination??
    //maybe pass function and creqte
    */
    try {
        var rows = await route_model.findAll(query_clause) //active users i.e. Admin, User, New
        res.json(srf.QuerySuccess(rows, table_name, route_name))
    } catch (err) {
        res.json(srf.QueryError(srf.ProcessError(err), table_name, route_name))
    }
}


module.exports = {
    "GetRawString": GetRawString,
    "GetSequelize": GetSequelize,
    "GetRawStringRouter": GetRawStringRouter,
    "Maps": Maps,
    "MapsRaw": MapsRaw,
    "Save": Save,
    "CreateSaveParamsObject": CreateSaveParamsObject
}