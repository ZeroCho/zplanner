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