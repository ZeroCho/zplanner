zp.model = (function () {
	'use strict';
	var
		stateMap = {
			local_db : null,
			remote_db: null,
			dbhost   : null
		},
		initModule, configModule, deleteItem, todoToggle,
		setDday, getDday, sync, login, join, checkId, logout, findId, changePw,
		setTodo, setPlan, getTodo, getPlan, getInfo, upload, download, checkAnswer;
	// 로그인 로그아웃 관련 함수
	login = function (data) {
		var deferred = $.Deferred(),
			db = stateMap.remote_db;
		db.login(data.id, data.pw).then(function () {
			return db.getUser(data.id);
		}).then(function (doc) {
			deferred.resolve(doc);
			console.log(doc);
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	logout = function () {
		var deferred = $.Deferred(),
			db = stateMap.remote_db;
		db.logout().then(function (doc) {
			deferred.resolve(doc);
			configModule();
			console.log(doc);
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	//
	checkId = function (id) {
		var db = stateMap.remote_db,
			deferred = $.Deferred();
		db.getUser(id).then(function (doc) {
			console.log(doc);
			deferred.reject(doc);
		}).catch(function (err) {
			console.log(err);
			deferred.resolve(err);
		});
		return deferred.promise();
	};
	join = function (data) {
		var db = stateMap.remote_db,
			deferred = $.Deferred();
		db.signup(data.id, data.pw, {
			metadata: {
				email : data.email,
				nick  : data.nick,
				qst   : data.qst,
				ans   : data.ans,
				avatar: data.avatar
			}
		}).then(function (doc) {
			console.log(doc);
			deferred.resolve(doc);
		}).catch(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	findId = function (id) {
		var deferred = $.Deferred(),
			db = stateMap.remote_db;
		db.getUser(id).then(function (doc) {
			console.log(doc);
			deferred.resolve(doc);
		}).catch(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	checkAnswer = function (data) {
		var deferred = $.Deferred(),
			db = stateMap.remote_db;
		db.getUser(data.id).then(function (doc) {
			if (data.ans === doc.ans) {
				deferred.resolve(doc);
			} else {
				deferred.reject('wrong answer');
			}
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	changePw = function (data) {
		var deferred = $.Deferred(),
			db = stateMap.remote_db;
		db.login('pwchanger', 'pwchanger').then(function () {
			return db.changePassword(data.id, data.pw);
		}).then(function () {
			return db.logout();
		}).then(function (doc) {
			deferred.resolve(doc);
			console.log(doc);
		}).catch(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	setTodo = function (data) {
		var deferred = $.Deferred();
		stateMap.local_db.put(data).then(function (result) {
			deferred.resolve(result);
		}).catch(function (err) {
			console.log(err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getTodo = function (start, end) {
		var todo = [], i = 0, rows, len,
			deferred = $.Deferred();
		if (!start && !end) {
			start = 0;
			end = 1000000000000000000;
		}
		stateMap.local_db.query(function (doc, emit) {
			if (doc.type === 'todo' && doc._id > start && doc._id < end) {
				emit(doc);
			}
		}).then(function (todos) {
			rows = todos.rows;
			len = rows.length;
			for (i; i < len; i++) {
				todo.push(rows[i].key);
			}
			deferred.resolve(todo);
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	todoToggle = function (id, bool) {
		stateMap.local_db.get(id).then(function (doc) {
			doc.done = bool;
			return stateMap.local_db.put(doc);
		}).then(function (doc) {
			console.log(doc);
		}).catch(function (err) {
			console.log(err);
		});
	};
	setPlan = function (dataList) {
		var deferred = $.Deferred();
		stateMap.local_db.bulkDocs(dataList).then(function (result) {
			deferred.resolve(result);
		}).catch(function (err) {
			console.log(err);
			deferred.reject(err);
			alert('error!');
		});
		return deferred.promise();
	};
	getPlan = function (start, end) {
		var plan = [], i = 0, rows, len,
			deferred = $.Deferred();
		if (!start && !end) {
			start = 0;
			end = 10000000000000000000;
		}
		stateMap.local_db.query(function (doc, emit) {
			if (doc.type === 'plan' && doc._id > start && doc._id < end) {
				emit(doc);
			}
		}).then(function (plans) {
			rows = plans.rows;
			len = rows.length;
			for (i; i < len; i++) {
				console.log(rows[i]);
				plan.push(rows[i].key);
			}
			deferred.resolve(plan);
		}).catch(function (err) {
			console.log('plan', err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	setDday = function (data) {
		var deferred = $.Deferred();
		stateMap.local_db.put(data).then(function (result) {
			deferred.resolve(result);
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getDday = function (start, end) {
		var
			dday = [],
			i = 0,
			rows, len,
			deferred = $.Deferred();
		if (!start && !end) {
			start = 0;
			end = 10000000000000000000;
		}
		stateMap.local_db.query(function (doc, emit) {
			if (doc.type === 'dday' && doc._id > start && doc._id < end) {
				emit(doc);
			}
		}).then(function (ddays) {
			rows = ddays.rows;
			len = rows.length;
			for (i; i < len; i++) {
				console.log(rows[i]);
				dday.push(rows[i].key);
			}
			deferred.resolve(dday);
		}).catch(function (err) {
			console.log('dday', err);
			deferred.reject(err);
		});
		return deferred.promise();
	};
	deleteItem = function (id) {
		var deferred = $.Deferred();
		stateMap.local_db.get(id).then(function (doc) {
			return stateMap.local_db.remove(doc);
		}).then(function (result) {
			deferred.resolve(result);
		}).catch(function (err) {
			deferred.reject(err);
		});
		return deferred.promise();
	};
	getInfo = function () {
		return true;
	};
	sync = function (email) {
		var
			deferred = $.Deferred(),
			local = stateMap.local_db,
			opt = {live: true};
		local.replicate.to(stateMap.dbhost + email, opt, function (err) {
			console.log(err);
		});
		local.replicate.from(stateMap.dbhost + email, opt, function (err) {
			console.log(err);
		});
		return deferred.promise();
	};
	upload = function (email) {
		var
			deferred = $.Deferred(),
			local = stateMap.local_db;
		local.replicate.to(stateMap.dbhost + email, function (err) {
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
		var
			deferred = $.Deferred(),
			local = stateMap.local_db;
		local.replicate.from(stateMap.dbhost + email, function (err) {
			if (err) {
				console.log(err);
				deferred.reject(err);
			} else {
				deferred.resolve();
			}
		});
		return deferred.promise();
	};
	configModule = function (dbuser, dbhost) {
		var options = {
			auto_compaction: true
		};
		if (dbhost === null || dbhost === undefined) {
			dbhost = 'http://zerohch0.iriscouch.com/';
		}
		if (dbuser) {
			stateMap.remote_db = new PouchDB(dbhost + dbuser, options);
		} else {
			stateMap.remote_db = new PouchDB(dbhost + '/zerohch0', options);
		}
		stateMap.dbhost = dbhost;
	};
	initModule = function () {
		var options = {
			auto_compaction: true
		};
		configModule();
		stateMap.local_db = new PouchDB('local', options);
		return true;
	};
	return {
		todoToggle  : todoToggle,
		configModule: configModule,
		initModule  : initModule,
		login       : login,
		logout      : logout,
		setTodo     : setTodo,
		getTodo     : getTodo,
		setPlan     : setPlan,
		getPlan     : getPlan,
		getInfo     : getInfo,
		setDday     : setDday,
		getDday     : getDday,
		sync        : sync,
		join        : join,
		checkId     : checkId,
		upload      : upload,
		download    : download,
		findId      : findId,
		changePw    : changePw,
		checkAnswer : checkAnswer,
		deleteItem  : deleteItem
	};
}());