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
		jqueryMap = {
			$container: $container
		};
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
			date_str;
		if (month < 10) { month = '0' + day.month; }
		if (date < 10) { date = '0' + day.date; }
		date_str = String() + year + month + date;
		console.log(day.date, '모듈을 로딩합니다.');
		$container.load('/html/zp.day.html', function () {
			console.log('모듈을 로딩했습니다.');
			setJqueryMap($container, date_str);
			insertSchedule(data, date_str);
			if (day.date === configMap.today.date &&
					day.month === configMap.today.month &&
					day.year === configMap.today.year) {
				addTimeIndicator(date_str);
				setInterval(addTimeIndicator(date_str), 60000);
			}
			jqueryMap[date_str].$ddayTable.attr('data-date', date_str);
			jqueryMap[date_str].$planTable.on('click', '.todo, .plan, .dday', onClickPlan);
 			jqueryMap[date_str].$planTable.on('click', 'td', data, onClickCell);
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
			$line, top, dday_offset,
			$indicator = $('.time-indicator');
		dday_offset = jqueryMap[str].$ddayTable.find('tr').length;
		top = (hour * configMap.tr_h) + (minute * configMap.tr_h / 60) + (dday_offset * 40);
		if ($indicator.length) {
			$indicator.remove();
		}
		$line = $('<div/>').addClass('time-indicator').css({top: top});
		jqueryMap[str].$container.prepend($line);
	};

	insertSchedule = function (data, str) {
		var
			date, month, stime, etime, ctime,
			todo_list, plan_list, dday_list, todo_obj, plan_obj, dday_obj,
			i = 1,
			date_str, $div, $tr, top, hour, min;
		month = ('0' + data.month).slice(-2);
		date = ('0' + data.date).slice(-2);
		date_str = data.year + '-' + month + '-' + date;
		todo_list = localStorage.todo ? JSON.parse(localStorage.todo) : '';
		plan_list = localStorage.plan ? JSON.parse(localStorage.plan) : '';
		dday_list = localStorage.dday ? JSON.parse(localStorage.dday) : '';
		console.log(str, '일정을 삽입합니다.');
		if (dday_list) {
			for (i; i < dday_list.length; i++) {
				dday_obj = dday_list[i];
				if (dday_obj && dday_obj.target === date_str) {
					$tr = $('<tr/>').attr('data-idx', i).append('<td/>');
					$tr.find('td').addClass('dday').text(dday_obj.text);
					$tr.prependTo(jqueryMap[str].$ddayTable);
				}
			}
		}
		if (todo_list) {
			for (i = 1; i < todo_list.length; i++) {
				todo_obj = todo_list[i];
				if (todo_obj && todo_obj.date === date_str) {
					hour = todo_obj.time.substr(0, 2);
					min = todo_obj.time.substr(3, 2);
					top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
					$div = $('<div/>').addClass('todo').attr('data-idx', i);
					$div.css({top: top}).append($('<div/>'))
						.find('div').addClass('input').text(todo_obj.text);
					$div.appendTo(jqueryMap[str].$planTable);
				} 
			}	
		}
		if (plan_list) {
			for (i = 1; i < plan_list.length; i++) {
				plan_obj = plan_list[i];
				if (plan_obj) {
					stime = new Date(plan_obj.startdate).getTime();
					etime = new Date(plan_obj.enddate).getTime();
					ctime = new Date(date_str).getTime();
					if (plan_obj.startdate === date_str) {
						hour = plan_obj.starttime.substr(0, 2);
						min = plan_obj.starttime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-idx', i);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(plan_obj.text + ' 시작');
						$div.appendTo(jqueryMap[str].$planTable);
					} else if (stime < ctime && ctime < etime) {
						$tr = $('<tr/>').attr('data-idx', i).append('<td/>');
						$tr.find('td').addClass('whole').text(plan_obj.text);
						$tr.prependTo(jqueryMap[str].$ddayTable);
					} else if (plan_obj.enddate === date_str) {
					 	hour = plan_obj.endtime.substr(0, 2);
						min = plan_obj.endtime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-idx', i);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(plan_obj.text + '끝');
						$div.appendTo(jqueryMap[str].$planTable);
					}
				} 
			}	
		}
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