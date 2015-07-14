zp.month = (function () {
	var
		configMap = {
			settable_map: {
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
				year: year
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
			todo_list, dday_list, plan_list, todo_obj, dday_obj, plan_obj,
			i, target, year, month, date, $td, idx, due, $obj,
			cyear = parseInt(str.substr(0, 4), 10),
			cmonth = parseInt(str.substr(4, 2), 10),
			start, smonth, sdate, end, emonth, stime, etime, gap, $cur;
		if (localStorage.plan) {
			plan_list = JSON.parse(localStorage.plan);
			for (i = 1; i < plan_list.length; i++) {
				plan_obj = plan_list[i];
				console.log(plan_obj);
				if (plan_obj) {
				start = plan_obj.startdate;
				stime = new Date(start).getTime();
				smonth = parseInt(start.substr(5,2), 10);
				sdate = start.substr(8,2);
				end = plan_obj.enddate;
				etime = new Date(end).getTime();
				emonth = parseInt(end.substr(5,2), 10);
				gap = (etime - stime) / 1000 / 60 / 60 / 24;
				if (smonth <= cmonth && emonth >= cmonth) {
					$td = jqueryMap[str].$month.find('td');
					$td.each(function () {
						if ($(this).find('div').eq(0).text() === sdate) {
							idx = $(this).index();
							$obj = $('<div/>').addClass('month-plan').text(plan_obj.text);
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
		}
		if (localStorage.dday) {
			dday_list = JSON.parse(localStorage.dday);
			for (i = 1; i < dday_list.length; i++) {
				dday_obj = dday_list[i];
				if (dday_obj) {
					target = dday_obj.target;
					year = parseInt(target.substr(0,4), 10);
					month = parseInt(target.substr(5,2), 10);
					date = target.substr(8,2);
					if (year === cyear && month === cmonth) {
						$td = jqueryMap[str].$month.find('td');
						$td.each(function () {
							if ($(this).find('div').eq(0).text() === date) {
								$obj = $('<div/>').addClass('month-dday').text(dday_obj.text);
								$(this).append($obj);	
							}
						});
					}
				}
			}	
		}
		if (localStorage.todo) {
			todo_list = JSON.parse(localStorage.todo);
			for (i = 1; i < todo_list.length; i++) {
				todo_obj = todo_list[i];
				if (todo_obj) {
				due = todo_obj.date;
				year = parseInt(due.substr(0,4), 10);
				month = parseInt(due.substr(5,2), 10);
				date = due.substr(8,2);
				if (year === cyear && month === cmonth) {
					$td = jqueryMap[str].$month.find('td');
					$td.each(function () {
						if ($(this).find('div').eq(0).text() === date) {
							$obj = $('<div/>').addClass('month-todo').text(todo_obj.text);
							if (todo_obj.done) {
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
		}
		console.log('plan inserted');
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
		var date_str = data.year + ('0' + data.month).slice(-2);
		console.log('month initiated');
		stateMap.month_list[date_str] = new Month($container, data);

		return $container;
	};

	return {
		configModule: configModule,
		initModule: initModule
	};
}());