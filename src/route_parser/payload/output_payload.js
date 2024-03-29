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
function ReturnOutput(schema_name, table_name,crud_type,output_data, error_data, err_msg="") {
    output = {
        'schema_name': schema_name,
        'table_name': table_name,
        'crud_type': crud_type,
        'server_error': err_msg,
        'error_data': error_data,
        'output_data': output_data
    }
    return output
}

module.exports = ReturnOutput