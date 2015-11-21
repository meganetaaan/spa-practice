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
var configRoutes,
    mongodb = require( 'mongodb' ),
    
    mongoServer = new mongodb.Server(
        'localhost',
        mongodb.Connection.DEFAULT_PORT
    ),
    dbHandle = new mongodb.Db(
        'spa', mongoServer, { safe : true }
    );

dbHandle.open( function () {
    console.log( '** Connected to MongoDB **' );
});
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
        response.send({ title: request.params.obj_type + ' list' });
    });

    app.post( '/:obj_type/create', function( request, response ) {
        response.send({ title: request.params.obj_type + ' created' });
    });

    app.get( '/:obj_type/read/:id[0-9]+', function ( request, response ) {
        response.send({
                title: request.params.obj_type + ' with id ' + request.params.id + ' found'
        });
    });

    app.get( '/:obj_type/update/:id[0-9]+', function ( request, response ) {
        response.send({
                title: request.params.obj_type + ' with id ' + request.params.id + ' updated'
        });
    });

    app.get( '/:obj_type/delete/:id[0-9]+', function ( request, response ) {
        response.send({
                title: request.params.obj_type + ' with id ' + request.params.id + ' deleted'
        });
    });
};
module.exports = {configRoutes : configRoutes };
// ------------- パブリックメソッド終了 -------------
