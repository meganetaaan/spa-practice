/*
 * spa.js
 * ルート名前空間モジュール
 */


 /*jslint browser        : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : true,
  white : true
  */
  /*global $, spa:true */

  spa = (function (){
      'use strict';
      var initModule = function ( $container ) {
        spa.data.initModule();
        spa.model.initModule();

        if ( spa.shell && $container ) {
            spa.shell.initModule( $container );
        }
      };

      return {initModule: initModule };
  }());
