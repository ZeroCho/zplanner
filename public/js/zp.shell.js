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
					year: true,
					month: true,
					week: true,
					day: true,
					plan: true,
					todo: true,
					dday: true
				},
				date: true
			},
			today: {
				year: new Date().getFullYear(),
				month: new Date().getMonth() + 1,
				date: new Date().getDate(),
				week: zp.calendar.getWeekNum(new Date().getDate(), new Date().getMonth() + 1),
				day: new Date().getDay()
			},
			day: ['일', '월', '화', '수', '목', '금', '토']
		},
		stateMap = {
			$container: null,
			anchor_map: {},
			current: 'day',
			act: 'reload',
			date_info: {
				year: configMap.today.year,
				month: configMap.today.month,
				date: configMap.today.date,
				week: configMap.today.week,
				day: configMap.today.day
			},
			state: 'static',
			fidx: 0,
			container_height: 960
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
		onSwipe, initPosition, setPosition, getDirection, onTouchend, onTouchmove, onTouchstart,
	// misc
		onError, adjustHeight;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$header: $container.find('header'),
			$user: $container.find('.user'),
			$avatar: $container.find('.avatar'),
			$info: $container.find('.info'),
			$name: $container.find('.name'),
			$menu: $container.find('.menu'),
			$logout: $container.find('#menu-logout'),
			$profile: $container.find('#menu-profile'),
			$upload: $container.find('#menu-upload'),
			$download: $container.find('#menu-download'),
			$option: $container.find('#menu-option'),
			$report: $container.find('#menu-report'),
			$main: $container.find('main'),
			$flickView: $container.find('#flick-view'),
			$flickCon: $container.find('#flick-con'),
			$flickPanel: $container.find('.flick-panel'),
			$toggle: $container.find('.tool-toggle'),
			$search: $container.find('.tool-search'),
			$modal: $container.find('.modal'),
			$intro: $container.find('.intro')
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
		zp[mod].initModule(jqueryMap.$flickPanel.eq(0), data);
		switch (mod) {
			case 'day':
				tempData = zp.calendar.getNextDate(data);
				zp.day.initModule(jqueryMap.$flickPanel.eq(1), tempData);
				tempData = zp.calendar.getPrevDate(data);
				zp.day.initModule(jqueryMap.$flickPanel.eq(2), tempData);
				break;
			case 'week':
				tempData.week = data.week + 1;
				tempData.year = data.year;
				if (tempData.week === 54) {
					tempData.week = 1;
					tempData.year += 1;
				}
				zp.week.initModule(jqueryMap.$flickPanel.eq(1), tempData);
				tempData.week = data.week - 1;
				if (tempData.week === 0) {
					tempData.week = 53;
					tempData.year -= 1;
				}
				zp.week.initModule(jqueryMap.$flickPanel.eq(2), tempData);
				break;
			case 'month':
				tempData = {
					year: data.year,
					month: data.month + 1
				};
				if (tempData.month === 13) {
					tempData.month = 1;
					tempData.year += 1;
				}
				zp.month.initModule(jqueryMap.$flickPanel.eq(1), tempData);
				tempData = {
					year: data.year,
					month: data.month - 1
				};
				if (tempData.month === 0) {
					tempData.month = 12;
					tempData.year -= 1;
				}
				zp.month.initModule(jqueryMap.$flickPanel.eq(2), tempData);
				break;
			case 'year':
				tempData = {
					year: data.year + 1
				};
				zp.year.initModule(jqueryMap.$flickPanel.eq(1), tempData);
				tempData = {
					year: data.year - 1
				};
				zp.year.initModule(jqueryMap.$flickPanel.eq(2), tempData);
				break;
			default:
				throw 'initMain error!';
		}
		stateMap.current = mod;
		initPosition();
		setTitle(data);
	};
	setTitle = function (data) {
		var titleStr = '',
			styleStr = '',
			cur = stateMap.current;
		switch (cur) {
			case 'day':
				if (data.day === 0) {
					styleStr = 'style="color:yellow;"';
				} else if (data.day === 6) {
					styleStr = 'style="color:blue;"';
				}
				titleStr = '<span class="title-year">' + data.year
					+ '</span>.<span class="title-month">' + data.month
					+ '</span>.<span class="title-date">' + data.date
					+ '</span> <span class="title-day" ' + styleStr + '>'
					+ configMap.day[data.day] + '</span> <span class="title-week">'
					+ data.week + '주차</span>';
				break;
			case 'week':
				data.week = data.week || zp.calendar.getWeekNum(data.date, data.month, data.year);
				titleStr = '<span class="title-year">' + data.year
					+ '</span>년 <span class="title">' + data.week + '주차</span>';
				break;
			case 'month':
				titleStr = '<span class="title-year">' + data.year
					+ '년</span> <span class="title">' + data.month + '월</span>';
				break;
			case 'year':
				titleStr = '<span class="title">' + data.year + '년</span>';
				break;
			case 'todo':
				titleStr = '<span class="title">할일</span>';
				break;
			case 'plan':
				titleStr = '<span class="title">일정</span>';
				break;
			case 'dday':
				titleStr = '<span class="title">D-day / 기념일</span>';
				break;
			default:
				throw 'setTitle Error!';
		}
		jqueryMap.$info.html(titleStr);
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
			tempData, page;
		stateMap.act = 'swipe';
		cur_data.year = parseInt(cur_data.year, 10);
		cur_data.month = parseInt(cur_data.month, 10);
		cur_data.week = parseInt(cur_data.week, 10);
		if (direction === 'left') { // show next
			setPosition(direction);
			adjustHeight();
			page = (stateMap.fidx + 1) % 3;
			switch (cur) {
				case 'day':
					cur_data = setTitle(zp.calendar.getNextDate(cur_data));
					// 다음 모듈을 미리 로드(2일 후)
					tempData = zp.calendar.getNextDate(cur_data);
					zp[cur].initModule(jqueryMap.$flickPanel.eq(page), tempData);
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
					tempData = setTitle(cur_data);
					tempData.week += 1;
					if (tempData.week === 54) {
						tempData.week = 1;
						tempData.year += 1;
					}
					zp.week.initModule(jqueryMap.$flickPanel.eq(page), tempData);
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
					tempData = setTitle(cur_data);
					tempData.month += 1;
					if (tempData.month === 13) {
						tempData.month = 1;
						tempData.year += 1;
					}
					zp.month.initModule(jqueryMap.$flickPanel.eq(page), tempData);
					// 주소는 1달 후로
					setCurAnchor('month', cur_data.year + ('0' + cur_data.month).slice(-2));
					break;
				case 'year':
					cur_data.year += 1;
					// 다음 모듈을 미리 로드 (2년 후)
					cur_data = setTitle(cur_data);
					tempData = $.extend({}, cur_data);
					tempData.year += 1;
					zp.year.initModule(jqueryMap.$flickPanel.eq(page), tempData);
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
				default:
					throw 'onSwipe left error!';
			}
		} else { // right prev
			setPosition(direction);
			adjustHeight();
			page = (stateMap.fidx - 1) % 3;
			switch (cur) {
				case 'day':
					cur_data = setTitle(zp.calendar.getPrevDate(cur_data));
					tempData = zp.calendar.getPrevDate(cur_data);
					zp[cur].initModule(jqueryMap.$flickPanel.eq(page), tempData);
					setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2) + ('0' + cur_data.date).slice(-2));
					break;
				case 'week':
					cur_data.week -= 1;
					if (cur_data.week === 0) {
						cur_data.week = 53;
						cur_data.year -= 1;
					}
					// 다음 모듈을 미리 로드(2주 후)
					tempData = setTitle(cur_data);
					tempData.week -= 1;
					if (tempData.week === 0) {
						tempData.week = 53;
						tempData.year -= 1;
					}
					zp.week.initModule(jqueryMap.$flickPanel.eq(page), tempData);
					// 주소는 1달 후로
					setCurAnchor('week', cur_data.year + ('0' + cur_data.week).slice(-2));
					break;
				case 'month':
					cur_data.month -= 1;
					if (cur_data.month === 0) {
						cur_data.month = 12;
						cur_data.year -= 1;
					}
					tempData = setTitle(cur_data);
					tempData.month -= 1;
					if (tempData.month === 0) {
						tempData.month = 12;
						tempData.year -= 1;
					}
					zp[cur].initModule(jqueryMap.$flickPanel.eq(page), tempData);
					setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2));
					break;
				case 'year':
					cur_data.year -= 1;
					tempData = setTitle(cur_data);
					tempData.year -= 1;
					zp[cur].initModule(jqueryMap.$flickPanel.eq(page), tempData);
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
				default:
					throw 'onSwipe right error!';
			}
		}
		jqueryMap.$flickPanel.eq(page).css('top', 0);
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
		//if (!localStorage.first && JSON.parse(localStorage.first)) {
		//	introApp();
		//}
	};
	onSearchDate = function () {
		zp.modal.configModule({set_cur_anchor: setCurAnchor});
		zp.modal.initModule(jqueryMap.$modal, 'search').show();
		initPosition();
	};
	onSubmit = function (e, data) {
		e.preventDefault();
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
		var anchorMapRevise = copyAnchorMap(),
			boolReturn = true,
			keyName, keyNameDep;
		for (keyName in arg_map) {
			if (arg_map.hasOwnProperty(keyName)) {
				if (keyName.indexOf('_') === 0) {
					continue;
				}
				anchorMapRevise[keyName] = arg_map[keyName];
				if (arg_map[keyName] === undefined) {
					delete arg_map[keyName];
					delete anchorMapRevise[keyName];
				}
				keyNameDep = '_' + keyName;
				if (arg_map[keyNameDep]) {
					anchorMapRevise[keyNameDep] = arg_map[keyNameDep];
				} else {
					delete anchorMapRevise[keyNameDep];
					delete anchorMapRevise['_s' + keyNameDep];
				}
			}
		}
		try {
			$.uriAnchor.setAnchor(anchorMapRevise);
		} catch (err) {
			console.warn('changeanchorpart', err);
			$.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
			boolReturn = false;
		}
		return boolReturn;
	};
	setCurAnchor = function (status, date) {
		var argMap = {
			current: status,
			date: date
		};
		return changeAnchorPart(argMap);
	};
	onHashchange = function () {
		var
			anchorMapPrevious = copyAnchorMap(),
			anchorMapProposed, currentStringPrevious, currentStringProposed, current,
			dateStringPrevious, dateStringProposed,
			data = {};
		console.info(
			new Date().getHours(), new Date().getMinutes(),
			new Date().getSeconds(), '해시 변경.'
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
		/** @namespace anchorMapPrevious._s_date */
		dateStringPrevious = anchorMapPrevious._s_date;
		dateStringProposed = anchorMapProposed._s_date;
		/** @namespace anchorMapPrevious._s_current */
		currentStringPrevious = anchorMapPrevious._s_current;
		currentStringProposed = anchorMapProposed._s_current;
		if (!Object.keys(anchorMapPrevious).length ||
			currentStringPrevious !== currentStringProposed ||
			dateStringPrevious !== dateStringProposed) {
			current = anchorMapProposed.current;
			switch (current) {
				case 'year':
					if (stateMap.act === 'reload') {
						if (dateStringProposed) {
							data.year = stateMap.date_info.year =
								parseInt(dateStringProposed.substr(0, 4), 10);
						}
						initMain('year', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'month':
					if (stateMap.act === 'reload') {
						if (dateStringProposed) {
							data.year = stateMap.date_info.year =
								parseInt(dateStringProposed.substr(0, 4), 10);
							data.month = stateMap.date_info.month =
								parseInt(dateStringProposed.substr(4, 2), 10);
						}
						initMain('month', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'week':
					if (stateMap.act === 'reload') {
						if (dateStringProposed) {
							data.year = stateMap.date_info.year =
								parseInt(dateStringProposed.substr(0, 4), 10);
							data.week = stateMap.date_info.week =
								parseInt(dateStringProposed.substr(4, 2), 10);
						}
						initMain('week', data);
					} else {
						stateMap.act = 'reload';
					}
					break;
				case 'day':
					if (stateMap.act === 'reload') {
						if (dateStringProposed) {
							data.year = stateMap.date_info.year =
								parseInt(dateStringProposed.substr(0, 4), 10);
							data.month = stateMap.date_info.month =
								parseInt(dateStringProposed.substr(4, 2), 10);
							data.date = stateMap.date_info.date =
								parseInt(dateStringProposed.substr(6, 2), 10);
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
					zp.plan.initModule(jqueryMap.$flickPanel.eq(0));
					zp.dday.initModule(jqueryMap.$flickPanel.eq(1));
					zp.todo.initModule(jqueryMap.$flickPanel.eq(2));
					stateMap.current = 'plan';
					initPosition();
					setTitle();
					break;
				case 'todo':
					zp.todo.initModule(jqueryMap.$flickPanel.eq(0));
					zp.plan.initModule(jqueryMap.$flickPanel.eq(1));
					zp.dday.initModule(jqueryMap.$flickPanel.eq(2));
					stateMap.current = 'todo';
					initPosition();
					setTitle();
					break;
				case 'dday':
					zp.dday.initModule(jqueryMap.$flickPanel.eq(0));
					zp.todo.initModule(jqueryMap.$flickPanel.eq(1));
					zp.plan.initModule(jqueryMap.$flickPanel.eq(2));
					stateMap.current = 'dday';
					initPosition();
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
		jqueryMap.$flickPanel.eq(0).css('transform', 'translate3d(100%,0,0)');
		jqueryMap.$flickPanel.eq(1).css('transform', 'translate3d(200%,0,0)');
		jqueryMap.$flickPanel.eq(2).css('transform', 'translate3d(0%,0,0)');
		stateMap.fidx = 0;
		adjustHeight();
		console.log('init');
	};
	adjustHeight = function () {
		var $centerPanel = jqueryMap.$flickPanel.eq(stateMap.fidx);
		var centerHeight = $centerPanel.height();
		var minHeight = $(window).height() - jqueryMap.$header.height() - 1;
		jqueryMap.$flickPanel.css({minHeight: minHeight});
		if (centerHeight < minHeight) {
			centerHeight = minHeight;
			//$centerPanel.css({minHeight: minHeight});
		}
		console.log('adjust', $centerPanel, minHeight, centerHeight);
		jqueryMap.$flickView.css('height', centerHeight);
	};
	setPosition = function (direction) {
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
		if (direction === 'left') {
			setTimeout(function () {
				jqueryMap.$flickPanel.eq(lidx).css('transform', 'translate3d(0%,0,0)');
				jqueryMap.$flickCon.css({
					transform: 'translate3d(0,0,0)',
					webkitTransition: '0ms'
				});
				jqueryMap.$flickPanel.eq(cidx).css('transform', 'translate3d(100%,0,0)');
				jqueryMap.$flickPanel.eq(ridx).css('transform', 'translate3d(200%,0,0)');
			}, 300);
		} else if (direction === 'right') {
			setTimeout(function () {
				jqueryMap.$flickPanel.eq(ridx).css('transform', 'translate3d(200%,0,0)');
				jqueryMap.$flickCon.css({
					transform: 'translate3d(0,0,0)',
					webkitTransition: '0ms'
				});
				jqueryMap.$flickPanel.eq(cidx).css('transform', 'translate3d(100%,0,0)');
				jqueryMap.$flickPanel.eq(lidx).css('transform', 'translate3d(0%,0,0)');
			}, 300);
		}
	};
	getDirection = function (x, y) {
		var dir,
			standard = Math.abs(y / x) > 1;
		if (standard) { // 세로
			dir = 1;
		} else { // 가로
			dir = 0;
		}
		return dir;
	};
	onTouchstart = function (e) {
		stateMap.direction = undefined;
		stateMap.gap_x = 0;
		jqueryMap.$flickCon.css({webkitTransition: '0ms', transition: '0ms'});
		stateMap.touch_start_x = e.originalEvent.touches[0].clientX;
		stateMap.touch_x = e.originalEvent.touches[0].clientX;
		stateMap.touch_start_y = e.originalEvent.touches[0].clientY;
		stateMap.touch_y = e.originalEvent.touches[0].clientY;
		return true;
	};
	onTouchmove = function (e) {
		jqueryMap.$flickCon.css('pointer-events', 'none');
		stateMap.touch_x = e.originalEvent.touches[0].clientX;
		stateMap.touch_y = e.originalEvent.touches[0].clientY;
		stateMap.gap_x = stateMap.touch_x - stateMap.touch_start_x;
		stateMap.gap_y = stateMap.touch_y - stateMap.touch_start_y;
		stateMap.direction = stateMap.direction || getDirection(stateMap.gap_x, stateMap.gap_y);
		stateMap.state = 'drag';
		if (stateMap.direction === 0) { // 가로면
			jqueryMap.$flickCon.css({
				transform: 'translate3d(' + stateMap.gap_x + 'px,0,0)'
			});
			$('body').css({
				overflow: 'hidden'
			});
			e.preventDefault();
		} else { // 세로면
			stateMap.gap_x = 0;
		}
	};
	onTouchend = function () {
		var windowWidth = $(window).width();
		$('body').css({
			overflow: 'auto'
		});
		jqueryMap.$flickCon.css({
			'pointer-events': 'auto'
		});
		if (Math.abs(stateMap.gap_x) > windowWidth / 2.5) {
			if (stateMap.gap_x < 0) {
				jqueryMap.$flickCon.css({
					transform: 'translate3d(' + -windowWidth + 'px,0,0)',
					transition: '300ms'
				});
				stateMap.fidx++;
				onSwipe('left', stateMap.date_info);
			} else {
				jqueryMap.$flickCon.css({
					transform: 'translate3d(' + windowWidth + 'px,0,0)',
					transition: '300ms'
				});
				stateMap.fidx--;
				onSwipe('right', stateMap.date_info);
			}
		} else {
			jqueryMap.$flickCon.css({
				transform: 'translate3d(0,0,0)',
				transition: '300ms'
			});
		}
	};
	onError = function (errorMsg, url, lineNumber, column, errorObj) {
		if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
	};

	initModule = function ($container) {
		var
			online = localStorage.online ? JSON.parse(localStorage.online) :
				false,
			first = localStorage.first ? JSON.parse(localStorage.first) : false;
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
		$(window)
			.on('error', onError)
			.on('hashchange', onHashchange).trigger('hashchange')
			.on('orientationchange resize', adjustHeight);
		if (first) {
			introApp();
		}
		$.gevent.subscribe(jqueryMap.$user, 'login', onLoginSuccess);
		$.gevent.subscribe(jqueryMap.$container, 'submit', onSubmit);
		$.gevent.subscribe(jqueryMap.$main, 'day', initDay);
		$.gevent.subscribe(jqueryMap.$main, 'week', initWeek);
		$.gevent.subscribe(jqueryMap.$main, 'month', initMonth);
		$.gevent.subscribe(jqueryMap.$main, 'year', initYear);
		$.gevent.subscribe(jqueryMap.$modal, 'cell', onClickCell);
		$.gevent.subscribe(jqueryMap.$container, 'panelLoaded', adjustHeight);
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