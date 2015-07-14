zp.model = (function () {
    'use strict';
    var configMap = {
            anon_idx: 0
        },
        stateMap = {
            anon_user: null,
            db: new PouchDB('anon')
        },
        initModule,
        set_dday, get_dday, sync, login, join, check_email,
        set_todo, set_plan, get_todo, get_plan, get_info, upload, download;

    check_email = function (email) {
        var db = new PouchDB('http://zerohch0.iriscouch.com/members'),
            deferred = $.Deferred();
        db.get(email).then(function (doc) {
            console.log(doc);
            deferred.reject(doc);
        }).catch(function (err) {
            console.log(err);
            deferred.resolve(err);
        });
        return deferred.promise();
    };

    join = function (data) {
        var db = new PouchDB('http://zerohch0.iriscouch.com/members'),
            deferred = $.Deferred();
        db.put(data).then(function (doc) {
            console.log(doc);
            deferred.resolve(doc);
        }).catch(function (err) {
            console.log(err);
            deferred.reject(err);
        });
        return deferred.promise();
    };

    login = function (data) {
        var deferred = $.Deferred(),
            db = new PouchDB('http://zerohch0.iriscouch.com/members');
        db.get(data.email, {include_docs: true}).then(function (doc) {
            console.log(doc);
            if (doc.pw === data.pw) {
                deferred.resolve(doc);
            } else {
                deferred.reject('비밀번호가 틀립니다.');
            }
        }).catch(function (err) {
            console.log(err);
            deferred.reject('아이디가 존재하지 않습니다.');
        });
        return deferred.promise();
    };

    set_todo = function (data) {
        var db = new PouchDB('anon'),
            deferred = $.Deferred();
        if (localStorage.user === 'anon') {
            db = new PouchDB('anon');
        } else {
            db = new PouchDB(JSON.parse(localStorage.user)._id);
        }
        db.put(data).then(function (result) {
            deferred.resolve(result);
            return true;
        }).catch(function (err) {
            console.log(err);
            deferred.reject(err);
            return false;
        });
        return deferred.promise();
    };

    get_todo = function () {
        var todo = [], i = 0, rows, len,
            deferred = $.Deferred(),
            db = new PouchDB('anon');
        db.allDocs({
            include_docs: true
        }).then(function (todos) {
            console.log(todos);
            rows = todos.rows;
            len = rows.length;
            for (i; i < len; i++) {
                console.log(rows[i]);
                todo.push(rows[i].doc);
            }
            deferred.resolve(todo);
        }).catch(function (err) {
            console.log('todo', err);
            deferred.reject(err);
        });
        return deferred.promise();
    };

    set_plan = function (data) {
        var db = new PouchDB('anon'),
            deferred = $.Deferred();
        db.put(data).then(function (result) {
            $.gevent.publish('submit', ['plan']);
            console.log('plan registered', result);
            return true;
        }).catch(function (err) {
            console.log(err);
            alert('error!');
            return false;
        });
        return deferred.promise();
    };

    get_plan = function () {
        var plan = [], i = 0, rows, len,
            deferred = $.Deferred();
        configMap.plans.allDocs({
            include_docs: true,
            attachments: true
        }).then(function (plans) {
            console.log(plans);
            rows = plans.rows;
            len = rows.length;
            for (i; i < len; i++) {
                console.log(rows[i]);
                plan.push(rows[i].doc);
            }
            $.gevent.publish('getPlan', [plan]);
        }).catch(function (err) {
            console.log('plan', err);
        });
        return deferred.promise();
    };

    set_dday = function (data) {
        var db = new PouchDB('anon'),
            deferred = $.Deferred();
        db.put(data).then(function (result) {
           deferred.resolve(result);
            return true;
        }).catch(function (err) {
            deferred.reject(err);
            return false;
        });
        return deferred.promise();
    };

    get_dday = function () {
        var dday = [], i = 0, rows, len,
            deferred = $.Deferred(),
            db = new PouchDB('anon');
        db.allDocs({
            include_docs: true
        }).then(function (ddays) {
            console.log(ddays);
            rows = ddays.rows;
            len = rows.length;
            for (i; i < len; i++) {
                console.log(rows[i]);
                dday.push(rows[i].doc);
            }
            $.gevent.publish('getDday', [dday]);
        }).catch(function (err) {
            console.log('dday', err);
        });
        return deferred.promise();
    };

    get_info = function () {
        return true;
    };

    sync = function (email) {
        var deferred = $.Deferred(),
            local = new PouchDB('anon');
        local.replicate.to('http://zerohch0.iriscouch.com/' + email, {live: true}, function (err) {
            console.log(err);
        });
        local.replicate.from('http://zerohch0.iriscouch.com/' + email, {live: true}, function (err) {
            console.log(err);
        });
        return deferred.promise();
    };

    upload = function (email) {
        var deferred = $.Deferred(),
            local = new PouchDB('anon');
        local.replicate.to('http://zerohch0.iriscouch.com/' + email, {live: true}, function (err) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    };
    download = function (email) {
        var deferred = $.Deferred(),
            local = new PouchDB('anon');
        local.replicate.from('http://zerohch0.iriscouch.com/' + email, {live: true}, function (err) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise();
    };

    initModule = function () {
        if (localStorage.online === 'false') {
            stateMap.anon_user = true;
        }
        return true;
    };

    return {
        initModule: initModule,
        login: login,
        setTodo: set_todo,
        getTodo: get_todo,
        setPlan: set_plan,
        getPlan: get_plan,
        getInfo: get_info,
        setDday: set_dday,
        getDday: get_dday,
        sync: sync,
        join: join,
        checkEmail: check_email,
        upload: upload,
        download: download
    };
}());