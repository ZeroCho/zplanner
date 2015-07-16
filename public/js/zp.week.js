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