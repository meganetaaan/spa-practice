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

        personProto, makeCid, clearPeopleDb, completeLogin,
        makePerson, removePerson, people, initModule;

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
    personProto = {
        get_is_user : function () {
            return this.cid === stateMap.user.cid;
        },
        get_is_anon : function () {
            return this.cid === stateMap.anon_user.cid;
        }
    };

    makeCid = function () {
        return 'c' + String( stateMap.cid_serial++ );
    };

    clearPeopleDb = function () {
        var user = stateMap.user;
        stateMap.people_db  = TAFFY();
        stateMap.people_cid_map = {};
        if ( user ) {
            stateMap.people_db.insert( user );
            stateMap.people_cid_map[ user.cid ] = user;
        }
    };

    completeLogin = function ( user_list ) {
        var user_map = user_list[ 0 ];
        delete stateMap.people_cid_map[ user_map.cid ];
        stateMap.user.cid = user_map._id;
        stateMap.user.id = user_map._id;
        stateMap.user.cdd_map = user_map.css_map;
        stateMap.people_cid_map[ user_map._id ] = stateMap.user;

        // チャットを追加するときには、ここで参加すべき
        $.gevent.publish( 'spa-login', [ stateMap.user ] );
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

    removePerson = function ( person ) {
        if ( ! person ) { return false; }
        // 匿名ユーザは削除できない
        if ( person.id === configMap.anon_id ) {
            return false;
        }

        stateMap.people_db({ cid : person.cid }).remove();
        if ( person.cid ){
            delete stateMap.people_cid_map[ person.cid ];
        }
        return true;
    };

    people = (function () {
        var get_by_cid, get_db, get_user, login, logout;

        get_by_cid = function ( cid ) {
            return stateMap.people_cid_map[ cid ];
        };

        get_db      = function () { return stateMap.people_db; };

        get_user = function () { return stateMap.user; };
        
        login = function ( name ) {
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

            stateMap.user = makePerson({
                    cid : makeCid(),
                    css_map : {top: 25, left: 25, 'background-color':'#8f8'},
                    name : name
            });

            sio.on( 'userupdate', completeLogin );

            sio.emit( 'adduser', {
                    cid : stateMap.user.cid,
                    css_map : stateMap.user.css_map,
                    name : stateMap.user.name
            });
        };

        logout = function () {
            var is_removed, user = stateMap.user;
            // チャットを追加するときには、ここでチャットルームから出るべき
            //
            is_removed = removePerson( user );
            stateMap.user = stateMap.anon_user;

            $.gevent.publish( 'spa-logout', [ user ] );
            return is_removed;
        };

        return {
            get_by_cid : get_by_cid,
            get_db     : get_db,
            get_user   : get_user,
            login      : login,
            logout     : logout
        };
    }());

    // chatオブジェクトAPI
    // -------------------
    // chatオブジェクトはspa.model.chatで利用できる。
    // chatオブジェクトはチャットメッセージングを管理するためのメソッドとイベントを
    // 提供する。chatオブジェクトのパブリックメソッドにはいかが含まれる。
    //   * join() -- チャットルームに参加する。このルーチンは、
    //     「spa-listchange」と「spa-updatechat」グローバルカスタムイベント
    //     のためのパブリッシャを含むバックエンドとのチャットプロトコルを確立する。
    //     現在のユーザが匿名の場合、join()は中断してfalseを返す。
    //   * get_chatee() -- ユーザがチャットしている相手のpersonオブジェクトを返す。
    //     チャット相手がいない場合はnullを返す。
    //   * set_chatee( <person_id> ) -- チャット相手をperson_idで特定されるユーザに
    //     設定する。person_idがユーザリストに存在しない場合は、チャット相手をnullに設定する。
    //     指定されたユーザが既にチャット相手の場合はfalseを返す。
    //     「spa-setchatee」グローバルカスタムイベントを発行する。
    //   * send_msg( <msg_text> ) -- チャット相手にメッセージを送信する。
    //     「spa-updatechat」グローバルカスタムイベントを発行する。
    //     ユーザが匿名またはチャット相手がnullの場合は、中断してfalseを返す。
    //   * update_avatar( <update_avtr_map> ) -- バックエンドに
    //     update_avtr_mapを送信する。これにより、更新されたユーザリストと
    //     アバター情報（personオブジェクトのcss_map）を含む「spa-listchange」イベントが発行される。
    //     update_avtr_mapは以下の様な形式でなければいけない
    //     { update_id : person_id, css_map : css_map }
    //
    // このオブジェクトが発行するjQueryグローバルカスタムイベントイベントには以下が含まれる。
    //   * spa-setchatee -- これは新しいチャット相手が設定された時に発行される。
    //     以下の形式のマップをデータとして提供する。
    //     { old_chatee : <old_chatee_person_object>,
    //       new_chatee : <new_chatee_person_object>
    //       }
    //   * spa-listchange -- これはオンラインユーザのリスト長が変わったとき
    //     （ユーザがチャットに参加または退出したとき）、
    //     または内容が変わったとき（ユーザのアバター詳細が代変わったとき）に発行される。
    //     このイベントへの登録者は、更新データとしてpeopleモデルからpeople_dbを取得すべき。
    //   * spa-updatechat -- これは新しいメッセージを送受信した時に発行される。
    //     以下の形式のマップをデータとして提供する。
    //       { dest_id : <chatee_id>,
    //         dest_name : <chatee_name>,
    //         sender_id : <sender_id>,
    //         msg_text : <message_content>
    //         }
    //
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

