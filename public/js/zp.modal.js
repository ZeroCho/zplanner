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