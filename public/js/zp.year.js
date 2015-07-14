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
			$container: null,
			year_list: []
		},
		jqueryMap = {},
		initModule, setJqueryMap, configModule, insertCalendar, onClickTable, Year;

	Year = function ($container, data) {
		$container.load('/html/zp.year.html', function () {
			console.log(data.year);
			setJqueryMap($container, data.year);
			insertCalendar(data.year);
			jqueryMap[data.year].$calendar.on('click', data, onClickTable);
		});
	};

	insertCalendar = function (year) {
		var
			$container, i = 0,
			option = {
				year: year
			};
		for (i; i < 12; i++) {
			$container = jqueryMap[year].$calendar.eq(i);
			option.month = parseInt($container.data('month'), 10);
			zp.calendar.initModule($container, option);
		}
	};

	setJqueryMap = function ($container, str) {
		jqueryMap.$container = $container;
		jqueryMap[str] = {
			$calendar: $container.find('.year-calendar')
		};
	};
	
	onClickTable = function (e) {
		var
			month = $(this).data('month'),
			year = e.data.year,
			data = {
				month: month,
				year: year
			};
		$.gevent.publish('month', [data]);
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
		stateMap.$container = $container;
		stateMap.year_list[data.year] = new Year($container, data);
	};
		
	return {
		configModule: configModule,
		initModule: initModule
	};
}());