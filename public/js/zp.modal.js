zp.modal = (function () {
	'use strict';
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null,
			today: {
				year: new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				date: new Date().getDate()
			}
		},
		stateMap = {
			$container: null,
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			date: new Date().getDate(),
			hour: new Date().getHours(),
			minute: new Date().getMinutes()
		},
		jqueryMap = {},
		setJqueryMap, configModule, initModule, onClickClose, onClickBack,
		onTypeTodo, onTypePlan, onTypeDday, onSubmitTodo, onSubmitPlan, onSubmitDday,
		onRepeat, onSetStartdate, onSearch, onToggleRepeatType, onNoDue,
		onLogin, onClickJoin, onOffline, checkRegEmail, toToday, makeRandom,
		onJoin, onFindPassword, onFindId, onCheckAnswer, onCheckId, onNewPassword;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$closeBtn: $container.find('.modal-close'),
			$backBtn: $container.find('.modal-back'),
			$loginSbmt: $container.find('#login-sbmt'),
			$todoSbmt: $container.find('#todo-sbmt'),
			$planSbmt: $container.find('#plan-sbmt'),
			$ddaySbmt: $container.find('#dday-sbmt'),
			$joinBtn: $container.find('#join-btn'),
			$findPassBtn: $container.find('#findpw-btn'),
			$offlineBtn: $container.find('#offline-btn'),
			$typeTodo: $container.find('#type-todo'),
			$datelessChkbx: $container.find('#todo-input-dateless'),
			$typePlan: $container.find('#type-plan'),
			$typeDday: $container.find('#type-dday'),
			$checkIdBtn: $container.find('#check-id-btn'),
			$joinSbmt: $container.find('#join-sbmt'),
			$findIdForm: $container.find('#findpw-id-form'),
			$findIdBtn: $container.find('#findpw-id-sbmt'),
			$answerChkForm: $container.find('#findpw-qst-form'),
			$answerChkBtn: $container.find('#findpw-ans-sbmt'),
			$newPassForm: $container.find('#findpw-newpw-form'),
			$newPassBtn: $container.find('#findpw-newpw-sbmt'),
			$repeat: $container.find('#plan-input-repeat'),
			$repeatType: $container.find('input[name="repeat-type"]'),
			$search: $container.find('#search-btn'),
			$today: $container.find('#search-today')
		};
	};
	onLogin = function (e) {
		var
			$loginForm = $(this).parent(),
			$id = $loginForm.find('#login-id'),
			$pw = $loginForm.find('#login-pw'),
			id = $id.val(),
			pw = $pw.val(),
			data, result, spinner;
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
			$(spinner.el).remove();
			alert('로그인 성공!');
			jqueryMap.$container.hide();
			$.gevent.publish('login', [data]);
			if (confirm('서버의 데이터와 동기화하시겠습니까?')) {
				zp.model.sync(id);
			}
		});
		result.fail(function () {
			$(spinner.el).remove();
			alert('아이디가 없거나 패스워드가 틀렸습니다.');
			$id.val('').focus();
			$pw.val('');
			return false;
		});
		spinner = new Spinner().spin();
		jqueryMap.$container.append(spinner.el);
	};
	onTypeTodo = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'todo-modal', e.data);
	};
	onTypePlan = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'plan-modal', e.data);
	};
	onTypeDday = function (e) {
		zp.modal.initModule(jqueryMap.$container, 'dday-modal', e.data);
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
			jqueryMap.$answerChkForm.show();
			jqueryMap.$answerChkForm.find('#findpw-ans').focus();
			jqueryMap.$answerChkForm.find('#findpw-qst').html(data.qst);
		});
		result.fail(function () {
			alert('아이디가 없습니다.');
		});
		return false;
	};
	onCheckAnswer = function (e) {
		var
			data = {
				id: jqueryMap.$findIdForm.find('#findpw-id').val(),
				ans: jqueryMap.$answerChkForm.find('#findpw-ans').val()
			},
			result;
		e.preventDefault();
		if (!data.ans) {
			alert('답변을 입력해주세요');
			jqueryMap.$answerChkForm.find('#findpw-ans').focus();
		}
		result = zp.model.checkAnswer(data);
		result.done(function () {
			jqueryMap.$newPassForm.show();
			jqueryMap.$newPassForm.find('#findpw-newpw').focus();
		});
		result.fail(function (err) {
			if (err === 'wrong answer') {
				alert('답변이 틀렸습니다.');
				jqueryMap.$answerChkForm.find('#findpw-ans').val('').focus();
			}
		});
	};
	onNewPassword = function (e) {
		var
			$newpw = jqueryMap.$newPassForm.find('#findpw-newpw'),
			$newpwchk = jqueryMap.$newPassForm.find('#findpw-newpwchk'),
			data, result;
		e.preventDefault();
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
			email = e || $(this).val();
		if (email === '') { // 블러로 접근하고 빈칸일 때
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
				id: $id.val(),
				email: $email.val(),
				pw: $pw.val(),
				nick: $nick.val(),
				qst: $qst.val(),
				ans: $ans.val(),
				avatar: 'z'
			},
			result, spinner;
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
			$(spinner.el).remove();
			console.log(res);
			alert('회원이 되신 것을 축하드립니다!');
		});
		result.fail(function (err) {
			$(spinner.el).remove();
			console.log(err);
			alert('오류가 발생했습니다. 다시 시도해주세요.');
		});
		spinner = new Spinner().spin();
		jqueryMap.$container.append(spinner.el);
	};
	// search
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
	onRepeat = function () {
		$(this).next().toggle();
	};
	onToggleRepeatType = function () {
		var $weekBox = $('#plan-repeat-everyweek'),
			$monthBox = $('#plan-repeat-everymonth'),
			$checkboxDay = $weekBox.find('input[name=repeat-day]');
		if ($(this).val() === 'everyday') {
			$checkboxDay.prop('checked', true);
			$weekBox.hide();
		} else if ($(this).val() === 'everyweek') {
			$checkboxDay.prop('checked', false);
			$weekBox.show();
		} else if ($(this).val() === 'everymonth') {
			$checkboxDay.prop('checked', false);
			$monthBox.show();
		}
	};
	onSetStartdate = function () {
		// todo: 더 정확하게 수정
		var $enddate = $(this).parent().find('#plan-input-enddate');
		if ($enddate.val() === '') {
			$enddate.val($(this).val());
		}
	};
	makeRandom = function () {
		return ('0000' + Math.floor(Math.random() * 10000 + 1)).slice(-5);
	};
	onNoDue = function () {
		var chekced = $(this).is(':checked');
		if (chekced) {
			jqueryMap.$container.find('#todo-input-date').prop('disabled', true);
			jqueryMap.$container.find('#todo-input-time').prop('disabled', true);
		} else {
			jqueryMap.$container.find('#todo-input-date').prop('disabled', false);
			jqueryMap.$container.find('#todo-input-time').prop('disabled', false);
		}
	};
	onSubmitTodo = function (e) {
		var
			$form = $(this).parent(),
			date = $form.find('#todo-input-date').val(),
			time = $form.find('#todo-input-time').val(),
			text = $form.find('#todo-input-text').val(),
			dateless = $form.find('#todo-input-dateless').is(':checked'),
			data, result;
		e.preventDefault();
		if (date === "" || time === "" || text === "") {
			alert('빈칸이 있습니다.');
			return false;
		}
		data = {
			_id: new Date(date + ' ' + time).getTime() + makeRandom(),
			date: date,
			time: time,
			text: text,
			done: false,
			alarm: false,
			type: 'todo'
		};
		if (dateless === true) {
			data.date = 'dateless';
			data.time = 'dateless';
			data._id = new Date().getTime() + makeRandom();
		}
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
			_id: new Date(startdate + ' ' + starttime).getTime() + makeRandom(),
			startdate: startdate,
			starttime: starttime,
			enddate: enddate,
			endtime: endtime,
			text: text,
			plan_idx: makeRandom(),
			type: 'plan'
		};
		tempData = $.extend({}, data);
		dataList.push(tempData);
		if ($form.find('#plan-input-repeat').is(':checked')) { // 매일 또는 매주 반복이 있을 시
			if ($form.find('#repeat-type-everymonth').is(':selected')) {
				data.week = $form.find('input[name="repeat-month"]:checked').map(function () {
					return parseInt($(this).val(), 10);
				}).get();
			} else {
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
					var gap,
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
				} // end data.num
			} // end else
		}
		console.log(dataList);
		//result = zp.model.setPlan(dataList);
		//result.done(function (data) {
		//	console.log(data);
		//	jqueryMap.$container.empty().hide();
		//	$.gevent.publish('submit', ['plan']);
		//	console.log('plan registered', data);
		//});
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
			_id: new Date(target).getTime() + makeRandom(),
			target: target,
			text: text,
			repeat: repeat,
			type: 'dday'
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
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};
	initModule = function ($container, state, data) {
		var dateStr;
		if (typeof state !== 'string') {
			throw "initModule argument type error";
		}
		if (state === '') {
			state = 'login';
		}
		$container.html($('#zp-' + state).html());
		stateMap.$container = $container;
		setJqueryMap($container);
		if (data) {
			if (state === 'type') {
				$container.find('h2').html(data.year + '-' + data.month + '-' + data.date + ' ' + data.time);
			}
			if (state === 'todo-modal' || state === 'plan-modal' || state === 'dday-modal') {
				data.month = (data.month < 10) ? ('0' + data.month) : data.month;
				data.date = (data.date < 10) ? ('0' + data.date) : data.date;
				dateStr = data.year + '-' + data.month + '-' + data.date;
				data.time = (data.time.length === 4) ? '0' + data.time : data.time;
				if (state === 'todo-modal') {
					$container.find('#todo-input-date').val(dateStr);
					$container.find('#todo-input-time').val(data.time);
				} else if (state === 'plan-modal') {
					$container.find('#plan-input-startdate').val(dateStr);
					$container.find('#plan-input-starttime').val(data.time);
				} else if (state === 'dday-modal') {
					$container.find('.dday-input-target').val(dateStr);
				}
			}
		}
		$(document).on('blur', '#join-email', checkRegEmail);
		jqueryMap.$closeBtn.on('click', onClickClose);
		jqueryMap.$loginSbmt.on('click', onLogin);
		jqueryMap.$repeat.on('click', onRepeat);
		jqueryMap.$todoSbmt.on('click', data, onSubmitTodo);
		jqueryMap.$planSbmt.on('click', data, onSubmitPlan);
		jqueryMap.$ddaySbmt.on('click', data, onSubmitDday);
		jqueryMap.$datelessChkbx.on('click', onNoDue);
		jqueryMap.$planSbmt.parent().find('#plan-input-startdate').on('blur', onSetStartdate);
		jqueryMap.$typeTodo.on('click', data, onTypeTodo);
		jqueryMap.$typePlan.on('click', data, onTypePlan);
		jqueryMap.$typeDday.on('click', data, onTypeDday);
		jqueryMap.$joinBtn.on('click', onClickJoin);
		jqueryMap.$backBtn.on('click', onClickBack);
		jqueryMap.$joinSbmt.on('click', onJoin);
		jqueryMap.$checkIdBtn.on('click', onCheckId);
		jqueryMap.$findPassBtn.on('click', onFindPassword);
		jqueryMap.$findIdBtn.on('click', onFindId);
		jqueryMap.$answerChkBtn.on('click', onCheckAnswer);
		jqueryMap.$newPassBtn.on('click', onNewPassword);
		jqueryMap.$offlineBtn.on('click', onOffline);
		jqueryMap.$search.on('click', onSearch);
		jqueryMap.$today.on('click', toToday);
		jqueryMap.$repeatType.on('change', onToggleRepeatType);
		return $container;
	};
	return {
		configModule: configModule,
		initModule: initModule
	};
}());