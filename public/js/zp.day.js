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
			dayList: [],
			dayMap: {},
			update: false,
			load_state: 0
		},
		jqueryMap = {},
		configModule, initModule, loadCache, Day;
	Day = function ($container, data, dateStr) {
		this.date = parseInt(data.date, 10);
		this.month = parseInt(data.month, 10);
		this.year = parseInt(data.year, 10);
		this.dateStr = dateStr;
		this.loadState = 0;
		this.initiate($container, data);
	};
	Day.prototype.initiate = function ($container, data) {
		$container.html($('#zp-day').html());
		this.setJqueryMap($container, this.dateStr);
		this.insertSchedule(data, this.dateStr);
		jqueryMap[this.dateStr].$ddayTable.attr('data-date', this.dateStr);
		jqueryMap[this.dateStr].$planTable.on('click', '.todo, .plan, .dday', this.onClickPlan);
		jqueryMap[this.dateStr].$planTable.on('click', 'td', data, this.onClickCell);
		console.log(this);
		console.info(this.dateStr, 'object loaded.');
	};
	Day.prototype.setJqueryMap = function ($container, dateStr) {
		jqueryMap[dateStr] = {
			$container: $container,
			$ddayTable: $container.find('.dday-table'),
			$planTable: $container.find('.plan-table')
		};
	};
	Day.prototype.checkLoadState = function () {
		this.loadState++;
		console.log(this.loadState);
		if (this.loadState === 4) {
			$.gevent.publish('panelLoaded');
			this.loadState = 0;
			stateMap.dayList.push(this.dateStr);
			stateMap.dayMap[this.dateStr] = jqueryMap[this.dateStr];
			if (stateMap.dayList.length > 10) {
				delete stateMap.dayMap[stateMap.dayList.shift()];
			}
		}
	};
	Day.prototype.addTimeIndicator = function (str) {
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
	Day.prototype.insertSchedule = function (data, str) {
		var
			date, month, stime, etime, ctime, startTime, endTime, time,
			todoMap, planMap, ddayMap, datelessResult,
			i, todoResult, planResult, ddayResult,
			dateStr, $div, $tr, top, hour, min,
			$frag = $(document.createDocumentFragment()),
			self = this;
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
				if (ddayMap) {
					$tr = $('<tr/>').attr('data-id', ddayMap._id).append('<td/>');
					$tr.find('td').addClass('dday').text(ddayMap.text);
					$tr.prependTo($frag);
				}
			}
			$frag.appendTo(jqueryMap[str].$ddayTable);
		});
		ddayResult.fail(function (err) {
			if (err !== 'not_found') {
				console.warn(err);
			}
		});
		ddayResult.always(function () {
			self.checkLoadState();
		});
		todoResult.done(function (todoList) {
			for (i = 0; i < todoList.length; i++) {
				todoMap = todoList[i];
				if (todoMap) {
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
			if (err !== 'not_found') {
				console.warn(err);
			}
		});
		todoResult.always(function () {
			self.checkLoadState();
		});
		planResult.done(function (planList) {
			for (i = 0; i < planList.length; i++) {
				planMap = planList[i];
				if (planMap) {
					stime = new Date(planMap.startdate).getTime();
					etime = new Date(planMap.enddate).getTime();
					ctime = new Date(dateStr).getTime();
					console.log(planMap, stime, etime, ctime, planMap.startdate, dateStr);
					if (planMap.startdate === dateStr) {
						console.log('startday');
						hour = planMap.starttime.substr(0, 2);
						min = planMap.starttime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-id', planMap._id);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(planMap.text + ' 시작');
						$div.appendTo(jqueryMap[str].$planTable);
					} else if (stime < ctime && ctime < etime) {
						console.log('between');
						$tr = $('<tr/>').attr('data-id', planMap._id).append('<td/>');
						$tr.find('td').addClass('whole').text(planMap.text);
						$tr.prependTo(jqueryMap[str].$ddayTable);
					} else if (planMap.enddate === dateStr) {
						console.log('endday');
						hour = planMap.endtime.substr(0, 2);
						min = planMap.endtime.substr(3, 2);
						top = hour * configMap.tr_h + min * configMap.tr_h / 60 + 1;
						$div = $('<div/>').addClass('plan').attr('data-id', planMap._id);
						$div.css({top: top}).append($('<div/>'))
							.find('div').addClass('input').text(planMap.text + '끝');
						$div.appendTo($frag);
					}
				}
			}
			$frag.appendTo(jqueryMap[str].$planTable);
		});
		planResult.fail(function (err) {
			if (err !== 'not_found') {
				console.warn(err);
			}
		});
		planResult.always(function () {
			self.checkLoadState();
		});
		if (dateStr === configMap.today.year + '-' + ('0' + configMap.today.month).slice(-2) + '-' +
			('0' + configMap.today.date).slice(-2)) {
			datelessResult = zp.model.getTodo('dateless');
			datelessResult.done(function (todoList) {
				for (i = 0; i < todoList.length; i++) {
					todoMap = todoList[i];
					if (todoMap) {
						$tr = $('<tr/>').attr('data-id', todoMap._id).append('<td/>');
						$tr.find('td').addClass('dateless').text(todoMap.text);
						$tr.prependTo($frag);
					}
				}
				$frag.appendTo(jqueryMap[str].$ddayTable);
				setInterval(self.addTimeIndicator(str), 60000);
			});
			datelessResult.fail(function (err) {
				if (err !== 'not_found') {
					console.warn(err);
				}
			});
			datelessResult.always(function () {
				self.checkLoadState();
			});
		} else {
			self.checkLoadState();
		}
		return true;
	};
	Day.prototype.onClickCell = function (e) {
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
	Day.prototype.onClickPlan = function () {
		var c = $(this).attr('class');
		if (c === 'whole') {
			c = 'plan';
		}
		$.gevent.publish('submit', [c]);
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
		var dateStr = data.year + ('0' + data.month).slice(-2) + ('0' + data.date).slice(-2);
		// TODO: cache 구현
		//if (stateMap.dayMap[dateStr]){
		//	$container.replaceWith(stateMap.dayMap[dateStr].$container);
		//} else {
		console.log(stateMap.dayMap);
		return new Day($container, data, dateStr);
	};
	return {
		configModule: configModule,
		initModule: initModule
	};
}());