zp.year = (function () {
	'use strict';
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			yearMap: {},
			yearList: []
		},
		jqueryMap = {},
		initModule, configModule, Year, loadCache;
	Year = function ($container, data) {
		this.year = data.year;
		this.initiate($container);
	};
	Year.prototype.initiate = function ($container) {
		$container.html($('#zp-year').html());
		this.setJqueryMap($container, this.year);
		this.insertCalendar(this.year);
		jqueryMap[this.year].$calendar.on('click', this.year, this.onClickTable);
	};
	Year.prototype.insertCalendar = function (year) {
		var
			$container,
			i = 0,
			option = {
				year: year
			};
		for (i; i < 12; i++) {
			$container = jqueryMap[year].$calendar.eq(i);
			option.month = parseInt($container.data('month'), 10);
			zp.calendar.initModule($container, option);
		}
		stateMap.yearList.push(year);
		stateMap.yearMap[year] = jqueryMap[year].$container;
	};
	Year.prototype.setJqueryMap = function ($container, str) {
		jqueryMap[str] = {
			$calendar: $container.find('.year-calendar')
		};
	};
	Year.prototype.onClickTable = function (e) {
		var
			month = $(this).data('month'),
			year = e.data,
			data = {
				month: month,
				year: year
			};
		$.gevent.publish('month', [data]);
	};
	loadCache = function () {
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};
	initModule = function ($container, data) {
		data.year = parseInt(data.year, 10);
		if (stateMap.yearList[data.year]) {
			alert('already here!');
			$container.replaceWith(stateMap.yearMap[data.year].$container);
		} else {
			return new Year($container, data);
		}
	};
	return {
		configModule: configModule,
		initModule: initModule
	};
}());