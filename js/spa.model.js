/*
 * spa.model.js
 * モデルモジュール
 */

 /*jslint browser        : true, continue : true,
  devel : true, indent : 2, maxerr : 50,
  newcap : true, nomen : true, plusplus : true,
  regexp : true, sloppy : true, vars : true,
  white : true
  */

/*global TAFFY, $, spa */
spa.model = (function (){
    'use strict';
    var
        configMap = { anon_id : 'a0' },
        stateMap = {
            anon_user : null,
            people_cid_map : {},
            people_db : TAFFY()
        },

        isFakeData = true,

        personProto, makePerson, people, initModule;

    personProto = {
        get_is_user : function () {
            return this.cid === stateMap.user.cid;
        },
        get_is_anon : function () {
            return this.cid === stateMap.anon_user.cid;
        }
    };

    makePerson = function ( person_map ) {
        var person,
            cid     = person_map.cid,
            css_map = person_map.css_map,
            id      = person_map.id,
            name    = person_map.name;

        if ( cid === undefined || ! name ) {
            throw 'client id and name required';
        }

        person      = Object.create( personProto );
        person.cid  = cid;
        person.name = name;
        person.css_map  = css_map;

        if ( id ) { person.id = id; }

        stateMap.people_cid_map[ cid ] = person;

        stateMap.people_db.insert( person );
        return person;
    };

    people = {
        get_db      : function () {
            return stateMap.people_db;
        },
        get_cid_map : function () {
            return stateMap.people_cid_map;
        }
    };

    initModule = function () {
        var i, people_list, person_map;

        // 匿名ユーザを初期化する
        stateMap.anon_user = makePerson({
                cid : configMap.anon_id,
                id : configMap.anon_id,
                name : 'anonymous'
        });
        stateMap.user = stateMap.anon_user;

        if ( isFakeData ) {
            people_list = spa.fake.getPeopleList();
            for ( i = 0; i < people_list.length; i++ ){
                person_map = people_list[ i ];
                makePerson({
                        cid : person_map._id,
                        css_map : person_map.css_map,
                        id : person_map._id,
                        name : person_map.name
                });
            }
        }
    };

    return {
        initModule : initModule,
        people : people
    };
}());

// peopleオブジェクトAPI
// ---------------------
// peopleオブジェクトはspa.model.peopleで利用できる。
// peopleオブジェクトはpersonオブジェクトの集合を管理するためのメソッドと
// イベントを提供する。peopleオブジェクトのパブリックメソッドにはいかが含まれる。
//   * get_user() -- 現在のpersonオブジェクトを返す。
//     現在のユーザがサインインしていない場合には、匿名psrsonオブジェクトを返す。
//   * get_db() -- あらかじめソートされた全てのpersonオブジェクト
//     （現在のユーザを含む）のTaffyDBデータベースを返す。
//   * get_by_cid( <client_id> ) -- 指定された一意のIDを持つpersonオブジェクトを返す。
//   * login( <user_name> ) -- 指定のユーザ名を持つユーザとしてログインする。
//   * logout() -- 現在のユーザオブジェクトを匿名に戻す。
//
// このオブジェクトが発行するjQueryグローバルイベントにはいかが含まれる。
//   * 「spa-login」は、ユーザのログイン処理が完了した時に発行される。
//     更新されたユーザオブジェクトをデータとして提供する。
//   * 「spa-logout」はログアウトの完了時に発行される。
//     以前のユーザオブジェクトをデータとして提供する。
//
// それぞれのヒトはpersonオブジェクトで表される。
// personオブジェクトは以下のメソッドを提供する。
//   * get_is_user() -- オブジェクトが現在のユーザの場合にtrueを返す。
//   * get_is_anon() -- オブジェクトが匿名の場合にtrueを返す。
//
// personオブジェクトの属性には如何含まれる。
//   * cid -- クライアントID文字列。これは常に定義され、
//     クライアントデータがバックエンドと同期していない場合のみid属性と異なる。
//   * id -- 一意のID。オブジェクトがバックエンドと同期していない場合には未定義になることがある。
//   * name -- ユーザの文字列名。
//   * css_map -- アバター表現に使う属性のマップ。
//
//
