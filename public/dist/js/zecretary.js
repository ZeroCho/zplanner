/*
 * zp.js
 * 루트 네임스페이스 모듈 
 */

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/

/*global $, zp */

var zp = (function () {
	'use strict';
	var initModule = function ($container) {
		//zp.data.initModule();
		zp.model.initModule();
		zp.shell.initModule($container);
	};
	return {
		initModule: initModule
	};
}());
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
/*
 * zp.util.js
 * 범용 자바스크립트 유틸리티
 *
 * Michael S. Mikowski - mmikowski at gmail dot com
 * 웹에서 영감을 받아 1998년부터 계속해서 
 * 작성, 컴파일, 수정한 루틴이다.
 *
 * MIT License 
 *
 */

 /*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, zp */

zp.util = (function () {
	var makeError, setConfigMap;

	// public 생성자 /makeError/ 시작
	// 목적	: 에러 객체 생성을 위한 편의 래퍼
	// 인자	:
	//	* name_text – 에러명
	//	* msg_text – 상세 에러 메시지
	//	* data – 선택적으로 에러 객체에 첨부할 데이터
	// 반환값	: 새로 생성한 에러 객체 
	// 예외 	: 없음
	//
	makeError = function ( name_text, msg_text, data ) {
    	var error = new Error();
		error.name = name_text;
 		error.message = msg_text;
 
 		if ( data ){ error.data = data; }
 
 		return error;
 	};
	// public 생성자 /makeError/ 끝

	// public 메서드 /setConfigMap/ 시작
	// 목적	: 기능 모듈에서 설정을 지정하기 위한 공통 코드 
	// 인자	:
	//	* input_map – 설정에서 지정할 키-값 맵 
	//	* settable_map – 설정 가능한 키 맵
	//	* config_map – 설정을 적용할 맵
	// 반환값	: true
	// 예외 	: 입력 키가 허용되지 않은 키이면 예외를 던짐
	//
	setConfigMap = function ( arg_map ){
    	var
	        input_map = arg_map.input_map,
	        settable_map = arg_map.settable_map,
	        config_map = arg_map.config_map,
	        key_name, error;
        
        for ( key_name in input_map ){
        	if ( input_map.hasOwnProperty( key_name ) ){
            	if ( settable_map.hasOwnProperty( key_name ) ){
                	config_map[key_name] = input_map[key_name];
            	}
            	else {
            		error = makeError( 'Bad Input',
                		'Setting config key |' + key_name + '| is not supported'
                	);
                	throw error;
            	}
        	}
    	}
	};
	// public 메서드 /setConfigMap/ 끝 

	return {
		makeError : makeError,
      	setConfigMap : setConfigMap
  	};
}());

/**
 * zp.util_b.js
 * 자바스크립트 브라우저 유틸리티 
 *
 * Michael S. Mikowski가 컴파일
 * 웹에서 영감을 얻어
 * 1998년부터 작성하고 수정한 루틴
 * MIT 라이선스
 */

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/

/*global $, zp, getComputedStyle */
zp.util_b = (function () {
    'use strict';
	//---------------- 모듈 스코프 변수 시작-------------- 
	var
		configMap = {
			regex_encode_html 	: /[&"'><]/g,
			regex_encode_noamp 	: /["'><]/g, 
			html_encode_map  	: {
            	'&' : '&#38;',
            	'"' : '&#34;',
            	"'" : '&#39;',
            	'>' : '&#62;',
            	'<' : '&#60;'
			} 
		},
    
    	decodeHtml, encodeHtml, getEmSize;
	
	configMap.encode_noamp_map = $.extend(
    	{}, configMap.html_encode_map
	);
	delete configMap.encode_noamp_map['&']; 
	//----------------- 모듈 스코프 변수 끝---------------

	//------------------- 유틸리티 메서드 시작------------------
	// decodeHtml 시작
	// HTML 엔티티를 브라우저 친화적으로 디코딩한다.
	// http://stackoverflow.com/questions/1912501/\ 
	// unescape-html-entities-in-javascript 참고
	//
	decodeHtml = function ( str ) {
    	return $('<div/>').html(str || '').text();
	};
	// decodeHtml 끝


 	// encodeHtml 시작
	// 모든 HTML 엔티티는 이 인코더를 통과한다. 
	// 이 인코더는 임의 개수의 문자를 처리한다. 
	//
	encodeHtml = function ( input_arg_str, exclude_amp ) {
	    var
			input_str = String( input_arg_str ),
	        regex, lookup_map
			;	
	    
	    if ( exclude_amp ) {
			lookup_map = configMap.encode_noamp_map;
	        regex = configMap.regex_encode_noamp;
		}
		else {
	        lookup_map = configMap.html_encode_map;
	        regex = configMap.regex_encode_html;
	    }
	    return input_str.replace(regex,
	        function (match) {
	            return lookup_map[ match ] || '';
	        }
		); 
	};
	// encodeHtml 끝
	
	// getEmSize 시작
	// em 크기를 픽셀값으로 반환
	//
	getEmSize = function ( elem ) {
		return Number(
    		getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
		);
	};
	// getEmSize 끝

	// 노출 메서드 
	return {
		decodeHtml : decodeHtml,
		encodeHtml : encodeHtml,
		getEmSize : getEmSize
	};
	//------------------- public 메서드 끝 --------------------- 
}());

zp.calendar = (function () {
	'use strict';
	var
		configMap = {
			main_html: String()
				+ '<table class="calendar-table">'
					+ '<caption class="calendar-caption"></caption>'
					+ '<thead>'
						+ '<tr>'
							+ '<th>주</th>'
							+ '<th>일</th>'
							+ '<th>월</th>'
							+ '<th>화</th>'
							+ '<th>수</th>'
							+ '<th>목</th>'
							+ '<th>금</th>'
							+ '<th>토</th>'
						+ '</tr>'
					+ '</thead>'
					+ '<tbody>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
					+ '</tbody>'
				+ '</table>'
			,
			day_list: ['일', '월', '화', '수', '목', '금', '토']
		},
		stateMap = {
			$container: null
		},
		jqueryMap = {},
		initModule, setJqueryMap, setHoliday,
		setCalendar, getWeekNum, daysInMonth, dayOfYear,
		objectify, stringify, getWeekDay, lunarSolar,
		getPrevDate, getNextDate, getNextString, getPrevString, dayOfWeek;

	setJqueryMap = function ($container) {
		var i = 0;
		jqueryMap = {
			$container: $container,
			$table: $container.find('table'),
			$caption: $container.find('caption')
		};
		for (i; i <= 6; i++) {
			jqueryMap['$tr' + i] = $container.find('tr:eq(' + i + ')');
		}
	};

	initModule = function ($container, data) {
		var
			month = data.month,
			year = data.year;
		stateMap.$container = $container;

		$container.html(configMap.main_html);
		setJqueryMap($container);
		setCalendar(month, year);
	};


	setCalendar = function (month, year) {
		month = parseInt(month, 10);
		year = parseInt(year, 10);
		var
			date = new Date(),
			date_idx = 1, j = 2,
			first_day, last_date, i, num_week, $td,
			today = new Date();

		// 날짜를 1일로 맞춘다
		date.setYear(year);
		date.setMonth(month - 1);
		date.setDate(1);
		first_day = date.getDay();

		// 날짜를 마지막 날짜로 맞춘다
		date.setMonth(month);
		date.setDate(date.getDate() - 1);
		last_date = date.getDate();

		jqueryMap.$caption.html(month + '월');
		num_week = getWeekNum(date_idx, month, year);

		for (i = first_day; i < 7; i++) {
			jqueryMap.$tr1.find('th').html(num_week + '주');
			jqueryMap.$tr1.find('td').eq(i).append('<div>' + date_idx + '</div>');
			date_idx++;
		}
		num_week++;

		while (date_idx <= last_date - 7) {
			for (i = 0; i < 7; i++) {
				jqueryMap['$tr' + String(j)].find('th').html(num_week + '주');
				jqueryMap['$tr' + String(j)].find('td').eq(i).append('<div>' + date_idx + '</div>');
				date_idx++;
			}
			j++;
			num_week++;
		}

		for (i = 0; date_idx <= last_date; i++) {
			jqueryMap['$tr' + String(j)].find('th').html(num_week + '주');
			jqueryMap['$tr' + String(j)].find('td').eq(i).append('<div>' + date_idx + '</div>');
			date_idx++;
		}

		// 날짜가 없는 줄 제거
		switch (j) {
			case 4:
				jqueryMap.$tr5.addClass('hidden');
				jqueryMap.$tr6.addClass('hidden');
				break;
			case 5:
				jqueryMap.$tr6.addClass('hidden');
				break;
			default:
				break;
		}
		// 오늘 날짜 표시
		if ((year === today.getFullYear()) && (month === today.getMonth() + 1)) {
			$td = jqueryMap.$table.find('td');
			$td.each(function() {
				if (parseInt($(this).find('div').eq(0).html(), 10) === today.getDate()) {
					$(this).addClass('td-today');
				}
			});
		}
		setHoliday(month, year);
	};

	setHoliday = function (month, year) {
		var $td = jqueryMap.$table.find('td'),
			newYear = lunarSolar(year + '0101', 'ltos'),
			buddha = lunarSolar(year + '0408', 'ltos'),
			thanksGiving = lunarSolar(year + '0815', 'ltos'),
			today;

		if (month === newYear.month) { // 설
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (
					today === newYear.day ||
					today === newYear.day - 1 ||
					today === newYear.day + 1
				) {
					$(this).css('color', 'red');
				}
			});
		}
		else if (month === buddha.month) { // 석가탄신일
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (today === buddha.day) {
					$(this).css('color', 'red');
				}
			});
		}
		else if (month === thanksGiving.month) { // 추석
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (
					today === thanksGiving.day ||
					today === thanksGiving.day - 1 ||
					today === thanksGiving.day + 1
				) {
					$(this).css('color', 'red');
				}
			});
		}
		switch (month) {
			case 1:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 1) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 3:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 1) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 5:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 5) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 6:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 6) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 8:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 15) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 10:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 3 || parseInt($(this).text(), 10) === 9) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 12:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 25) {
						$(this).css('color', 'red');
					}
				});
				break;
			default:
				break;
		}
		return true;
	};

	// 공통 calendar 함수 모음
	lunarSolar = function (input_day, direction) {
		if (direction !== 'ltos' && direction !== 'stol') {
			return false;
		}
		// 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
		// (윤달이 있는 달 - 평달이 작고 윤달도 작으면 :3 , 평달이 작고 윤달이 크면 : 4)
		// (윤달이 있는 달 - 평달이 크고 윤달이 작으면 :5,  평달과 윤달이 모두 크면 : 6)
		var
			kk = [
				[1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],   /* 1841 */
				[2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2],   /* 1851 */
				[2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1861 */
				[2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1871 */
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],   /* 1881 */
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
				[1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
				[2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
				[1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
				[2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
				[2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
				[2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
				[1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
				[2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
				[1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
				[2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]
			],
			md = [31,0,31,30,31,30,31,31,30,31,30,31],
			year = input_day.substring(0,4),
			month = input_day.substring(4,6),
			day = input_day.substring(6,8),
			lyear, lmonth, lday, leapyes, syear, smonth, sday,
			mm, y1, y2, m1, m2, i, j, td, ly, lm, ld, sy, sy1, sm, sd, td1, td2,
			dt = [203];
		if ( direction === 'stol') { // 양력을 음력으로 변환
			// 기준일자 양력 1841 년 1 월 23 일 (음력 1840 년 1 월 1 일) 계산
			td1 = (1840 * 365) + (1840 / 4) - (1840 / 100) + (1840 / 400) + 23;
			sy = year;          // 년도 check
			sm = month;         // 월 check
			md[1] = daysInMonth(2, sy);           // 윤년 check
			sd = day || md[sm-1];    // 일수 check
			sy1 = sy - 1;
			td2 = sy1 * 365 + sy1 / 4 - sy1 / 100 + sy1 / 400 + parseInt(sd, 10);
			for (i = 0; i < sm - 1; i++) {
				td2 = td2 + md[i];
			}
			td =  td2 - td1 + 1;
			for (i = 0; i <= sy - 1841; i++) {
			   	dt[i] =0;
				for(j = 0; j < 12; j++) {
					switch(kk[i][j]) {
					    case 1 :
						    mm=29;
						    break;
					    case 2 :
						    mm=30;
						    break;
					    case 3 :
						    mm=58;     // 29+29
							break;
					    case 4 :
							mm=59;     // 29+30
							break;
					    case 5 :
						    mm=59;     // 30+29
						    break;
						case 6 :
						    mm=60;     // 30+30
						    break;
					}
					dt[i] = dt[i] + mm;
				}
			}
			ly =0 ;
			while (true) {
				if (td > dt[ly] ) {
					td = td - dt[ly];
					ly = ly + 1;
				}
				else {
					break;
				}
			}
			lm=0;
			while (true) {
				if (kk[ly][lm] <= 2) {
					mm = kk[ly][lm] +28;
					if (td > mm) {
						td = td - mm;
						lm = lm +1;
					}
					else {
						break;
					}
				}
				else {
					switch (kk[ly][lm]) {
						case 3:
							m1 = 29;
							m2 = 29;
							break;
						case 4:
							m1 = 29;
							m2 = 30;
							break;
						case 5:
							m1 = 30;
							m2 = 29;
							break;
						case 6:
							m1 = 30;
							m2 = 30;
							break;
					}
					if (td > m1) {
						td = td - m1;
						if (td > m2) {
							td = td - m2;
							lm = lm + 1;
						}
						else {
							break;
						}
					}
					else {
					    break;
					}
				}
			}
			ly = ly + 1841;
			lm = lm + 1;
			ld = td;

			return {
				year: ly,
				month: lm,
				day: ld
			};
		}
		if ( direction === 'ltos' ) {
			// 음력에서 양력으로 변환
			lyear = year;        // 년도 check
			lmonth = month;     // 월 check
			y1 = lyear - 1841;
			m1 = lmonth - 1;
			leapyes = 0;
			if (kk[y1][m1] > 2)  {
				switch (kk[y1][m1]) {
					case 1:
					case 3:
					case 4:
						mm = 29;
						break;
					case 2:
					case 5:
					case 6:
						mm = 30;
						break;
				}
			}

			lday = day;

			td = 0;
			for (i = 0; i < y1; i++) {
				for (j = 0; j < 12; j++) {
					switch (kk[i][j]) {
					   	case 1:
							td = td + 29;
							break;
					   	case 2:
							td = td + 30;
							break;
					   	case 3:
							td = td + 58;    // 29+29
							break;
					  	case 4:
							td = td + 59;    // 29+30
							break;
					   	case 5:
							td = td + 59;    // 30+29
							break;
					   	case 6:
							td = td + 60;    // 30+30
							break;
				   	}
				}
			}
			for (j=0; j < m1; j++) {
				switch (kk[y1][j]) {
					case 1:
						td = td + 29;
						break;
					case 2:
						td = td + 30;
						break;
					case 3:
						td = td + 58;    // 29+29
						break;
					case 4:
						td = td + 59;    // 29+30
						break;
					case 5:
						td = td + 59;    // 30+29
						break;
					case 6:
						td = td + 60;    // 30+30
						break;
				}
			}
			if (leapyes === 1) {
				switch(kk[y1][m1]) {
					case 3:
					case 4:
						td = td + 29;
						break;
					case 5:
					case 6:
						td = td + 30;
						break;
				}
			}
			td =  td + parseFloat(lday) + 22;
			// td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
			y1 = 1840;
			while (true) {
				y1 = y1 +1;
				if  ((y1 % 400 === 0) || ((y1 % 100 !== 0) && (y1 % 4 === 0))) {
					y2 = 366;
				}
				else {
					y2 = 365;
				}
				if (td <= y2) {
					break;
				}
				td = td- y2;
			}
			syear = y1;
			md[1] = parseInt(y2, 10) -337;
			m1 = 0;
			while (true) {
				m1= m1 + 1;
				if (td <= md[m1-1]) {
					break;
				}
				td = td - md[m1-1];
			}
			smonth = parseInt(m1, 10);
			sday = parseInt(td, 10);

			return {
				year: syear,
				month: smonth,
				day: sday
			};
		}
	};

	getNextDate = function (data, interval) {
		var date, obj;
		if (!interval) {interval = 1;}
		date = new Date(data.year, data.month - 1, parseInt(data.date,10) + interval);
		obj = {
			date: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};
		obj.week = getWeekNum(obj.date, obj.month, obj.year);
		obj.day = new Date(obj.year, obj.month - 1, obj.date).getDay();
		return obj;
	};
	getPrevDate = function (data, interval) {
		var date, obj;
		if (!interval) {interval = 1;}
		date = new Date(data.year, data.month - 1, data.date - interval);
		obj = {
			date: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};
		obj.week = getWeekNum(obj.date, obj.month, obj.year);
		obj.day = new Date(obj.year, obj.month - 1, obj.date).getDay();
		return obj;
	};

	getPrevString = function (str, interval) {
		if (!interval) {interval = 1;}
		var obj = getPrevDate(str, interval);
		return stringify(obj);
	};

	getNextString = function (str, interval) {
		if (!interval) {interval = 1;}
		var obj = getNextDate(str, interval);
		return stringify(obj);
	};

	stringify = function (data, delimiter) {
		var string = '',
			date = data.date,
			month = data.month,
			year = data.year,
			week;
		if (!delimiter) {delimiter = '';}
		string += year;
		if (data.week) {
			week = data.week;
			string = string + delimiter + week;
		} else if (month) {
			if (month < 10) {string += 0;}
			string = string + delimiter + month;
		}
		if (date) {
			if (date < 10 ) {string += 0;}
			string = string + delimiter +date;
		}
		return string;
	};

	objectify = function (str) {
		if (typeof str !== 'string') {
			console.warn('인자는 문자열이어야 합니다.');
			return false;
		}
		var obj, year, month, date;
		if (str.length === 8) {
			year = str.substr(0, 4);
			month = str.substr(4, 2);
			date = str.substr(6, 2);
		} else if (str.length === 10) {
			year = str.substr(0,4);
			month = str.substr(5,2);
			date = str.substr(8,2);
		}
		obj = {
			year: parseInt(year, 10),
			month: parseInt(month, 10),
			date: parseInt(date, 10),
			week: getWeekNum(year, month, date)
		};
		return obj;
	};

	dayOfWeek = function (date, month, year) {
		if (!year) {year = new Date().getFullYear();}
		var day = new Date(year, month - 1, date).getDay();
		return configMap.day_list[day];
	};

	dayOfYear = function (date, month, year) {
		var
			daysList = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			i = 0,
            total = 0;
		if (!year) {year = new Date().getFullYear();}
		if (daysInMonth(2, year) === 29) {daysList[1] = 29;}
		// 인자로 년월일을 입력했을 경우
		if (month) {
			// 전달까지의 날짜를 다 더한다
			while (i < month - 1) {
				total += daysList[i];
				i++;
			}
			total += date;
			return total;
		}
		// 인자로 0~366 사이의 숫자를 입력했을 경우
		while (date > 0) {
			date -= daysList[i];
			i++;
		}
		month = i;
		date += daysList[i - 1];
		return {
			month: month,
			date: date,
			year: year
		};
	};

	daysInMonth = function (month, year) {
		if (!year) {
			year = new Date().getFullYear();
		}
		return new Date(year, month, 0).getDate();
	};

	// 해당주의 날짜들을 배열로 돌려주는 함수
	getWeekDay = function (week, year) {
		var
			i = 0,
			firstDay = new Date(year, 0, 1).getDay(),
			list = [],
			days, result;
		if (!year) {
			year = new Date().getFullYear();
		}
		days = week * 7 - firstDay - 6;
		for (i; i < 7; i++) {
			result = dayOfYear(days);
			list[i] = {
				month: result.month,
				date: result.date
			};
			days++;
		}
		return list;
	};

	// 해당일이 그 해의 몇 번째 주인지 찾는 함수
	// 인자: date, month[, year] 또는 dateString
	getWeekNum = function (date, month, year) {
		var
			firstDay = new Date(year, 0, 1).getDay(),
			dayOfToday = new Date(year, month - 1, date).getDay(),
			offset = 6 - dayOfToday,
			weekNum, total;
		if (!year) {
			year = new Date().getFullYear();
		}
		total = dayOfYear(date, month, year) + firstDay + offset;
		weekNum = Math.floor(total / 7);

		// 각 달의 1일이 금, 토면 그 주는 전달 마지막 주로 친다.
		if (firstDay > 4) {
			weekNum -= 1;
		}
		return weekNum;
	};

	return {
		initModule: initModule,
		getWeekNum: getWeekNum,
		dayOfYear: dayOfYear,
		getWeekDay: getWeekDay,
		daysInMonth: daysInMonth,
		dayOfWeek: dayOfWeek,
		stringify: stringify,
		objectify: objectify,
		lunarSolar: lunarSolar,
		getPrevDate: getPrevDate,
		getNextDate: getNextDate,
		getPrevString: getPrevString,
		getNextString: getNextString
	};
}());
/*
 * zp.shell.js 
 * zecretary 셸 모듈
 */

/*jslint           browser : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true, todo    : true
 */

/*전역 $, zp */
zp.shell = (function () {
	'use strict';
	var
		configMap = {
			anchor_schema_map: {
				current: {
					year : true,
					month: true,
					week : true,
					day  : true,
					plan : true,
					todo : true,
					dday : true
				},
				date   : true
			},
			today            : {
				year : new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				date : new Date().getDate(),
				week : zp.calendar.getWeekNum(new Date().getDate(), new Date().getMonth() + 1),
				day  : new Date().getDay()
			},
			day              : ['일', '월', '화', '수', '목', '금', '토']
		},
		stateMap = {
			$container: null,
			anchor_map: {},
			current   : 'day',
			act       : 'reload',
			date_info : {
				year : configMap.today.year,
				month: configMap.today.month,
				date : configMap.today.date,
				week : configMap.today.week,
				day  : configMap.today.day
			},
			state     : 'static',
			fidx      : 0
		},
		jqueryMap = {},
	// menu function
		onReportMenu, onOptionMenu, onProfileMenu, onLogoutMenu, onUploadMenu, onDownloadMenu,
	// modal function
		onSearchDate, onLoginSuccess, onClickCell, onSubmit, toggleUserMenu, introApp,
	// title function
		setTitle, onClickTitleYear, onClickTitleMonth, onClickTitleWeek,
	// anchor function
		changeAnchorPart, copyAnchorMap, setCurAnchor, onHashchange,
	// content function
		initModule, setJqueryMap, initMain, initDay, initWeek, initMonth, initYear, toggleMain,
	// swipe function
		onSwipe, initPosition, setPosition, getDirection, onTouchend, onTouchmove, onTouchstart;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$header   : $container.find('header'),
			$user     : $container.find('.user'),
			$avatar   : $container.find('.avatar'),
			$info     : $container.find('.info'),
			$name     : $container.find('.name'),
			$menu     : $container.find('.menu'),
			$logout   : $container.find('#menu-logout'),
			$profile  : $container.find('#menu-profile'),
			$upload   : $container.find('#menu-upload'),
			$download : $container.find('#menu-download'),
			$option   : $container.find('#menu-option'),
			$report   : $container.find('#menu-report'),
			$main     : $container.find('main'),
			$flickView: $container.find('.flick-view'),
			$flickCon : $container.find('.flick-con'),
			$flick    : $container.find('.flick-panel'),
			$toggle   : $container.find('.tool-toggle'),
			$search   : $container.find('.tool-search'),
			$modal    : $container.find('.modal'),
			$intro    : $container.find('.intro')
		};
	};
	initDay = function (e, data) {
		var dateStr;
		e.preventDefault();
		if (stateMap.state === 'static') {
			dateStr = String(data.year) + ('0' + data.month).slice(-2) + ('0' + data.date).slice(-2);
			setCurAnchor('day', dateStr);
			initPosition();
		} else {
			stateMap.state = 'static';
		}
	};
	initWeek = function (e, data) {
		var dateStr;
		e.preventDefault();
		if (stateMap.state === 'static') {
			dateStr = data.year + ('0' + data.week).slice(-2);
			setCurAnchor('week', dateStr);
			initPosition();
		} else {
			stateMap.state = 'static';
		}
	};
	initMonth = function (e, data) {
		var dateStr;
		e.preventDefault();
		if (stateMap.state === 'static') {
			dateStr = data.year + ('0' + data.month).slice(-2);
			setCurAnchor('month', dateStr);
			initPosition();
		} else {
			stateMap.state = 'static';
		}
	};
	initYear = function (e, data) {
		var dateStr;
		e.preventDefault();
		if (stateMap.state === 'static') {
			dateStr = String(data.year);
			setCurAnchor('year', dateStr);
			initPosition();
		} else {
			stateMap.state = 'static';
		}
	};
	initMain = function (mod, data) {
		var tempData = {};
		console.log('현재 mod: ' + mod);
		data.week = data.week || zp.calendar.getWeekNum(data.date, data.month, data.year);
		zp[mod].initModule(jqueryMap.$flick.eq(0), data);
		if (mod === 'day') {
			tempData = zp.calendar.getNextDate(data);
			zp.day.initModule(jqueryMap.$flick.eq(1), tempData);
			tempData = zp.calendar.getPrevDate(data);
			zp.day.initModule(jqueryMap.$flick.eq(2), tempData);
		} else if (mod === 'week') {
			tempData.week = data.week + 1;
			tempData.year = data.year;
			if (tempData.week === 54) {
				tempData.week = 1;
				tempData.year += 1;
			}
			zp.week.initModule(jqueryMap.$flick.eq(1), tempData);
			tempData.week = data.week - 1;
			if (tempData.week === 0) {
				tempData.week = 53;
				tempData.year -= 1;
			}
			zp.week.initModule(jqueryMap.$flick.eq(2), tempData);
		} else if (mod === 'month') {
			tempData = {
				year : data.year,
				month: data.month + 1
			};
			if (tempData.month === 13) {
				tempData.month = 1;
				tempData.year += 1;
			}
			zp.month.initModule(jqueryMap.$flick.eq(1), tempData);
			tempData = {
				year : data.year,
				month: data.month - 1
			};
			if (tempData.month === 0) {
				tempData.month = 12;
				tempData.year -= 1;
			}
			zp.month.initModule(jqueryMap.$flick.eq(2), tempData);
		} else if (mod === 'year') {
			tempData = {
				year: data.year + 1
			};
			zp.year.initModule(jqueryMap.$flick.eq(1), tempData);
			tempData = {
				year: data.year - 1
			};
			zp.year.initModule(jqueryMap.$flick.eq(2), tempData);
		}
		stateMap.current = mod;
		initPosition();
		setTitle(data);
	};
	setTitle = function (data) {
		var title_str = '',
			style_str = '',
			cur = stateMap.current;
		switch (cur) {
			case 'day':
				if (data.day === 0) {
					style_str = 'style="color:yellow;"';
				} else if (data.day === 6) {
					style_str = 'style="color:blue;"';
				}
				title_str = '<span class="title-year">' + data.year
					+ '</span>.<span class="title-month">' + data.month
					+ '</span>.<span class="title-date">' + data.date
					+ '</span> <span class="title-day" ' + style_str + '>'
					+ configMap.day[data.day] + '</span> <span class="title-week">'
					+ data.week + '주차</span>';
				break;
			case 'week':
				data.week = data.week || zp.calendar.getWeekNum(data.date, data.month, data.year);
				title_str = '<span class="title-year">' + data.year
					+ '</span>년 <span class="title">' + data.week + '주차</span>';
				break;
			case 'month':
				title_str = '<span class="title-year">' + data.year
					+ '년</span> <span class="title">' + data.month + '월</span>';
				break;
			case 'year':
				title_str = '<span class="title">' + data.year + '년</span>';
				break;
			case 'todo':
				title_str = '<span class="title">할일</span>';
				break;
			case 'plan':
				title_str = '<span class="title">일정</span>';
				break;
			case 'dday':
				title_str = '<span class="title">D-day / 기념일</span>';
				break;
		}
		jqueryMap.$info.html(title_str);
		if (data) {
			if (data.hasOwnProperty('date')) {
				stateMap.date_info.date = data.date;
			}
			if (data.hasOwnProperty('month')) {
				stateMap.date_info.month = data.month;
			}
			if (data.hasOwnProperty('year')) {
				stateMap.date_info.year = data.year;
			}
			if (data.hasOwnProperty('week')) {
				stateMap.date_info.week = data.week;
			}
		}
		return $.extend({}, data);
	};
	introApp = function () {
		alert('처음이시군요!');
		jqueryMap.$intro.show();
		if (!confirm('다음 실행 때도 보시겠습니까?')) {
			localStorage.first = 'false';
		}
	};
	onLogoutMenu = function (e) {
		e.stopPropagation();
		if (JSON.parse(localStorage.online) === false) {
			zp.modal.initModule(jqueryMap.$modal, 'login').show();
			return false;
		}
		if (!confirm('로그아웃하시겠습니까?')) {
			return false;
		}
		jqueryMap.$name.html('로그인');
		jqueryMap.$avatar.html('');
		localStorage.removeItem('user');
		zp.model.logout();
		localStorage.online = JSON.stringify(false);
		alert('로그아웃되었습니다!');
		jqueryMap.$menu.hide();
		zp.modal.initModule(jqueryMap.$modal, 'login').show();
		jqueryMap.$modal.find('#login-id').focus();
	};
	onUploadMenu = function () {
		var result;
		if (confirm('업로드하시겠습니까?')) {
			result = zp.model.upload();
		}
		result.done(function (data) {
			console.log(data);
		});
	};
	onDownloadMenu = function () {
		var result;
		if (confirm('다운로드하시겠습니까?')) {
			result = zp.model.download();
		}
		result.done(function (data) {
			console.log(data);
		});
	};
	onOptionMenu = function () {
		zp.modal.initModule(jqueryMap.$modal, 'option').show();
	};
	onProfileMenu = function () {
		zp.modal.initModule(jqueryMap.$modal, 'profile').show();
	};
	onReportMenu = function () {
		zp.modal.initModule(jqueryMap.$modal, 'report').show();
	};
	onClickTitleYear = function () {
		initPosition();
		setCurAnchor('year', stateMap.date_info.year);
		stateMap.current = 'year';
		setTitle(stateMap.date_info);
	};
	onClickTitleMonth = function () {
		initPosition();
		setCurAnchor('month', stateMap.date_info.year + ('0' + stateMap.date_info.month).slice(-2));
		stateMap.current = 'month';
		setTitle(stateMap.date_info);
	};
	onClickTitleWeek = function () {
		initPosition();
		setCurAnchor('week', stateMap.date_info.year + ('0' + stateMap.date_info.week).slice(-2));
		stateMap.current = 'week';
		setTitle(stateMap.date_info);
	};
	onSwipe = function (direction, cur_data) {
		var cur = stateMap.current,
			temp_data,
			page;
		stateMap.act = 'swipe';
		cur_data.year = parseInt(cur_data.year, 10);
		cur_data.month = parseInt(cur_data.month, 10);
		cur_data.week = parseInt(cur_data.week, 10);
		if (direction === 'left') { // show next
			console.log('swiped to the left!');
			page = (stateMap.fidx + 1) % 3;
			switch (cur) {
				case 'day':
					cur_data = setTitle(zp.calendar.getNextDate(cur_data));
					// 다음 모듈을 미리 로드(2일 후)
					temp_data = zp.calendar.getNextDate(cur_data);
					zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
					// 주소는 1일 후로
					setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2) + ('0' + cur_data.date).slice(-2));
					break;
				case 'week':
					cur_data.week += 1;
					if (cur_data.week === 54) {
						cur_data.week = 1;
						cur_data.year += 1;
					}
					// 다음 모듈을 미리 로드(2주 후)
					temp_data = setTitle(cur_data);
					temp_data.week += 1;
					if (temp_data.week === 54) {
						temp_data.week = 1;
						temp_data.year += 1;
					}
					zp.week.initModule(jqueryMap.$flick.eq(page), temp_data);
					// 주소는 1달 후로
					setCurAnchor('week', cur_data.year + ('0' + cur_data.week).slice(-2));
					break;
				case 'month':
					cur_data.month += 1;
					if (cur_data.month === 13) {
						cur_data.month = 1;
						cur_data.year += 1;
					}
					// 다음 모듈을 미리 로드(2달 후)
					temp_data = setTitle(cur_data);
					temp_data.month += 1;
					if (temp_data.month === 13) {
						temp_data.month = 1;
						temp_data.year += 1;
					}
					zp.month.initModule(jqueryMap.$flick.eq(page), temp_data);
					// 주소는 1달 후로
					setCurAnchor('month', cur_data.year + ('0' + cur_data.month).slice(-2));
					break;
				case 'year':
					cur_data.year += 1;
					// 다음 모듈을 미리 로드 (2년 후)
					cur_data = setTitle(cur_data);
					temp_data = $.extend({}, cur_data);
					temp_data.year += 1;
					zp.year.initModule(jqueryMap.$flick.eq(page), temp_data);
					setCurAnchor('year', cur_data.year);
					break;
				case 'todo':
					stateMap.current = 'plan';
					setTitle();
					break;
				case 'plan':
					stateMap.current = 'dday';
					setTitle();
					break;
				case 'dday':
					stateMap.current = 'todo';
					setTitle();
					break;
			}
		} else { // right prev
			console.log('swiped to the right!');
			page = (stateMap.fidx - 1) % 3;
			switch (cur) {
				case 'day':
					cur_data = setTitle(zp.calendar.getPrevDate(cur_data));
					temp_data = zp.calendar.getPrevDate(cur_data);
					zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
					setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2) + ('0' + cur_data.date).slice(-2));
					break;
				case 'week':
					cur_data.week -= 1;
					if (cur_data.week === 0) {
						cur_data.week = 53;
						cur_data.year -= 1;
					}
					// 다음 모듈을 미리 로드(2주 후)
					temp_data = setTitle(cur_data);
					temp_data.week -= 1;
					if (temp_data.week === 0) {
						temp_data.week = 53;
						temp_data.year -= 1;
					}
					zp.week.initModule(jqueryMap.$flick.eq(page), temp_data);
					// 주소는 1달 후로
					setCurAnchor('week', cur_data.year + ('0' + cur_data.week).slice(-2));
					break;
				case 'month':
					cur_data.month -= 1;
					if (cur_data.month === 0) {
						cur_data.month = 12;
						cur_data.year -= 1;
					}
					temp_data = setTitle(cur_data);
					temp_data.month -= 1;
					if (temp_data.month === 0) {
						temp_data.month = 12;
						temp_data.year -= 1;
					}
					zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
					setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2));
					break;
				case 'year':
					cur_data.year -= 1;
					temp_data = setTitle(cur_data);
					temp_data.year -= 1;
					zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
					setCurAnchor(cur, cur_data.year);
					break;
				case 'todo':
					stateMap.current = 'dday';
					setTitle();
					break;
				case 'plan':
					stateMap.current = 'todo';
					setTitle();
					break;
				case 'dday':
					stateMap.current = 'plan';
					setTitle();
					break;
			}
		}
		jqueryMap.$flick.eq(page).css('top', 0);
		stateMap.date_info = cur_data;
		return cur_data;
	};
	toggleUserMenu = function () {
		if (localStorage.online !== 'true') {
			zp.modal.initModule(jqueryMap.$modal, 'login').show();
			return false;
		}
		jqueryMap.$menu.toggle();
		return false;
	};
	onLoginSuccess = function (e, user_map) {
		if (e) {
			e.preventDefault();
		}
		localStorage.online = 'true';
		jqueryMap.$name.html(user_map.nick || user_map.name);
		jqueryMap.$avatar.html(user_map.avatar || '');
		localStorage.user = JSON.stringify(user_map);
		zp.model.configModule(user_map.name);
		console.log('online mode');
		if (!localStorage.first && JSON.parse(localStorage.first)) {
			introApp();
		}
	};
	onSearchDate = function () {
		zp.modal.configModule({set_cur_anchor: setCurAnchor});
		zp.modal.initModule(jqueryMap.$modal, 'search').show();
		initPosition();
	};
	onSubmit = function (e, data) {
		e.preventDefault();
		console.log('onSubmit', data);
		setCurAnchor(data);
	};
	onClickCell = function (e, data) {
		e.preventDefault();
		zp.modal.initModule(jqueryMap.$modal, 'type', data).show();
	};
	toggleMain = function () {
		var cur = copyAnchorMap().current;
		stateMap.act = 'reload';
		if (cur === 'todo' || cur === 'plan' || cur === 'dday') {
			setCurAnchor('day');
			jqueryMap.$toggle.html('<i class="fa fa-list"></i>');
		} else {
			setCurAnchor('todo');
			jqueryMap.$toggle.html('<i class="fa fa-calendar"></i>');
		}
	};
	copyAnchorMap = function () {
		return $.extend(true, {}, stateMap.anchor_map);
	};
	changeAnchorPart = function (arg_map) {
		var anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep;
		for (key_name in arg_map) {
			if (arg_map.hasOwnProperty(key_name)) {
				if (key_name.indexOf('_') === 0) {
					continue;
				}
				anchor_map_revise[key_name] = arg_map[key_name];
				if (arg_map[key_name] === undefined) {
					delete arg_map[key_name];
					delete anchor_map_revise[key_name];
				}
				key_name_dep = '_' + key_name;
				if (arg_map[key_name_dep]) {
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				} else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}
		try {
			$.uriAnchor.setAnchor(anchor_map_revise);
		} catch (error) {
			$.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
			bool_return = false;
		}
		return bool_return;
	};
	setCurAnchor = function (status, date) {
		var arg_map = {
			current: status,
			date   : date
		};
		return changeAnchorPart(arg_map);
	};
	onHashchange = function () {
		var
			anchorMapPrevious = copyAnchorMap(),
			anchorMapProposed, _s_cur_previous, _s_cur_proposed, s_cur_proposed,
			_s_date_previous, _s_date_proposed,
			data = {};
		console.log(
			new Date().getHours(), new Date().getMinutes(),
			new Date().getSeconds(), '해시가 변경이 시도되었습니다.'
		);
		try {
			anchorMapProposed = $.uriAnchor.makeAnchorMap();
		} catch (error) {
			console.warn('anchor_map_error', error);
			$.uriAnchor.setAnchor(anchorMapPrevious, null, true);
			return false;
		}
		if (anchorMapProposed.current === undefined) {
			anchorMapProposed.current = 'day';
		}
		stateMap.anchor_map = anchorMapProposed;
		_s_date_previous = anchorMapPrevious._s_date;
		_s_date_proposed = anchorMapProposed._s_date;
		_s_cur_previous = anchorMapPrevious._s_current;
		_s_cur_proposed = anchorMapProposed._s_current;
		if (!Object.keys(anchorMapPrevious).length ||
			_s_cur_previous !== _s_cur_proposed ||
			_s_date_previous !== _s_date_proposed) {
			s_cur_proposed = anchorMapProposed.current;
			switch (s_cur_proposed) {
				case 'year':
					if (stateMap.act === 'reload') {
						if (_s_date_proposed) {
							data.year = stateMap.date_info.year =
								parseInt(_s_date_proposed.substr(0, 4), 10);
						}
						initMain('year', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'month':
					if (stateMap.act === 'reload') {
						if (_s_date_proposed) {
							data.year = stateMap.date_info.year =
								parseInt(_s_date_proposed.substr(0, 4), 10);
							data.month = stateMap.date_info.month =
								parseInt(_s_date_proposed.substr(4, 2), 10);
						}
						initMain('month', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'week':
					if (stateMap.act === 'reload') {
						if (_s_date_proposed) {
							data.year = stateMap.date_info.year =
								parseInt(_s_date_proposed.substr(0, 4), 10);
							data.week = stateMap.date_info.week =
								parseInt(_s_date_proposed.substr(4, 2), 10);
						}
						initMain('week', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'day':
					if (stateMap.act === 'reload') {
						if (_s_date_proposed) {
							data.year = stateMap.date_info.year =
								parseInt(_s_date_proposed.substr(0, 4), 10);
							data.month = stateMap.date_info.month =
								parseInt(_s_date_proposed.substr(4, 2), 10);
							data.date = stateMap.date_info.date =
								parseInt(_s_date_proposed.substr(6, 2), 10);
						} else {
							data.year = stateMap.date_info.year;
							data.month = stateMap.date_info.month;
							data.date = stateMap.date_info.date;
						}
						data.day = new Date(data.year, data.month - 1, data.date).getDay();
						data.week = zp.calendar.getWeekNum(data.date, data.month, data.year);
						initMain('day', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'plan':
					initPosition();
					zp.plan.initModule(jqueryMap.$flick.eq(0));
					zp.dday.initModule(jqueryMap.$flick.eq(1));
					zp.todo.initModule(jqueryMap.$flick.eq(2));
					stateMap.current = 'plan';
					setTitle();
					break;
				case 'todo':
					initPosition();
					zp.todo.initModule(jqueryMap.$flick.eq(0));
					zp.plan.initModule(jqueryMap.$flick.eq(1));
					zp.dday.initModule(jqueryMap.$flick.eq(2));
					stateMap.current = 'todo';
					setTitle();
					break;
				case 'dday':
					initPosition();
					zp.dday.initModule(jqueryMap.$flick.eq(0));
					zp.todo.initModule(jqueryMap.$flick.eq(1));
					zp.plan.initModule(jqueryMap.$flick.eq(2));
					stateMap.current = 'dday';
					setTitle();
					break;
				default:
					delete anchorMapProposed.current;
					delete anchorMapProposed.date;
					$.uriAnchor.setAnchor(anchorMapProposed, null, true);
			}
		}
	};
	initPosition = function () {
		jqueryMap.$main.css('height', $(window).height() - jqueryMap.$header.height());
		jqueryMap.$flick.css('min-height', $(window).height() - jqueryMap.$header.height());
		jqueryMap.$flick.eq(0).css('left', '0%');
		jqueryMap.$flick.eq(1).css('left', '100%');
		jqueryMap.$flick.eq(2).css('left', '-100%');
		stateMap.fidx = 0;
	};
	setPosition = function () {
		var cidx, ridx, lidx;
		stateMap.fidx %= 3;
		cidx = stateMap.fidx;
		ridx = cidx + 1;
		lidx = cidx - 1;
		if (cidx === 0) {
			lidx = 2;
		}
		if (cidx === 2) {
			ridx = 0;
		}
		console.log(lidx, cidx, ridx);
		jqueryMap.$flick.eq(lidx).css({left: '-100%'});
		jqueryMap.$flick.eq(cidx).css({left: '0%'});
		jqueryMap.$flick.eq(ridx).css({left: '100%'});
	};
	getDirection = function (x, y) {
		var slope = Math.abs(parseFloat((y / x).toFixed(2))), dir,
			slope_h = ((window.innerHeight / 2) / window.innerWidth).toFixed(2),
			slope_x = (window.innerHeight / (window.innerWidth / 2)).toFixed(2);
		if (slope >= slope_h) {
			dir = 2;
		} else if (slope <= slope_x) {
			dir = 0;
		} else {
			dir = 1;
		}
		return dir;
	};
	onTouchstart = function (e) {
		jqueryMap.$flickCon.css({webkitTransition: 'null'});
		stateMap.touch_start_x = stateMap.touch_x = e.originalEvent.touches[0].clientX;
		stateMap.touch_start_y = stateMap.touch_y = e.originalEvent.touches[0].clientY;
		return true;
	};
	onTouchmove = function (e) {
		stateMap.touch_x = e.originalEvent.touches[0].clientX;
		stateMap.touch_y = e.originalEvent.touches[0].clientY;
		stateMap.gap_x = stateMap.touch_x - stateMap.touch_start_x;
		stateMap.gap_y = stateMap.touch_y - stateMap.touch_start_y;
		stateMap.direction = stateMap.direction || getDirection(stateMap.gap_x, stateMap.gap_y);
		if (stateMap.direction === 0) {
			e.preventDefault();
			jqueryMap.$flickCon.css({transform: 'translate3d(' + stateMap.gap_x + 'px,0,0)'});
		}
		stateMap.state = 'drag';
	};
	onTouchend = function () {
		if (Math.abs(stateMap.gap_x) > $(window).width() / 2.5) {
			if (stateMap.gap_x < 0) {
				jqueryMap.$flickCon.css({
					transform: 'translate3d(-100%,0,0)', webkitTransition: '300ms'
				});
				stateMap.fidx++;
				onSwipe('left', stateMap.date_info);
			} else {
				jqueryMap.$flickCon.css({
					transform: 'translate3d(100%,0,0)', webkitTransition: '300ms'
				});
				stateMap.fidx--;
				onSwipe('right', stateMap.date_info);
			}
			setPosition();
			jqueryMap.$flickCon.delay(0).queue(function (next) {
				$(this).css({
					transform       : 'translate3d(0,0,0)',
					webkitTransition: 'null'
				});
				next();
			});
		} else {
			jqueryMap.$flickCon.css({
				transform       : 'translate3d(0,0,0)',
				webkitTransition: '200ms'
			});
		}
		stateMap.direction = undefined;
		stateMap.gap_x = 0;
		return true;
	};
	initModule = function ($container) {
		var
			online = localStorage.online ? JSON.parse(localStorage.online) :
				false;
		$.uriAnchor.configModule({
			schema_map: configMap.anchor_schema_map
		});
		localStorage.first = localStorage.first ? JSON.parse(localStorage.first) :
			JSON.stringify(false);
		stateMap.$container = $container;
		setJqueryMap($container);
		if (online) {
			onLoginSuccess(window.event, JSON.parse(localStorage.user));
		} else {
			localStorage.user = 'anon';
		}
		initPosition();
		$(window)
			.on('error', function (errorMsg, url, lineNumber, column, errorObj) {
				if (errorMsg && errorMsg.indexOf('Script error.') > -1) {
					return;
				}
				alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
					+ ' Column: ' + column + ' StackTrace: ' + errorObj);
			})
			.on('hashchange', onHashchange).trigger('hashchange')
			.on('orientationchange resize', function () {
				var windowHeight = $(window).height(),
					headerHeight = jqueryMap.$header.height();
				jqueryMap.$main.css('height', windowHeight - headerHeight);
				jqueryMap.$flick.css('min-height', windowHeight - headerHeight);
			});
		$.gevent.subscribe(jqueryMap.$user, 'login', onLoginSuccess);
		$.gevent.subscribe(jqueryMap.$container, 'submit', onSubmit);
		$.gevent.subscribe(jqueryMap.$main, 'day', initDay);
		$.gevent.subscribe(jqueryMap.$main, 'week', initWeek);
		$.gevent.subscribe(jqueryMap.$main, 'month', initMonth);
		$.gevent.subscribe(jqueryMap.$main, 'year', initYear);
		$.gevent.subscribe(jqueryMap.$modal, 'cell', onClickCell);
		// 이벤트 핸들러
		jqueryMap.$user.on('click', toggleUserMenu);
		jqueryMap.$logout.on('click', onLogoutMenu);
		jqueryMap.$upload.on('click', onUploadMenu);
		jqueryMap.$download.on('click', onDownloadMenu);
		jqueryMap.$option.on('click', onOptionMenu);
		jqueryMap.$profile.on('click', onProfileMenu);
		jqueryMap.$report.on('click', onReportMenu);
		jqueryMap.$toggle.on('click', toggleMain);
		jqueryMap.$search.on('click', onSearchDate);
		jqueryMap.$info.on('click', '.title-year', onClickTitleYear);
		jqueryMap.$info.on('click', '.title-month', onClickTitleMonth);
		jqueryMap.$info.on('click', '.title-week', onClickTitleWeek);
		// drag
		jqueryMap.$flickView
			.on('touchstart', onTouchstart)
			.on('touchmove', onTouchmove)
			.on('touchend', onTouchend);
	};
	return {
		initModule: initModule
	};
}());
zp.day = (function () {
	'use strict';	
	var configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			today: {
				year: new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				date: new Date().getDate()
			},
			set_cur_anchor: null,
			tr_h: 40
		},
		stateMap = {
			day_list: [],
			update: false
		},
		jqueryMap = {},
		setJqueryMap, configModule, initModule, insertSchedule, onClickPlan, 
		Day, addTimeIndicator, onClickCell;

	setJqueryMap = function ($container, date_str) {
		jqueryMap.$container = $container;
		jqueryMap[date_str] = {
			$container: $container,
			$ddayTable: $container.find('.dday-table'),
			$planTable: $container.find('.plan-table')
		};
	};

	Day = function ($container, data) {
		var
			day = {
				date: parseInt(data.date, 10),
				month: parseInt(data.month, 10),
				year: parseInt(data.year, 10)
			},
			month = data.month,
			date = data.date,
			year = data.year,
			dateStr;
		month = ('0' + day.month).slice(-2);
		date = ('0' + day.date).slice(-2);
		dateStr = year + month + date;
		console.log(dateStr, '모듈을 로딩합니다.');
		$container.load('/html/zp.day.html', function () {
			setJqueryMap($container, dateStr);
			insertSchedule(data, dateStr);
			if (day.date === configMap.today.date &&
					day.month === configMap.today.month &&
					day.year === configMap.today.year) {
				addTimeIndicator(dateStr);
				setInterval(addTimeIndicator(dateStr), 60000);
			}
			jqueryMap[dateStr].$ddayTable.attr('data-date', dateStr);
			jqueryMap[dateStr].$planTable.on('click', '.todo, .plan, .dday', onClickPlan);
 			jqueryMap[dateStr].$planTable.on('click', 'td', data, onClickCell);
		});
	};

	onClickCell = function (e) {
		var
			time = $(this).data('time'),
			data = {
				year: e.data.year,
				month: e.data.month,
				date: e.data.date,
				time: time
			};
		$.gevent.publish('cell', [data]);
	};
	
	onClickPlan = function () {
		var c = $(this).attr('class');
		if (c === 'whole') {c = 'plan';}
		$.gevent.publish('submit', [c]);
	};

	addTimeIndicator = function (str) {
		var hour = new Date().getHours(),
			minute = new Date().getMinutes(),
			$line, top, ddayOffset,
			$indicator = $('.time-indicator');
		ddayOffset = jqueryMap[str].$ddayTable.find('tr').length;
		top = (hour * configMap.tr_h) + (minute * configMap.tr_h / 60) + (ddayOffset * 40);
		if ($indicator.length) {
			$indicator.remove();
		}
		$line = $('<div/>').addClass('time-indicator').css({top: top});
		jqueryMap[str].$container.prepend($line);
	};

	insertSchedule = function (data, str) {
		var
			date, month, stime, etime, ctime, startTime, endTime, time,
			todoMap, planMap, ddayMap,
			i, todoResult, planResult, ddayResult,
			dateStr, $div, $tr, top, hour, min,
			$frag = $(document.createDocumentFragment());
		month = ('0' + data.month).slice(-2);
		date = ('0' + data.date).slice(-2);
		dateStr = data.year + '-' + month + '-' + date;
		time = new Date(dateStr);
		startTime = time.getTime();
		time.setDate(time.getDate() + 1);
		endTime = time.getTime();
		todoResult = zp.model.getTodo(startTime + '00000', endTime + '00000');
		planResult = zp.model.getPlan(startTime + '00000', endTime + '00000');
		ddayResult = zp.model.getDday(startTime + '00000', endTime + '00000');
		ddayResult.done(function (ddayList) {
			for (i = 0; i < ddayList.length; i++) {
				ddayMap = ddayList[i];
				if (ddayMap && ddayMap.target === dateStr) {
					$tr = $('<tr/>').attr('data-id', ddayMap._id).append('<td/>');
					$tr.find('td').addClass('dday').text(ddayMap.text);
					$tr.prependTo($frag);
				}
			}
			$frag.appendTo(jqueryMap[str].$ddayTable);
		});
		ddayResult.fail(function (err) {
			console.log(err);
		});
		todoResult.done(function (todoList) {
			for (i = 0; i < todoList.length; i++) {
				todoMap = todoList[i];
				if (todoMap && todoMap.date === dateStr) {
					hour = todoMap.time.substr(0, 2);
					min = todoMap.time.substr(3, 2);
					top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
					$div = $('<div/>').addClass('todo').attr('data-id', todoMap._id);
					$div.css({top: top}).append($('<div/>'))
						.find('div').addClass('input').text(todoMap.text);
					$div.appendTo($frag);
				}
			}
			$frag.appendTo(jqueryMap[str].$planTable);
		});
		todoResult.fail(function (err) {
			console.log(err);
		});
		planResult.done(function (planList) {
			for (i = 0; i < planList.length; i++) {
				planMap = planList[i];
				if (planMap) {
					stime = new Date(planMap.startdate).getTime();
					etime = new Date(planMap.enddate).getTime();
					ctime = new Date(dateStr).getTime();
					if (planMap.startdate === dateStr) {
						hour = planMap.starttime.substr(0, 2);
						min = planMap.starttime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-id', planMap._id);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(planMap.text + ' 시작');
						$div.appendTo(jqueryMap[str].$planTable);
					} else if (stime < ctime && ctime < etime) {
						$tr = $('<tr/>').attr('data-idx', i).append('<td/>');
						$tr.find('td').addClass('whole').text(planMap.text);
						$tr.prependTo(jqueryMap[str].$ddayTable);
					} else if (planMap.enddate === dateStr) {
					 	hour = planMap.endtime.substr(0, 2);
						min = planMap.endtime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-idx', i);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(planMap.text + '끝');
						$div.appendTo($frag);
					}
				} 
			}
			$frag.appendTo(jqueryMap[str].$planTable);
		});
		planResult.fail(function (err) {
			console.log(err);
		});
		return true;
	};
		
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};
	
	initModule = function ($container, data) {
		var date_str = data.year + ('0' + data.month).slice(-2) + ('0' + data.date).slice(-2);
		stateMap.day_list[date_str] = new Day($container, data);
		return stateMap.day_list;
	};
	
	return {
		configModule: configModule,
		initModule: initModule
	};
}());
zp.dday = (function () {
	'use strict';
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			$container: null,
			taphold: null
		},
		jqueryMap = {},
		setJqueryMap, showDday, configModule, initModule, onDelete, calculate,
		updateTime, updateText, holdTap, holdStop, applyTime, applyText;

	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$main: $container.find('.dday-main')
		};
	};

	calculate = function (target) {
		var
			today = new Date(),
			obj = zp.calendar.objectify(String(target)),
			dest = new Date(obj.year, obj.month - 1, obj.date),
			gap = dest.getTime() - today.getTime(),
			result
		;
		gap = Math.ceil(gap / 1000 / 60 / 60 / 24);
		if (gap > 0) {
			result = 'D-' + gap;
		} else if (gap === 0) {
			result = 'D-day';
		} else {
			result = 'D+' + Math.abs(gap);
		}
		return result;
	};

	showDday = function () {
		var
			$text, $div, $del, ddayMap, $target, $left, target, i,
			$frag = $(document.createDocumentFragment()),
			result = zp.model.getDday();
		result.done(function (dday_list) {
			if (dday_list.length) {
				jqueryMap.$main.html('');
				for (i = 0; i < dday_list.length; i++) {
					ddayMap = dday_list[i];
					if (ddayMap) {
						target = ddayMap.target;
						$div = $('<div/>').addClass('dday-item').attr('data-id', ddayMap._id);
						$text = $('<div/>').addClass('dday-text').text(ddayMap.text);
						$target = $('<div/>').addClass('dday-target').text(target);
						$left = $('<div/>').addClass('dday-left').text(calculate(target));
						$del = $('<div/>').addClass('dday-del').html('<i class="fa fa-trash-o"></i>');
						$div.append($left).append($text).append($target).append($del);
						$frag.append($div);
					}
				}
				jqueryMap.$main.append($frag);
			}
		});
		result.fail(function (err) {
			alert(err);
		});
		jqueryMap.$main.html('<div class="no-content">기념일이나 D-day를 작성해주세요</div>');
		return true;
	};

	onDelete = function () {
		var
			$item = $(this).closest('.dday-item'),
			id = $item.data('id'), result;
		if (!confirm('삭제하시겠습니까?')) {
			return false;
		}
		result = zp.model.deleteItem(id);
		result.done(function () {
			$item.remove();
		});
		result.fail(function () {
			alert('오류 발생');
		});
		return true;
	};

	holdTap = function (e) { console.log('holdtap');
		e.stopImmediatePropagation();
		stateMap.taphold = setTimeout(function () {
			if (e.target.className === 'dday-text') {
				updateText(e.target);	
			} else if (e.target.className === 'dday-target') {
				updateTime(e.target);	
			}
		}, 1000);
		return false;
	};
	
	holdStop = function (e) { console.log('holdstop');
		e.stopPropagation();
		clearTimeout(stateMap.taphold);
		return false;
	};
	
	updateTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyTime);
	};
	
	updateText = function (target) {
		var text = $(target).text();
		$(target).empty().append('<input type="text" value="' + text + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: text
		}, applyText);
	};

	applyTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			id, date;
		if (data.origin === update) {
			$target.empty().text(data.origin); 			
			return;	
		}
		$target.empty().text(update);
		id = $target.parent('.dday-item').data('id');
		date = update.substr(0, 10);
	};
	
	applyText = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, dday_list, cidx;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		dday_list = JSON.parse(localStorage.dday);
		cidx = $target.parent('.dday-item').data('id');
		alert(cidx);
		dday_list[cidx].text = update;
		change_obj.u.push({
			cidx: cidx,
			type: 'dday'
		});
		localStorage.dday = JSON.stringify(dday_list);
		localStorage.change = JSON.stringify(change_obj); 		
	};


	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};

	initModule = function ($container) {
		$container.load('/html/zp.dday.html', function () {
			stateMap.$container = $container;
			setJqueryMap($container);
			showDday();
			jqueryMap.$main.on('click', '.dday-del', onDelete);
			jqueryMap.$main.on('touchstart', '.dday-target, .dday-text', holdTap);
			jqueryMap.$main.on('touchend', '.dday-target, .dday-text', holdStop);
		});
		return $container;
	};

	return {
		configModule: configModule,
		initModule: initModule,
				calculate: calculate
	};
}());
zp.modal = (function () {
	'use strict';
	var
		configMap = {
			settable_map  : {
				set_cur_anchor: true
			},
			set_cur_anchor: null,
			today         : {
				year : new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				date : new Date().getDate()
			}
		},
		stateMap = {
			$container: null,
			year      : new Date().getFullYear(),
			month     : new Date().getMonth() + 1,
			date      : new Date().getDate(),
			hour      : new Date().getHours(),
			minute    : new Date().getMinutes()
		},
		jqueryMap = {},
		setJqueryMap, configModule, initModule, onClickClose, onClickBack,
		onTypeTodo, onTypePlan, onTypeDday, onSubmitTodo, onSubmitPlan, onSubmitDday,
		onRepeat, onSetStartdate, onSearch, onToggleRepeatType,
		onLogin, onClickJoin, onOffline, checkRegEmail, toToday, makeRandom,
		onJoin, onFindPassword, onFindId, onCheckAnswer, onCheckId, onNewPassword;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container : $container,
			$close     : $container.find('.modal-close'),
			$back      : $container.find('.modal-back'),
			$login     : $container.find('#login-sbmt'),
			$todo      : $container.find('#todo-sbmt'),
			$plan      : $container.find('#plan-sbmt'),
			$dday      : $container.find('#dday-sbmt'),
			$join      : $container.find('#join-btn'),
			$findpw    : $container.find('#findpw-btn'),
			$offline   : $container.find('#offline-btn'),
			$typeTodo  : $container.find('#type-todo'),
			$typePlan  : $container.find('#type-plan'),
			$typeDday  : $container.find('#type-dday'),
			$checkIdBtn: $container.find('#check-id-btn'),
			$joinSbmt  : $container.find('#join-sbmt'),
			$findIdForm: $container.find('#findpw-id-form'),
			$findIdBtn : $container.find('#findpw-id-sbmt'),
			$findPwForm: $container.find('#findpw-qst-form'),
			$findPwBtn : $container.find('#findpw-ans-sbmt'),
			$newPwForm : $container.find('#findpw-newpw-form'),
			$newPwBtn  : $container.find('#findpw-newpw-sbmt'),
			$repeat    : $container.find('#plan-input-repeat'),
			$repeatType: $container.find('input[name="repeat-type"]'),
			$search    : $container.find('#search-btn'),
			$today     : $container.find('#search-today')
		};
	};
	onLogin = function (e) {
		var
			$loginForm = $(this).parent(),
			$id = $loginForm.find('#login-id'),
			$pw = $loginForm.find('#login-pw'),
			id = $id.val(),
			pw = $pw.val(),
			data, result;
		e.preventDefault();
		if (id.trim() === '') {
			alert('아이디를 입력해주십시오.');
			$id.focus();
			return false;
		}
		if (pw === '') {
			alert('비밀번호를 입력해주십시오.');
			$pw.focus();
			return false;
		}
		data = {
			id: id,
			pw: pw
		};
		result = zp.model.login(data);
		result.done(function (data) {
			alert('로그인 성공!');
			jqueryMap.$container.hide();
			$.gevent.publish('login', [data]);
			if (confirm('서버의 데이터와 동기화하시겠습니까?')) {
				zp.model.sync(id);
			}
		});
		result.fail(function () {
			alert('아이디가 없거나 패스워드가 틀렸습니다.');
			$id.val('').focus();
			$pw.val('');
			return false;
		});
	};
	onTypeTodo = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'todo', e.data);
	};
	onTypePlan = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'plan', e.data);
	};
	onTypeDday = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'dday', e.data);
	};
	onOffline = function () {
		$.gevent.publish('zp-offline', []);
		jqueryMap.$container.hide();
	};
	onClickClose = function () {
		jqueryMap.$container.empty().hide();
	};
	onClickBack = function () {
		zp.modal.initModule(jqueryMap.$container, 'login');
	};
	onFindPassword = function () {
		zp.modal.initModule(jqueryMap.$container, 'findpw');
	};
	onFindId = function (e) {
		var
			data = {
				id: jqueryMap.$findIdForm.find('#findpw-id').val()
			},
			result;
		e.preventDefault();
		result = zp.model.findId(data.id);
		result.done(function (data) {
			jqueryMap.$findIdForm.find('#findpw-id').prop('readonly', true);
			jqueryMap.$findPwForm.show();
			jqueryMap.$findPwForm.find('#findpw-ans').focus();
			jqueryMap.$findPwForm.find('#findpw-qst').html(data.qst);
		});
		result.fail(function () {
			alert('아이디가 없습니다.');
		});
		return false;
	};
	onCheckAnswer = function (e) {
		var
			data = {
				id : jqueryMap.$findIdForm.find('#findpw-id').val(),
				ans: jqueryMap.$findPwForm.find('#findpw-ans').val()
			},
			result;
		e.preventDefault();
		if (!data.ans) {
			alert('답변을 입력해주세요');
			jqueryMap.$findPwForm.find('#findpw-ans').focus();
		}
		result = zp.model.checkAnswer(data);
		result.done(function () {
			jqueryMap.$newPwForm.show();
			jqueryMap.$newPwForm.find('#findpw-newpw').focus();
		});
		result.fail(function (err) {
			if (err === 'wrong answer') {
				alert('답변이 틀렸습니다.');
				jqueryMap.$findPwForm.find('#findpw-ans').val('').focus();
			}
		});
	};
	onNewPassword = function (e) {
		e.preventDefault();
		var
			$newpw = jqueryMap.$newPwForm.find('#findpw-newpw'),
			$newpwchk = jqueryMap.$newPwForm.find('#findpw-newpwchk'),
			data, result;
		data = {
			id: jqueryMap.$findIdForm.find('#findpw-id').val(),
			pw: $newpw.val()
		};
		if (data.pw !== $newpwchk.val()) {
			alert('비밀번호와 비밀번호 확인이 일치하지 않습니다');
			$newpw.focus();
			return;
		}
		result = zp.model.changePw(data);
		result.done(function () {
			alert('변경되었습니다!');
			zp.modal.initModule(jqueryMap.$container, 'login');
		});
		result.fail(function (err) {
			console.log(err);
			if (err.name === 'not_found') {
				alert('권한 오류!');
			}
		});
	};
	onClickJoin = function () {
		zp.modal.initModule(jqueryMap.$container, 'join');
	};
	onCheckId = function (e) {
		var id = $(e.target).prev().val(),
			result;
		if (id === '') {
			alert('아이디를 입력해주세요.');
			return false;
		}
		result = zp.model.checkId(id);
		result.fail(function () {
			alert('이미 사용하고 있는 아이디입니다.');
			return false;
		});
		result.done(function (data) {
			console.log(data);
			if (data.name === 'not_found') {
				alert('사용하셔도 좋습니다!');
				$('#join-agree').removeAttr('disabled');
			} else {
				alert('오류가 발생했습니다. 다시 시도해주세요.');
			}
		});
	};
	checkRegEmail = function (e) {
		var regEmail = /^[\-A-Za-z0-9_]+[\-A-Za-z0-9_.]*@[\-A-Za-z0-9_]+[\-A-Za-z0-9_.]*\.[A-Za-z]{2,5}$/,
			email = e.hasOwnProperty('data') ? e.data.value : e;
		if (e.hasOwnProperty('data') && email === '') { // 블러로 접근하고 빈칸일 때
			return false;
		}
		if (typeof email !== 'string' || email === '') { //
			alert('이메일이 문자열이 아니거나 빈칸입니다.');
			return false;
		}
		if (email.search(regEmail) === -1) {
			alert('이메일 형식에 맞지 않습니다.');
			return false;
		}
		return true; // button 이벤트로 발생한 경우
	};
	onJoin = function (e) {
		var
			$id = $('#join-id'),
			$email = $('#join-email'),
			$nick = $('#join-name'),
			$pw = $('#join-pw'),
			$pwc = $('#join-pwc'),
			$qst = $('#join-qst'),
			$ans = $('#join-ans'),
			$agree = $('#join-agree'),
			data = {
				id    : $id.val(),
				email : $email.val(),
				pw    : $pw.val(),
				nick  : $nick.val(),
				qst   : $qst.val(),
				ans   : $ans.val(),
				avatar: 'z'
			},
			result;
		e.preventDefault();
		if (!data.id.trim()) {
			alert('아이디를 입력해주세요.');
			$id.focus();
			return false;
		}
		if (!data.email.trim()) {
			alert('이메일을 입력해주세요.');
			$email.focus();
			return false;
		}
		if (!data.nick.trim()) {
			alert('닉네임을 입력해주세요.');
			$nick.focus();
			return false;
		}
		if (!data.pw) {
			alert('비밀번호를 입력해주세요.');
			$pw.focus();
			return false;
		}
		if (!data.qst.trim()) {
			alert('질문을 입력해주세요.');
			$qst.focus();
			return false;
		}
		if (!data.ans) {
			alert('답변을 입력해주세요.');
			$ans.focus();
			return false;
		}
		if (data.pw !== $pwc.val()) {
			alert('비밀번호 확인이 일치하지 않습니다.');
			$pw.focus();
			return false;
		}
		if ($agree.prop('disabled')) {
			alert('중복확인을 해주세요.');
		}
		if (!$agree.is(':checked')) {
			alert('약관에 동의하셔야 합니다.');
			$agree.focus();
			return false;
		}
		result = zp.model.join(data);
		result.done(function (res) {
			console.log(res);
			alert('회원이 되신 것을 축하드립니다!');
		});
		result.fail(function (err) {
			console.log(err);
			alert('오류가 발생했습니다. 다시 시도해주세요.');
		});
	};
	onRepeat = function () {
		$(this).next().toggle();
	};
	onToggleRepeatType = function () {
		var $weekBox = $('.plan-repeat-everyweek'),
			$checkboxDay = $weekBox.find('input[name=repeat-day]');
		if ($(this).val() === 'everyday') {
			$checkboxDay.prop('checked', true);
			$weekBox.hide();
		} else if ($(this).val() === 'everyweek') {
			$checkboxDay.prop('checked', false);
			$weekBox.show();
		}
	};
	onSetStartdate = function () {
		var $enddate = $(this).parent().find('#plan-input-enddate');
		if ($enddate.val() === '') {
			$enddate.val($(this).val());
		}
	};
	onSearch = function (e) {
		var
			dateStr = $(this).prev('#search-date').val(),
			year, month, date;
		e.preventDefault();
		if (!dateStr) {
			alert('날짜를 입력하세요');
			return true;
		}
		year = dateStr.substr(0, 4);
		month = dateStr.substr(5, 2);
		date = dateStr.substr(8, 2);
		if (date === '' || date === '00') {
			if (month === '' || month === '00') {
				configMap.set_cur_anchor('year', year);
			} else {
				configMap.set_cur_anchor('month', year + month);
			}
		} else {
			configMap.set_cur_anchor('day', year + month + date);
		}
		jqueryMap.$container.empty().hide();
	};
	toToday = function (e) {
		var dateStr, month, date;
		e.preventDefault();
		month = configMap.today.month;
		date = configMap.today.date;
		if (month < 10) {
			month = '0' + month;
		}
		if (date < 10) {
			date = '0' + date;
		}
		dateStr = String(configMap.today.year) + month + date;
		configMap.set_cur_anchor('day', dateStr);
		jqueryMap.$container.empty().hide();
	};
	// submit
	makeRandom = function () {
		return ('0000' + Math.floor(Math.random() * 10000 + 1)).slice(-5);
	};
	onSubmitTodo = function (e) {
		var
			$form = $(this).parent(),
			date = $form.find('#todo-input-date').val(),
			time = $form.find('#todo-input-time').val(),
			text = $form.find('#todo-input-text').val(),
			nodue = $form.find('#todo-input-nodue').is(':checked'),
			data, result;
		e.preventDefault();
		if (date === "" || time === "" || text === "") {
			alert('빈칸이 있습니다.');
			return false;
		}
		if (nodue === true) {
			date = 'nodue';
			time = 'nodue';
		}
		data = {
			_id : new Date(date + ' ' + time).getTime() + makeRandom(),
			date: date,
			time: time,
			text: text,
			done: false,
			type: 'todo'
		};
		result = zp.model.setTodo(data);
		result.done(function () {
			jqueryMap.$container.empty().hide();
			console.log('successfully submit todo', result);
			$.gevent.publish('submit', ['todo']);
		});
		result.fail(function () {
			alert('error!');
		});
	};
	onSubmitPlan = function (e) {
		var
			$form = $(this).parent(),
			startdate = $form.find('#plan-input-startdate').val(),
			starttime = $form.find('#plan-input-starttime').val(),
			enddate = $form.find('#plan-input-enddate').val(),
			endtime = $form.find('#plan-input-endtime').val(),
			text = $form.find('#plan-input-text').val(),
			data, dataList = [], date, month, day, hour, minute, obj, result,
			i, o, index, tempData, curDay, dayLen, tempArray, stime, etime,
			shour, smonth, sdate, smin, ehour, emonth, edate, emin, lastdate;
		e.preventDefault();
		if (startdate === '' || text === '') {
			alert('빈칸이 있습니다');
			return false;
		}
		if (!endtime) { // 종료 시간이 없으면 한 시간으로 세팅한다.
			date = new Date(startdate + ' ' + starttime);
			date.setHours(date.getHours() + 1);
			month = ('0' + (date.getMonth() + 1)).slice(-2);
			day = ('0' + date.getDate()).slice(-2);
			hour = ('0' + date.getHours()).slice(-2);
			minute = ('0' + date.getMinutes()).slice(-2);
			enddate = date.getFullYear() + '-' + month + '-' + day;
			endtime = hour + ':' + minute;
		}
		data = {
			_id      : new Date(startdate + ' ' + starttime).getTime() + makeRandom(),
			startdate: startdate,
			starttime: starttime,
			enddate  : enddate,
			endtime  : endtime,
			text     : text,
			plan_idx : makeRandom(),
			type     : 'plan'
		};
		tempData = $.extend({}, data);
		dataList.push(tempData);
		if ($form.find('#plan-input-repeat').is(':checked')) { // 반복이 있을 시
			data.num = $form.find('#plan-input-number').val();
			data.lastdate = $form.find('#plan-input-lastdate').val();
			data.day = $form.find('input[name="repeat-day"]:checked').map(function () {
				return parseInt($(this).val(), 10);
			}).get();
			obj = zp.calendar.objectify(data.startdate);
			curDay = new Date(obj.year, obj.month - 1, obj.date).getDay();
			dayLen = data.day.length;
			for (i = 0; i < dayLen; i++) {
				if (curDay === data.day[i]) {
					index = i;
					break;
				}
			}
			tempArray = data.day.slice(0, index);
			data.day = data.day.slice(index, dayLen).concat(tempArray);
			data.day = data.day.map(function (item, idx) {
				var	gap,
					nextDay = data.day[idx + 1] || data.day[0];
				gap = nextDay - item;
				if (gap < 0) {
					gap += 7;
				}
				return gap;
			});
			if (data.lastdate) {
				stime = new Date(data.startdate + ' ' + data.starttime);
				lastdate = new Date(data.lastdate + ' 00:00:00');
				while (stime.getTime() < lastdate.getTime()) {
					console.log(stime.toISOString(), lastdate.toISOString());
					stime = new Date(data.startdate + ' ' + data.starttime);
					stime.setDate(stime.getDate() + (data.day[i % dayLen]));
					smonth = ('0' + (stime.getMonth() + 1)).slice(-2);
					sdate = ('0' + stime.getDate()).slice(-2);
					shour = ('0' + stime.getHours()).slice(-2);
					smin = ('0' + stime.getMinutes()).slice(-2);
					etime = new Date(data.enddate + ' ' + data.endtime);
					etime.setDate(etime.getDate() + (data.day[i % dayLen]));
					emonth = ('0' + (etime.getMonth() + 1)).slice(-2);
					edate = ('0' + etime.getDate()).slice(-2);
					ehour = ('0' + etime.getHours()).slice(-2);
					emin = ('0' + etime.getMinutes()).slice(-2);
					o = Object.create(data);
					o.text = data.text;
					o.type = 'plan';
					o.plan_idx = data.plan_idx;
					o._id = stime.getTime() + makeRandom();
					data.startdate = o.startdate = stime.getFullYear() + '-' + smonth + '-' + sdate;
					data.starttime = o.starttime = shour + ':' + smin;
					data.enddate = o.enddate = etime.getFullYear() + '-' + emonth + '-' + edate;
					data.endtime = o.endtime = ehour + ':' + emin;
					dataList.push(o);
				}
			}
			if (data.num) {
				for (i = 0; i < data.num; i++) {
					stime = new Date(data.startdate + ' ' + data.starttime);
					stime.setDate(stime.getDate() + (data.day[i % dayLen]));
					smonth = ('0' + (stime.getMonth() + 1)).slice(-2);
					sdate = ('0' + stime.getDate()).slice(-2);
					shour = ('0' + stime.getHours()).slice(-2);
					smin = ('0' + stime.getMinutes()).slice(-2);
					etime = new Date(data.enddate + ' ' + data.endtime);
					etime.setDate(etime.getDate() + (data.day[i % dayLen]));
					emonth = ('0' + (etime.getMonth() + 1)).slice(-2);
					edate = ('0' + etime.getDate()).slice(-2);
					ehour = ('0' + etime.getHours()).slice(-2);
					emin = ('0' + etime.getMinutes()).slice(-2);
					o = Object.create(data);
					o.text = data.text;
					o.type = 'plan';
					o.plan_idx = data.plan_idx;
					o._id = stime.getTime() + makeRandom();
					data.startdate = o.startdate = stime.getFullYear() + '-' + smonth + '-' + sdate;
					data.starttime = o.starttime = shour + ':' + smin;
					data.enddate = o.enddate = etime.getFullYear() + '-' + emonth + '-' + edate;
					data.endtime = o.endtime = ehour + ':' + emin;
					console.log(o.text, o.plan, o);
					dataList.push(o);
				}
			}
		}
		console.log(dataList);
		result = zp.model.setPlan(dataList);
		result.done(function (data) {
			console.log(data);
			jqueryMap.$container.empty().hide();
			$.gevent.publish('submit', ['plan']);
			console.log('plan registered', data);
		});
		return false;
	};
	onSubmitDday = function (e) {
		var
			$form = $(this).parent(),
			target = $form.find('#dday-input-target').val(),
			text = $form.find('#dday-input-text').val(),
			repeat = $form.find('#dday-input-repeat').is(':checked'),
			data, result;
		e.preventDefault();
		if (target === '' || text === '') {
			alert('빈칸이 있습니다');
			return false;
		}
		data = {
			_id   : new Date(target).getTime() + makeRandom(),
			target: target,
			text  : text,
			repeat: repeat,
			type  : 'dday'
		};
		result = zp.model.setDday(data);
		result.done(function (data) {
			console.log(data);
			jqueryMap.$container.empty().hide();
			$.gevent.publish('submit', ['dday']);
			console.log('dday registered', result);
		});
		result.fail(function (err) {
			console.log(err);
			alert('오류 발생');
		});
		return false;
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map   : input_map,
			settable_map: configMap.settable_map,
			config_map  : configMap
		});
	};
	initModule = function ($container, state, data) {
		if (typeof state !== 'string') {
			throw "initModule argument type error";
		}
		if (state === '') {
			state = 'login';
		}
		$container.load('/html/zp.modal.html #modal-' + state, function () {
			stateMap.$container = $container;
			setJqueryMap($container);
			if (data) {
				if (state === 'todo' || state === 'plan' || state === 'dday') {
					var dataStr;
					data.month = (data.month < 10) ? ('0' + data.month) : data.month;
					data.date = (data.date < 10) ? ('0' + data.date) : data.date;
					dataStr = data.year + '-' + data.month + '-' + data.date;
					data.time = (data.time.length === 4) ? '0' + data.time : data.time;
					if (state === 'todo') {
						$container.find('#todo-input-date').val(dataStr);
						$container.find('#todo-input-time').val(data.time);
					} else if (state === 'plan') {
						$container.find('#plan-input-startdate').val(dataStr);
						$container.find('#plan-input-starttime').val(data.time);
					} else if (state === 'dday') {
						$container.find('.dday-input-target').val(dataStr);
					}
				}
			}
			$(document).on('blur', '#join-email', {value: $(this).val()}, checkRegEmail);
			jqueryMap.$close.on('click', onClickClose);
			jqueryMap.$login.on('click', onLogin);
			jqueryMap.$repeat.on('click', onRepeat);
			jqueryMap.$todo.on('click', data, onSubmitTodo);
			jqueryMap.$plan.on('click', data, onSubmitPlan);
			jqueryMap.$dday.on('click', data, onSubmitDday);
			jqueryMap.$plan.parent().find('#plan-input-startdate').on('blur', onSetStartdate);
			jqueryMap.$typeTodo.on('click', data, onTypeTodo);
			jqueryMap.$typePlan.on('click', data, onTypePlan);
			jqueryMap.$typeDday.on('click', data, onTypeDday);
			jqueryMap.$join.on('click', onClickJoin);
			jqueryMap.$back.on('click', onClickBack);
			jqueryMap.$joinSbmt.on('click', onJoin);
			jqueryMap.$checkIdBtn.on('click', onCheckId);
			jqueryMap.$findpw.on('click', onFindPassword);
			jqueryMap.$findIdBtn.on('click', onFindId);
			jqueryMap.$findPwBtn.on('click', onCheckAnswer);
			jqueryMap.$newPwBtn.on('click', onNewPassword);
			jqueryMap.$offline.on('click', onOffline);
			jqueryMap.$search.on('click', onSearch);
			jqueryMap.$today.on('click', toToday);
			jqueryMap.$repeatType.on('change', onToggleRepeatType);
			return $container;
		});
		return $container;
	};
	return {
		configModule: configModule,
		initModule  : initModule
	};
}());
zp.month = (function () {
	var
		configMap = {
			settable_map  : {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			month_list: []
		},
		jqueryMap = {},
		configModule, initModule, setJqueryMap, insertCalendar, insertPlan,
		onClickDate, onClickWeek, Month;
	Month = function ($container, data) {
		var month = data.month,
			year = data.year,
			date_str;
		$container.load('/html/zp.month.html', function () {
			if (month < 10) { month = '0' + month; }
			date_str = String(year) + month;
			console.log('month', date_str);
			setJqueryMap($container, date_str);
			insertCalendar(data.month, data.year);
			jqueryMap[date_str].$month.attr('data-date', date_str);
			jqueryMap[date_str].$month.find('td').on('click', data, onClickDate);
			jqueryMap[date_str].$month.find('tbody th').on('click', data, onClickWeek);
		});
	};
	setJqueryMap = function ($container, str) {
		jqueryMap.$container = $container;
		jqueryMap[str] = {
			$month: $container.find('.month-calendar')
		};
	};
	insertCalendar = function (month, year) {
		var
			option = {
				month: month,
				year : year
			},
			str;
		month = (month < 10) ? '0' + month : month;
		str = String(year) + month;
		zp.calendar.initModule(jqueryMap[str].$month, option);
		insertPlan(str);
		return true;
	};
	insertPlan = function (str) {
		var
			todoMap, ddayMap, planObj, startTime, endTime, time, dateStr,
			i, target, year, month, date, $td, idx, due, $obj, todoResult, planResult, ddayResult,
			cyear = parseInt(str.substr(0, 4), 10),
			cmonth = parseInt(str.substr(4, 2), 10),
			start, smonth, sdate, end, emonth, stime, etime, gap, $cur;
		dateStr = str.substr(0, 4) + '-' + str.substr(4, 2);
		time = new Date(dateStr);
		startTime = time.getTime();
		time.setMonth(time.getMonth() + 1);
		endTime = time.getTime();
		planResult = zp.model.getPlan(startTime + '00000', endTime + '00000');
		ddayResult = zp.model.getDday(startTime + '00000', endTime + '00000');
		todoResult = zp.model.getTodo(startTime + '00000', endTime + '00000');
		planResult.done(function (planList) {
			for (i = 0; i < planList.length; i++) {
				planObj = planList[i];
				console.log(planObj);
				if (planObj) {
					start = planObj.startdate;
					stime = new Date(start).getTime();
					smonth = parseInt(start.substr(5, 2), 10);
					sdate = start.substr(8, 2);
					end = planObj.enddate;
					etime = new Date(end).getTime();
					emonth = parseInt(end.substr(5, 2), 10);
					gap = (etime - stime) / 1000 / 60 / 60 / 24;
					if (smonth <= cmonth && emonth >= cmonth) {
						$td = jqueryMap[str].$month.find('td');
						$td.each(function () {
							if ($(this).find('div').eq(0).text() === sdate) {
								idx = $(this).index();
								$obj = $('<div/>').addClass('month-plan').text(planObj.text);
								$cur = $(this).parent().children();
								$cur.eq(idx).append($obj.clone());
								console.log(idx, gap, $cur);
								while (gap > 0) {
									idx++;
									console.log($cur.eq(idx));
									if ($cur.eq(idx).length) {
										$cur.eq(idx).append($obj.clone());
									} else {
										idx = 1;
										$cur = $cur.parent().next().children();
										$cur.eq(idx).append($obj.clone());
									}
									console.log(idx, gap, $cur);
									gap--;
								}
							}
						});
					}
				}
			}
		});
		planResult.fail(function (err) {
			console.log(err);
		});
		ddayResult.done(function (ddayList) {
			for (i = 0; i < ddayList.length; i++) {
				ddayMap = ddayList[i];
				if (ddayMap) {
					target = ddayMap.target;
					year = parseInt(target.substr(0, 4), 10);
					month = parseInt(target.substr(5, 2), 10);
					date = target.substr(8, 2);
					$td = jqueryMap[str].$month.find('td');
					console.log(ddayMap);
					$td.each(function () {
						if ($(this).find('div').eq(0).text() === date) {
							console.log(date, $(this).find('div').eq(0).text());
							$obj = $('<div/>').addClass('month-dday').text(ddayMap.text);
							$(this).append($obj);
						}
					});
				}
			}
		});
		ddayResult.fail(function (err) {
			console.log(err);
		});
		todoResult.done(function (todoList) {
			for (i = 0; i < todoList.length; i++) {
				todoMap = todoList[i];
				if (todoMap) {
					due = todoMap.date;
					year = parseInt(due.substr(0, 4), 10);
					month = parseInt(due.substr(5, 2), 10);
					date = due.substr(8, 2);
					if (year === cyear && month === cmonth) {
						$td = jqueryMap[str].$month.find('td');
						$td.each(function () {
							if ($(this).find('div').eq(0).text() === date) {
								$obj = $('<div/>').addClass('month-todo').text(todoMap.text);
								if (todoMap.done) {
									$obj.addClass('month-done');
								} else if (new Date(due).getTime() < new Date().getTime()) {
									$obj.addClass('month-due');
								}
								$(this).append($obj);
							}
						});
					}
				}
			}
		});
		todoResult.fail(function (err) {
			console.log(err);
		});
		return true;
	};
	onClickWeek = function (e) {
		var
			week = parseInt(('0' + parseInt($(this).html(), 10)).slice(-2), 10),
			year = e.data.year,
			data;
		if (week === '&nbsp;') {
			return false;
		}
		if (week === '0') {
			year = --year;
			week = zp.calendar.getWeekNum(31, 12, year);
		}
		data = {
			week: week,
			year: year
		};
		$.gevent.publish('week', [data]);
	};
	onClickDate = function (e) {
		var
			date = parseInt($(this).find('div').eq(0).text(), 10),
			month = e.data.month,
			year = e.data.year,
			data;
		if (date == '') {
			return;
		}
		data = {
			date : date,
			month: month,
			year : year
		};
		$.gevent.publish('day', [data]);
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map   : input_map,
			settable_map: configMap.settable_map,
			config_map  : configMap
		});
	};
	initModule = function ($container, data) {
		var dateStr = data.year + ('0' + data.month).slice(-2);
		stateMap.month_list[dateStr] = new Month($container, data);
		return $container;
	};
	return {
		configModule: configModule,
		initModule  : initModule
	};
}());
zp.plan = (function () {
	var
		configMap = {
			settable_map  : {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			$container: null,
			taphold   : null
		},
		jqueryMap = {},
		setJqueryMap, configModule, initModule, showPlan, calculate, onDelete,
		updateStartTime, updateEndTime, updateText, holdTap, holdStop,
		applyStartTime, applyEndTime, applyText;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$main     : $container.find('.plan-main')
		};
	};
	showPlan = function () {
		var planMap, startdate, starttime, enddate, endtime, i, result,
			startStr, endStr, $div, $option, $del, $alarm, $text, $start, $end,
			$frag = $(document.createDocumentFragment());
		result = zp.model.getPlan();
		result.done(function (planList) {
			if (planList.length) {
				jqueryMap.$main.html('');
				for (i = 0; i < planList.length; i++) {
					planMap = planList[i];
					if (planMap) {
						startdate = planMap.startdate;
						starttime = planMap.starttime;
						enddate = planMap.enddate;
						endtime = planMap.endtime;
						startStr = startdate + ' ' + starttime;
						endStr = enddate + ' ' + endtime;
						$div = $('<div/>').addClass('plan-item').attr('data-id', planMap._id);
						$option = $('<div/>').addClass('plan-option');
						$del = $('<div/>').addClass('plan-del').html('<i class="fa fa-trash-o"></i>');
						$alarm = $('<div/>"').addClass('plan-alarm').html('<i class="fa fa-alarm"></i>');
						$text = $('<div/>').addClass('plan-text').text(planMap.text);
						$start = $('<div/>').addClass('plan-start').text(startStr);
						$end = $('<div/>').addClass('plan-end').text(endStr);
						$option.append($del).append($alarm);
						$div.append($start).append($end).append($text).append($option);
						$frag.append($div);
					}
				}
				jqueryMap.$main.append($frag);
			}
		});
		jqueryMap.$main.html('<div class="no-content">일정을 작성해주세요</div>');
	};
	onDelete = function () {
		var
			$item = $(this).closest('.plan-item'),
			id = $item.data('id'), result;
		if (!confirm('삭제하시겠습니까?')) {
			return false;
		}
		result = zp.model.deleteItem(id);
		result.done(function () {
			$item.remove();
		});
		result.fail(function () {
			alert('오류 발생');
		});
		return true;
	};
	holdTap = function (e) {
		console.log('holdtap');
		e.stopImmediatePropagation();
		stateMap.taphold = setTimeout(function () {
			if (e.target.className === 'plan-text') {
				updateText(e.target);
			} else if (e.target.className === 'plan-start') {
				updateStartTime(e.target);
			} else if (e.target.className === 'plan-end') {
				updateEndTime(e.target);
			}
		}, 1000);
		return false;
	};
	holdStop = function (e) {
		console.log('holdstop');
		e.stopPropagation();
		clearTimeout(stateMap.taphold);
		return false;
	};
	updateStartTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyStartTime);
	};
	updateEndTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyEndTime);
	};
	updateText = function (target) {
		var text = $(target).text();
		$(target).empty().append('<input type="text" value="' + text + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: text
		}, applyText);
	};
	applyStartTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx, date, time;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		date = update.substr(0, 10);
		time = update.substr(11, 8);
		alert(cidx);
		plan_list[cidx].startdate = date;
		plan_list[cidx].starttime = time;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	applyEndTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx, date, time;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		date = update.substr(0, 10);
		time = update.substr(11, 8);
		alert(cidx);
		plan_list[cidx].enddate = date;
		plan_list[cidx].endtime = time;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	applyText = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		alert(cidx);
		plan_list[cidx].text = update;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map   : input_map,
			settable_map: configMap.settable_map,
			config_map  : configMap
		});
	};
	initModule = function ($container) {
		$container.load('/html/zp.plan.html', function () {
			stateMap.$container = $container;
			setJqueryMap($container);
			showPlan();
			jqueryMap.$main.on('click', '.plan-del', onDelete);
			jqueryMap.$main.on('touchstart', '.plan-text, .plan-start, .plan-end', holdTap);
			jqueryMap.$main.on('touchend', '.plan-text, .plan-start, .plan-end', holdStop);
		});
	};
	return {
		configModule: configModule,
		initModule  : initModule
	};
}());
zp.todo = (function () {
    'use strict';
    var
        configMap = {
            settable_map: {
                set_cur_anchor: true
            },
            set_cur_anchor: null
        },
        stateMap = {
            $container: null
        },
        jqueryMap = {},
        setJqueryMap, showTodo, configModule, initModule, onCheck, onDelete, setAlarm,
        updateTime, updateText, holdTap, holdStop, applyTime, applyText, isMobile;

    setJqueryMap = function ($container) {
        jqueryMap = {
            $container: $container,
            $main: $container.find('.todo-main')
        };
    };
    showTodo = function () {
        var
            $due, $text, $check, $div, $del, $alarm, $option, checked, todoMap,
            dateStr, date, time, i, result,
            $frag = $(document.createDocumentFragment());
        result = zp.model.getTodo();
        result.done(function (todoList) {
            console.log(todoList);
            if (todoList.length) {
                jqueryMap.$main.html('');
                for (i = 0; i < todoList.length; i++) {
                    todoMap = todoList[i];
                    console.log(todoMap);
                    if (todoMap) {
                        date = todoMap.date;
                        time = todoMap.time;
                        checked = todoMap.done;
                        dateStr = date + ' ' + time;
                        $div = $('<div/>').addClass('todo-item').attr('data-id', todoMap._id);
                        $check = $('<div/>').addClass('todo-done').append('<input type="checkbox" size="3">');
                        $option = $('<div/>').addClass('todo-option');
                        $del = $('<div/>').addClass('todo-del').html('<i class="fa fa-trash-o"></i>');
                        $alarm = $('<div/>').addClass('todo-alarm').html('<i class="fa fa-bell-o"></i>');
                        $text = $('<div/>').addClass('todo-text').text(todoMap.text);
                        $due = $('<div/>').addClass('todo-due').text(dateStr);
                        if (new Date(dateStr).getTime() < new Date().getTime()) {
                            $text.addClass('item-due');
                        }
                        if (checked) {
                            $check.find('input').prop('checked', true);
                            $text.addClass('item-done');
                        }
                        $option.append($del).append($alarm);
                        $div.append($check).append($text).append($option).append($due);
                        $frag.append($div);
                    }
                }
                jqueryMap.$main.append($frag);
            }
        });
        result.fail(function (err) {
            alert(err);
        });
        jqueryMap.$main.html('<div class="no-content">할일을 작성해주세요</div>');
        return true;
    };

    onCheck = function () {
        var $text = $(this).parent().next(),
            id = $(this).closest('.todo-item').data('id');
        if ($(this).is(':checked')) {
            $(this).prop('checked', true);
            $text.addClass('item-done');
			zp.model.todoToggle(id, true);
        } else {
            $(this).prop('checked', false);
            $text.removeClass('item-done');
            zp.model.todoToggle(id, false);
        }
        return true;
    };

    onDelete = function () {
        var
            $item = $(this).closest('.todo-item'),
            id = $item.data('id'),
            result;
		if (!confirm('삭제하시겠습니까?')) {
			return false;
		}
		result = zp.model.deleteItem(id);
		result.done(function () {
			$item.remove();
		});
		result.fail(function () {
			alert('오류 발생');
		});
		return true;
    };

    isMobile = function () {
        var ht = {
            Android: /Android/,
            iOS: /like Mac OS X/
        }, os, key;
        for (key in ht) {
            if (ht.hasOwnProperty(key) && ht[key].test(navigator.userAgent)) {
                os = key;
            }
        }
        return (os === 'Android' || os === 'iOS');
    };

    setAlarm = function () {
        if (isMobile()) {
            // todo: 모바일일 때 알람 구현
            alert('준비중입니다');
            return false;
        }
        alert('모바일에서만 가능한 기능입니다');
        return false;
    };

    holdTap = function (e) {
        console.log('holdtap');
        e.stopImmediatePropagation();
        stateMap.taphold = setTimeout(function () {
            if (e.target.className === 'todo-text') {
                updateText(e.target);
            } else if (e.target.className === 'todo-due') {
                updateTime(e.target);
            }
        }, 1000);
        return false;
    };

    holdStop = function (e) {
        console.log('holdstop');
        e.stopPropagation();
        clearTimeout(stateMap.taphold);
        return false;
    };

    updateTime = function (target) {
        var time = $(target).text();
        $(target).empty().append('<input type="text" value="' + time + '"/>');
        $(target).find('input').focus().on('blur', {
            target: target,
            origin: time
        }, applyTime);
    };

    updateText = function (target) {
        var text = $(target).text();
        $(target).empty().append('<input type="text" value="' + text + '"/>');
        $(target).find('input').focus().on('blur', {
            target: target,
            origin: text
        }, applyText);
    };

    applyTime = function (e) {
        var data = e.data,
            $target = $(data.target),
            update = $target.find('input').val(),
            change_obj, todo_list, cidx, date, time;
        if (data.origin === update) {
            $target.empty().text(data.origin);
            return;
        }
        $target.empty().text(update);
        change_obj = JSON.parse(localStorage.change);
        todo_list = JSON.parse(localStorage.todo);
        cidx = $target.parent('.todo-item').data('idx');
        date = update.substr(0, 10);
        time = update.substr(11, 8);
        alert(cidx);
        todo_list[cidx].date = date;
        todo_list[cidx].time = time;
        change_obj.u.push({
            cidx: cidx,
            type: 'todo'
        });
        localStorage.todo = JSON.stringify(todo_list);
        localStorage.change = JSON.stringify(change_obj);
    };

    applyText = function (e) {
        var data = e.data,
            $target = $(data.target),
            update = $target.find('input').val(),
            change_obj, todo_list, cidx;
        if (data.origin === update) {
            $target.empty().text(data.origin);
            return;
        }
        $target.empty().text(update);
        change_obj = JSON.parse(localStorage.change);
        todo_list = JSON.parse(localStorage.todo);
        cidx = $target.parent('.todo-item').data('idx');
        alert(cidx);
        todo_list[cidx].text = update;
        change_obj.u.push({
            cidx: cidx,
            type: 'todo'
        });
        localStorage.todo = JSON.stringify(todo_list);
        localStorage.change = JSON.stringify(change_obj);
    };

    configModule = function (input_map) {
        zp.util.setConfigMap({
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
        });
    };

    initModule = function ($container) {
        $container.load('/html/zp.todo.html', function () {
            stateMap.$container = $container;
            setJqueryMap($container);
            showTodo();
            jqueryMap.$main.on('click', 'input[type=checkbox]', onCheck);
            jqueryMap.$main.on('click', '.todo-del', onDelete);
            jqueryMap.$main.on('click', '.todo-alarm', setAlarm);
            jqueryMap.$main.on('touchstart', '.todo-text, .todo-due', holdTap);
            jqueryMap.$main.on('touchend', '.todo-text, .todo-due', holdStop);
        });
        return $container;
    };

    return {
        configModule: configModule,
        initModule: initModule
    };
}());
zp.week = (function () {
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null,
			tr_h: 30
		},
		stateMap = {
			week_list: []
		},
		jqueryMap = {},
		configModule, initModule, setJqueryMap, insertDate, insertPlan,
		onClickDate, Week;

	Week = function ($container, data) {
		var week = data.week,
			year = data.year,
			dateStr;
		$container.load('/html/zp.week.html', function () {
			dateStr = year + ('0' + week).slice(-2);
			setJqueryMap($container, dateStr);
			insertDate(week, year);
			jqueryMap[dateStr].$week.attr('data-week', dateStr);
			jqueryMap[dateStr].$thead.on('click', data, onClickDate);
		});
	};

	setJqueryMap = function ($container, str) {
		jqueryMap.$container = $container;
		jqueryMap[str] = {
			$week: $container.find('.week-table'),
			$thead: $container.find('thead th'),
			$info: $container.find('.week-info')
		};
	};

	insertDate = function (week, year) {
		var
			str = year + ('0' + week).slice(-2),
			list = zp.calendar.getWeekDay(week, year),
			i = 0,
			dateStr;
		for (i; i < 7; i++) {
			dateStr = list[i].month + '.' + list[i].date;
			jqueryMap[str].$thead.eq(i).text(dateStr);
		}
		insertPlan(str);
		return true;
	};

	insertPlan = function (str) {
		var
			todoMap, ddayMap, planMap, top, todoResult, planResult, ddayResult, dateString,
			i, j, month, date, left, hour, min, $div, $tr, startTime, endTime, time, dateStr,
			cyear = parseInt(str.substr(0, 4), 10),
			cweek = parseInt(str.substr(4, 2), 10),
			dateList = zp.calendar.getWeekDay(cweek, cyear);
		dateStr = str.substr(0, 4) + '-' + ('0' + dateList[0].month).slice(-2) + '-' + ('0' + dateList[0].date).slice(-2);
		time = new Date(dateStr);
		startTime = time.getTime();
		time.setDate(time.getDate() + 7);
		endTime = time.getTime();
		todoResult = zp.model.getTodo(startTime + '00000', endTime + '00000');
		planResult = zp.model.getPlan(startTime + '00000', endTime + '00000');
		ddayResult = zp.model.getDday(startTime + '00000', endTime + '00000');
		console.log(str, '일정을 삽입합니다.');
		ddayResult.done(function (ddayList) {
			for (i = 0; i < ddayList.length; i++) {
				ddayMap = ddayList[i];
				if (ddayMap) {
					console.log(ddayMap);
					for (j = 0; j < 7; j++) {
						month = ('0' + dateList[j].month).slice(-2);
						date = ('0' + dateList[j].date).slice(-2);
						dateString = cyear + '-' + month + '-' + date;
						if (ddayMap.target === dateString) {
							console.log(ddayMap.target, dateString);
							$tr = jqueryMap[str].$info.children().eq(j);
							$div = $('<div/>').addClass('week-dday').text(ddayMap.text).appendTo($tr);
						}
					}
				}
			}
		});
		ddayResult.fail(function (err) {
			console.log(err);
		});
		todoResult.done(function (todoList) {
			for (i = 0; i < todoList.length; i++) {
				todoMap = todoList[i];
				if (todoMap) {
					for (j = 0; j < 7; j++) {
		 				month = ('0' + dateList[j].month).slice(-2);
						date = ('0' + dateList[j].date).slice(-2);
						dateString = cyear + '-' + month + '-' + date;
						if (todoMap.date === dateString) {
							hour = todoMap.time.substr(0, 2);
							min = todoMap.time.substr(3, 2);
							top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
							console.log('top', top);
							$div = $('<div/>').addClass('week-todo').attr('data-id', todoMap._id);
							 if (todoMap.done) {
								$div.addClass('week-done');
							} else if (new Date(todoMap.date).getTime() < new Date().getTime()) {
								$div.addClass('week-due');
							}
							left = 14.285714 * j + '%';
							$div.css({top: top, left: left}).append($('<div/>'))
								.find('div').addClass('input').text(todoMap.text);
							$div.appendTo(jqueryMap[str].$week);
						}
					}					
				} 
			}	
		});
		todoResult.fail(function (err) {
			console.log(err);
		});
		planResult.done(function (planList) {
			var stime, etime, ctime, height, ehour, emin, etop;
			for (i = 0; i < planList.length; i++) {
				planMap = planList[i];
				if (planMap) {
	 				for (j = 0; j < 7; j++) {
		 				month = ('0' + dateList[j].month).slice(-2);
						date = ('0' + dateList[j].date).slice(-2);
						dateString = cyear + '-' + month + '-' + date;
						stime = new Date(planMap.startdate).getTime();
						etime = new Date(planMap.enddate).getTime();
						ctime = new Date(dateString);
						if (stime <= ctime && ctime <= etime) {
							if (stime === ctime) {
								hour = planMap.starttime.substr(0, 2);
								min = planMap.starttime.substr(3, 2);
								top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
								if (ctime === etime) {
									ehour = planMap.endtime.substr(0, 2);
									emin = planMap.endtime.substr(3, 2);
									etop = ehour * configMap.tr_h + emin * configMap.tr_h / 60 + 61;
									height = etop - top;
								} else {
									height = configMap.tr_h * 24 - top;
								}								
								$div = $('<div/>').addClass('week-plan').attr('data-idx', i);
								left = 14.285714 * j + '%';
								$div.css({top: top, left: left, height: height}).append($('<div/>'))
									.find('div').addClass('input').text(planMap.text);
								$div.appendTo(jqueryMap[str].$week);
							} else if (stime < ctime && ctime < etime) {
								$tr = jqueryMap[str].$info.children().eq(j);
								$div = $('<div/>').addClass('week-whole').text(planMap.text).appendTo($tr);
							} else if (ctime === etime) {
								hour = planMap.endtime.substr(0, 2);
								min = planMap.endtime.substr(3, 2);
								top = 0;
								left = 14.285714 * j + '%' ;
								height = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
								$div = $('<div/>').addClass('week-plan').attr('data-idx', i);
								$div.css({top: top, left: left, height: height}).append($('<div/>'))
									.find('div').addClass('input').text(planMap.text);
								$div.appendTo(jqueryMap[str].$week);					
							}
						}
					}
				} 
			}	
		});
		planResult.fail(function (err) {
			console.log(err);
		});
		return true;
	};	

	onClickDate = function (e) {
		var
			text = $(this).text(),
			date = parseInt(text.split('.')[1], 10),
			month = parseInt(text.split('.')[0], 10),
			year = e.data.year,
			data;
		if (date === '') {
			return;	
		}
		data = {
			date: date,
			month: month,
			year: year
		};
		$.gevent.publish('day', [data]);
	};

	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};

	initModule = function ($container, data) {
		var dateStr = data.year + ('0' + data.week).slice(-2);
		stateMap.week_list[dateStr] = new Week($container, data);

		return stateMap.week_list;
	};

	return {
		configModule: configModule,
		initModule: initModule
	};
}());
zp.year = (function () {
	'use strict';
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			$container: null,
			year_list: []
		},
		jqueryMap = {},
		initModule, setJqueryMap, configModule, insertCalendar, onClickTable, Year;

	Year = function ($container, data) {
		$container.load('/html/zp.year.html', function () {
			console.log(data.year);
			setJqueryMap($container, data.year);
			insertCalendar(data.year);
			jqueryMap[data.year].$calendar.on('click', data, onClickTable);
		});
	};

	insertCalendar = function (year) {
		var
			$container, i = 0,
			option = {
				year: year
			};
		for (i; i < 12; i++) {
			$container = jqueryMap[year].$calendar.eq(i);
			option.month = parseInt($container.data('month'), 10);
			zp.calendar.initModule($container, option);
		}
	};

	setJqueryMap = function ($container, str) {
		jqueryMap.$container = $container;
		jqueryMap[str] = {
			$calendar: $container.find('.year-calendar')
		};
	};
	
	onClickTable = function (e) {
		var
			month = $(this).data('month'),
			year = e.data.year,
			data = {
				month: month,
				year: year
			};
		$.gevent.publish('month', [data]);
	};

	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};

	initModule = function ($container, data) {
		data.year = parseInt(data.year, 10);
		stateMap.$container = $container;
		stateMap.year_list[data.year] = new Year($container, data);
	};
		
	return {
		configModule: configModule,
		initModule: initModule
	};
}());