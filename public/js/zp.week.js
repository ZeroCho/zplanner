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
			date_str;
		$container.load('/html/zp.week.html', function () {
			date_str = year + ('0' + week).slice(-2);
			console.log('week', date_str);
			setJqueryMap($container, date_str);
			insertDate(week, year);
			jqueryMap[date_str].$week.attr('data-week', date_str);
			jqueryMap[date_str].$thead.on('click', data, onClickDate);
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
			date_str;
		for (i; i < 7; i++) {
			date_str = list[i].month + '.' + list[i].date;
			jqueryMap[str].$thead.eq(i).text(date_str);
		}
		insertPlan(str);
		return true;
	};

	insertPlan = function (str) {
		var
			todo_obj, dday_obj, plan_obj, date_str, top,
			i, j, month, date, left, hour, min, $div, $tr,
			cyear = parseInt(str.substr(0, 4), 10),
			cweek = parseInt(str.substr(4, 2), 10),
			date_list = zp.calendar.getWeekDay(cweek, cyear),
			todo_list = localStorage.todo ? JSON.parse(localStorage.todo) : '',
			plan_list = localStorage.plan ? JSON.parse(localStorage.plan) : '',
			dday_list = localStorage.dday ? JSON.parse(localStorage.dday) : '';
		console.log(str, '일정을 삽입합니다.');
		if (dday_list) {
			for (i = 1; i < dday_list.length; i++) {
				dday_obj = dday_list[i];
				if (dday_obj) {
					for (j = 0; j < 7; j++) {
						month = ('0' + date_list[j].month).slice(-2);
						date = ('0' + date_list[j].date).slice(-2); 
						date_str = cyear + '-' + month + '-' + date;
						if (dday_obj.target === date_str) {
							$tr = jqueryMap[str].$info.children().eq(j);
							$div = $('<div/>').addClass('week-dday').text(dday_obj.text).appendTo($tr);
						}
					}
				}
			}
		}
		if (todo_list) {
			for (i = 1; i < todo_list.length; i++) {
				todo_obj = todo_list[i];
				if (todo_obj) {
					for (j = 0; j < 7; j++) {
		 				month = ('0' + date_list[j].month).slice(-2);
						date = ('0' + date_list[j].date).slice(-2); 
						date_str = cyear + '-' + month + '-' + date;
						if (todo_obj.date === date_str) {		
							hour = todo_obj.time.substr(0, 2);
							min = todo_obj.time.substr(3, 2);
							top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
							console.log('top', top);
							$div = $('<div/>').addClass('week-todo').attr('data-idx', i);
							 if (todo_obj.done) {
								$div.addClass('week-done');
							} else if (new Date(todo_obj.date).getTime() < new Date().getTime()) {
								$div.addClass('week-due');
							}
							left = 14.285714 * j + '%';
							$div.css({top: top, left: left}).append($('<div/>'))
								.find('div').addClass('input').text(todo_obj.text);
							$div.appendTo(jqueryMap[str].$week);
						}
					}					
				} 
			}	
		}
		if (plan_list) {
			var stime, etime, ctime, height, ehour, emin, etop;
			for (i = 1; i < plan_list.length; i++) {
				plan_obj = plan_list[i];
				if (plan_obj) {
	 				for (j = 0; j < 7; j++) {
		 				month = ('0' + date_list[j].month).slice(-2);
						date = ('0' + date_list[j].date).slice(-2); 
						date_str = cyear + '-' + month + '-' + date;
						stime = new Date(plan_obj.startdate).getTime();
						etime = new Date(plan_obj.enddate).getTime();
						ctime = new Date(date_str);
						if (stime <= ctime && ctime <= etime) {
							if (stime === ctime) {
								hour = plan_obj.starttime.substr(0, 2);
								min = plan_obj.starttime.substr(3, 2); 	
								top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
								if (ctime === etime) {
									ehour = plan_obj.endtime.substr(0, 2);
									emin = plan_obj.endtime.substr(3, 2);
									etop = ehour * configMap.tr_h + emin * configMap.tr_h / 60 + 61;
									height = etop - top;
								} else {
									height = configMap.tr_h * 24 - top;
								}								
								$div = $('<div/>').addClass('week-plan').attr('data-idx', i);
								left = 14.285714 * j + '%';
								$div.css({top: top, left: left, height: height}).append($('<div/>'))
									.find('div').addClass('input').text(plan_obj.text);
								$div.appendTo(jqueryMap[str].$week);
							} else if (stime < ctime && ctime < etime) {
								$tr = jqueryMap[str].$info.children().eq(j);
								$div = $('<div/>').addClass('week-whole').text(plan_obj.text).appendTo($tr);
							} else if (ctime === etime) {
								hour = plan_obj.endtime.substr(0, 2);
								min = plan_obj.endtime.substr(3, 2); 	
								top = 0;
								left = 14.285714 * j + '%' ;
								height = hour * configMap.tr_h + min * configMap.tr_h / 60 + 61;
								$div = $('<div/>').addClass('week-plan').attr('data-idx', i);
								$div.css({top: top, left: left, height: height}).append($('<div/>'))
									.find('div').addClass('input').text(plan_obj.text);
								$div.appendTo(jqueryMap[str].$week);					
							}
						}
					}
				} 
			}	
		}
		console.log('plan inserted');
		return true;
	};	

	onClickDate = function (e) {
		var
			text = $(this).text(),
			date = parseInt(text.split('.')[1], 10),
			month = parseInt(text.split('.')[0], 10),
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
		var date_str = data.year + ('0' + data.week).slice(-2);
		console.log('month initiated');
		stateMap.week_list[date_str] = new Week($container, data);

		return stateMap.week_list;
	};

	return {
		configModule: configModule,
		initModule: initModule
	};
}());