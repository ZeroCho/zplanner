var express = require('express');
var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('zecretary', server);
var crypto = require('crypto');

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'zecretary' database", db);
    }
});

exports.join = function (req, res) {
    db.collection('members', function (outer_error, collection) {
        var
            options_map = {safe: true},
            obj_map = req.body,
            pw = req.body.pw,
            shasum = crypto.createHash('sha256'),
            sha256pw
            ;
        shasum.update(pw);
        sha256pw = shasum.digest('hex');
        req.body.pw = sha256pw;
        console.log(sha256pw);
        if (outer_error) {
            console.log('outer_error', outer_error);
        }
        console.log(req.body);
        collection.insert(obj_map, options_map, function (inner_error, result_map) {
            if (!inner_error) {
                res.send(result_map);
            } else {
                console.log('inner_error: ', inner_error);
            }
        });
    });
};

exports.login = function (req, res) {
    var
        shasum = crypto.createHash('sha256'),
        find_map, sha256pw,
        options_map = {
            fields: {
                _id: 1,
                name: 1,
                avatar: 1,
                qst: 1,
                email: 1
            }
        }
        ;
    shasum.update(req.body.pw);
    sha256pw = shasum.digest('hex');
    find_map = {email: req.body.email, pw: sha256pw};
    db.collection('members', function (outer_error, collection) {
        if (outer_error) {
            console.log('outer_error: ' + outer_error);
        }
        collection.findOne(find_map, options_map, function (inner_error, result_map) {
            if (!inner_error) {
                res.send(result_map);
            } else {
                console.log('inner_error: ', inner_error);
            }
        });
    });
};

exports.checkEmail = function (req, res) {
    var find_map = {email: req.query.email};
    db.collection('members', function (outer_error, collection) {
        if (outer_error) {
            console.log('outer_error', outer_error);
        }
        collection.findOne(find_map, function (inner_error, result_map) {
            if (!inner_error) {
                res.send(result_map);
            } else {
                console.log('findid inner error!');
            }
        });
    });
};

exports.findid = function (req, res) {
    var find_map = {email: req.body.email};
    db.collection('members', function (outer_error, collection) {
        console.log('outer_error', outer_error);
        collection.findOne(find_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log(result_map);
                res.send(result_map);
            } else {
                console.log('findid inner error!');
            }
        });
    });
};

exports.findpw = function (req, res) {
    var find_map = {email: req.body.email, ans: req.body.ans};
    var options_map = {fields: {pw: 1}};
    console.log(find_map);
    db.collection('members', function (outer_error, collection) {
        console.log('outer_error', outer_error);
        collection.findOne(find_map, options_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log(result_map);
                res.send(result_map);
            } else {
                console.log('findpw inner error!');
            }
        });
    });
};

exports.postTodo = function (req, res) {
    db.collection('todos', function (outer_error, collection) {
        console.log('outer_error: ' + outer_error);

        var
            query_map = {
                _id: req.body._id,
                email: req.body.email
            },
            update_map = {$push: {todo: {due: req.body.due, text: req.body.text, done: false}}},
            options_map = {upsert: true}
            ;
        console.log(req.body);
        collection.update(query_map, update_map, options_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log('postTodo result: ' + result_map);
                res.send(result_map);
            } else {
                console.log(inner_error);
            }
        });
    });
};

exports.getTodo = function (req, res) {
    var find_map = {email: req.query.email};
    db.collection('todos', function (outer_error, collection) {
        console.log('outer_error', outer_error);
        collection.findOne(find_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log(result_map);
                res.send(result_map);
            } else {
                console.log('getTodo inner error!');
            }
        });
    });
};

exports.upload = function (req, res) {
    var
        find_map = {
            _id: req.body._id,
            email: req.body.email
        },
        data_list = [req.body.todo, req.body.plan, req.body.dday],
        update_map = {
            $set: {
                data: {
                    todo: data_list[0],
                    plan: data_list[1],
                    dday: data_list[2]
                }
            }
        },
        options_map = {
            upsert: true
        }

        ;

    console.log(data_list);
    db.collection('planners', function (outer_error, collection) {
        console.log('outer_error', outer_error);
        collection.update(find_map, update_map, options_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log(result_map);
                data_list.push(result_map);
            } else {
                console.log('upload inner error!');
            }
        });
    });
};

exports.download = function (req, res) {
    var
        find_map = {email: req.query.email},
        data_list = [],
        done_list = []
        ;
    db.collection('todos', function (outer_error, collection) {
        console.log('outer_error', outer_error);
        collection.findOne(find_map, function (inner_error, result_map) {
            if (!inner_error) {
                console.log(result_map);
                data_list.push(result_map);
                done_list.push('todo');
            } else {
                console.log('todo download inner error!');
            }
        });
    });
};