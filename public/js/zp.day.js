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