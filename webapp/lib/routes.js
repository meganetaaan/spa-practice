/*
 * routes.js -- ルーティング機能を提供するモジュール
 */


/*jslint browser        : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : true,
  white : true
*/
/*global */

// ------------- モジュールスコープ変数開始 -------------
'use strict';
var 
    configRoutes,
    crud = require( './crud' ),
    chat = require( './chat' ),
    makeMongoId = crud.makeMongoId;
// ------------- モジュールスコープ変数終了 -------------
// ------------- パブリックメソッド開始 -------------
configRoutes = function ( app, server ) {

    // 以下の設定はすべてルート用
    app.get('/', function ( request, response ) {
        response.redirect( '/spa.html' );
    });

    app.all( '/:obj_type/*?', function ( request, response, next ) {
                         response.contentType( 'json' );
                         next();
    });

    app.get( '/:obj_type/list', function ( request, response ) {
        crud.read(
            request.params.obj_type,
            {}, {},
            function ( map_list ) { response.send( map_list ); }
        );
    });

    app.post( '/:obj_type/create', function( request, response ) {
        crud.construct(
            request.params.obj_type,
            request.body,
            function ( result_map ) { response.send( result_map ); }
        );
    });

    app.get( '/:obj_type/read/:id', function ( request, response ) {
        crud.read(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id ) },
            {},
            function ( map_list ) { response.send( map_list ); }
        );
    });

    app.get( '/:obj_type/update/:id', function ( request, response ) {
        crud.update(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id ) },
            request.body,
            function ( result_map ) { response.send( result_map ); }
        );
    });

    app.get( '/:obj_type/delete/:id', function ( request, response ) {
        crud.destroy(
            request.params.obj_type,
            { _id: makeMongoId( request.params.id ) },
            function ( result_map ) { response.send( result_map ); }
        );
    });

    chat.connect( server );
};
module.exports = {configRoutes : configRoutes };
// ------------- パブリックメソッド終了 -------------
