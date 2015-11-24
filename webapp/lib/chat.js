/*
 * chat.js -- チャットメッセージングを提供するモジュール
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
    chatObj,
    socket = require( 'socket.io' ),
    crud = require( './crud' );
// ------------- パブリックメソッド開始 -------------
chatObj = {
    connect : function ( server ) {
        var io = socket.listen( server );

        // io設定開始
        io
            .set( 'blacklist' , [] )
            .of( '/chat' )
            .on( 'connection', function ( socket ) {
                socket.on( 'adduser', function () {} );
                socket.on( 'updatechat', function () {} );
                socket.on( 'leavechat', function () {} );
                socket.on( 'disconnect', function () {} );
                socket.on( 'updateavatar', function () {} );
            }
        );
        // io設定終了
        
        return io;
    }
};

module.exports = chatObj;
// ------------- パブリックメソッド終了 -------------
