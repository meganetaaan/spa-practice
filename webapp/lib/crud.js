/*
 * crud.js - CRUD db機能を提供するモジュール
 */

/*jslint node        : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : true,
  white : true
*/
/*global */

// ------------- モジュールスコープ変数開始 -------------
'use strict';
var
    loadSchema, checkSchema, clearIsOnline,
    checkType, constructObj, readObj,
    updateObj, destroyObj;

    mongodb = require( 'mongodb' ),
    fsHandle = require( 'fs' ),
    JSV = require( 'JSV' ).JSV,

    mongoServer = new mongodb.Server(
        'localhost',
        mongodb.Connection.DEFAULT_PORT
    ),
    dbHandle = new mongodb.Db(
        'spa', mongoServer, { safe : true }
    ),
    validator = JSV.createEnvironment(),

    objTypeMap = { 'user' : { } };
// ------------- モジュールスコープ変数終了 -------------

// ------------- ユーティリティメソッド開始 -------------
loadSchema = function ( schema_name, schema_path ) {
    fsHandle.readFile(  schema_path, 'utf8', function ( err, data ) {
        objTypeMap[ schema_name ] = JSON.parse( data );
    });
};

checkSchema = function ( obj_type, obj_map, callback ) {
    var
        schema_map = objTypeMap[ obj_type ],
        report_map = validator.validate( obj_map, schema_map );

    callback( report_map.errors );
};

clearIsOnline = function () {
    updateObj(
        'user',
        { is_online : true },
        { is_online : false},
        function ( response_map ) {
            console.log( 'All users set to offline', respoonse_map );
        }
    );
};
// ------------- ユーティリティメソッド終了 -------------

// ------------- パブリックメソッド開始 -------------
checkType   = function ( obj_type ) {
    if ( ! objTypeMap[ obj_type ] ){
            return ({ error_msg : 'Object type "' + obj_type
                    + '" is not supported.'
            });
    }
    return null;
};

constructObj = function ( obj_type, obj_map, callback ) {
    var type_check_map = checkType( obj_type );
    if ( type_check_map ) {
        callback( type_check_map );
        return;
    }

    checkSchema(
        obj_type, obj_map,
        function ( error_list ) {
            if ( error_list.length === 0 ) {
                dbHandle.collection(
                    obj_type,
                    function ( outer_error, collection ) {
                        var options_map = { safe: true };

                        collection.insert(
                            obj_map,
                            options_map,
                            function ( inner_error, result_map ) {
                                callback( result_map );
                            }
                        );
                    }
                );
            }
            else {
                callback({
                        error_msg : 'Input document not valid',
                        error_list : error_list
                });
            }
        }
    );
};

readObj     = function () {};
updateObj   = function () {};
destroyObj  = function () {};

module.exports = {
    makeMongoId : null,
    checkType : checkType,
    constructObj : constructObj,
    read : readObj,
    update : updateObj,
    destroy : destroyObj
};
// ------------- パブリックメソッド終了 -------------
// ------------- モジュール初期化開始 -------------
console.log( '** CRUD module loaded **' );
// ------------- モジュール初期化終了 -------------
