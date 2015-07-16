zp.calendar = (function () {
	'use strict';
	var
		configMap = {
			main_html: String()
				+ '<table class="calendar-table">'
					+ '<caption class="calendar-caption"></caption>'
					+ '<thead>'
						+ '<tr>'
							+ '<th>주</th>'
							+ '<th>일</th>'
							+ '<th>월</th>'
							+ '<th>화</th>'
							+ '<th>수</th>'
							+ '<th>목</th>'
							+ '<th>금</th>'
							+ '<th>토</th>'
						+ '</tr>'
					+ '</thead>'
					+ '<tbody>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
						+ '<tr><th></th><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
					+ '</tbody>'
				+ '</table>'
			,
			day_list: ['일', '월', '화', '수', '목', '금', '토']
		},
		stateMap = {
			$container: null
		},
		jqueryMap = {},
		initModule, setJqueryMap, setHoliday,
		setCalendar, getWeekNum, daysInMonth, dayOfYear,
		objectify, stringify, getWeekDay, lunarSolar,
		getPrevDate, getNextDate, getNextString, getPrevString, dayOfWeek;

	setJqueryMap = function ($container) {
		var i = 0;
		jqueryMap = {
			$container: $container,
			$table: $container.find('table'),
			$caption: $container.find('caption')
		};
		for (i; i <= 6; i++) {
			jqueryMap['$tr' + i] = $container.find('tr:eq(' + i + ')');
		}
	};

	initModule = function ($container, data) {
		var
			month = data.month,
			year = data.year;
		stateMap.$container = $container;

		$container.html(configMap.main_html);
		setJqueryMap($container);
		setCalendar(month, year);
	};


	setCalendar = function (month, year) {
		month = parseInt(month, 10);
		year = parseInt(year, 10);
		var
			date = new Date(),
			date_idx = 1, j = 2,
			first_day, last_date, i, num_week, $td,
			today = new Date();

		// 날짜를 1일로 맞춘다
		date.setYear(year);
		date.setMonth(month - 1);
		date.setDate(1);
		first_day = date.getDay();

		// 날짜를 마지막 날짜로 맞춘다
		date.setMonth(month);
		date.setDate(date.getDate() - 1);
		last_date = date.getDate();

		jqueryMap.$caption.html(month + '월');
		num_week = getWeekNum(date_idx, month, year);

		for (i = first_day; i < 7; i++) {
			jqueryMap.$tr1.find('th').html(num_week + '주');
			jqueryMap.$tr1.find('td').eq(i).append('<div>' + date_idx + '</div>');
			date_idx++;
		}
		num_week++;

		while (date_idx <= last_date - 7) {
			for (i = 0; i < 7; i++) {
				jqueryMap['$tr' + String(j)].find('th').html(num_week + '주');
				jqueryMap['$tr' + String(j)].find('td').eq(i).append('<div>' + date_idx + '</div>');
				date_idx++;
			}
			j++;
			num_week++;
		}

		for (i = 0; date_idx <= last_date; i++) {
			jqueryMap['$tr' + String(j)].find('th').html(num_week + '주');
			jqueryMap['$tr' + String(j)].find('td').eq(i).append('<div>' + date_idx + '</div>');
			date_idx++;
		}

		// 날짜가 없는 줄 제거
		switch (j) {
			case 4:
				jqueryMap.$tr5.addClass('hidden');
				jqueryMap.$tr6.addClass('hidden');
				break;
			case 5:
				jqueryMap.$tr6.addClass('hidden');
				break;
			default:
				break;
		}
		// 오늘 날짜 표시
		if ((year === today.getFullYear()) && (month === today.getMonth() + 1)) {
			$td = jqueryMap.$table.find('td');
			$td.each(function() {
				if (parseInt($(this).find('div').eq(0).html(), 10) === today.getDate()) {
					$(this).addClass('td-today');
				}
			});
		}
		setHoliday(month, year);
	};

	setHoliday = function (month, year) {
		var $td = jqueryMap.$table.find('td'),
			newYear = lunarSolar(year + '0101', 'ltos'),
			buddha = lunarSolar(year + '0408', 'ltos'),
			thanksGiving = lunarSolar(year + '0815', 'ltos'),
			today;

		if (month === newYear.month) { // 설
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (
					today === newYear.day ||
					today === newYear.day - 1 ||
					today === newYear.day + 1
				) {
					$(this).css('color', 'red');
				}
			});
		}
		else if (month === buddha.month) { // 석가탄신일
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (today === buddha.day) {
					$(this).css('color', 'red');
				}
			});
		}
		else if (month === thanksGiving.month) { // 추석
			$td.each(function() {
				today = parseInt($(this).text(), 10);
				if (
					today === thanksGiving.day ||
					today === thanksGiving.day - 1 ||
					today === thanksGiving.day + 1
				) {
					$(this).css('color', 'red');
				}
			});
		}
		switch (month) {
			case 1:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 1) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 3:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 1) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 5:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 5) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 6:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 6) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 8:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 15) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 10:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 3 || parseInt($(this).text(), 10) === 9) {
						$(this).css('color', 'red');
					}
				});
				break;
			case 12:
				$td.each(function() {
					if (parseInt($(this).text(), 10) === 25) {
						$(this).css('color', 'red');
					}
				});
				break;
			default:
				break;
		}
		return true;
	};

	// 공통 calendar 함수 모음
	lunarSolar = function (input_day, direction) {
		if (direction !== 'ltos' && direction !== 'stol') {
			return false;
		}
		// 음력 데이터 (평달 - 작은달 :1,  큰달:2 )
		// (윤달이 있는 달 - 평달이 작고 윤달도 작으면 :3 , 평달이 작고 윤달이 크면 : 4)
		// (윤달이 있는 달 - 평달이 크고 윤달이 작으면 :5,  평달과 윤달이 모두 크면 : 6)
		var
			kk = [
				[1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],   /* 1841 */
				[2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2],   /* 1851 */
				[2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1861 */
				[2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1871 */
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],   /* 1881 */
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
				[1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
				[2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
				[1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
				[1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
				[1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
				[2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
				[2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
				[2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
				[2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
				[1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
				[1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
				[1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
				[2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
				[2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
				[2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
				[1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
				[1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
				[2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
				[2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
				[2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
				[2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
				[1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2],
				[1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
				[2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
				[2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
				[2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
				[1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
				[2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
				[1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
				[2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
				[1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
				[1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
				[2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
				[1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
				[2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
				[2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
				[2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2],
				[2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
				[2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
				[2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
				[2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
				[2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
				[1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
				[1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]
			],
			md = [31,0,31,30,31,30,31,31,30,31,30,31],
			year = input_day.substring(0,4),
			month = input_day.substring(4,6),
			day = input_day.substring(6,8),
			lyear, lmonth, lday, leapyes, syear, smonth, sday,
			mm, y1, y2, m1, m2, i, j, td, ly, lm, ld, sy, sy1, sm, sd, td1, td2,
			dt = [203];
		if ( direction === 'stol') { // 양력을 음력으로 변환
			// 기준일자 양력 1841 년 1 월 23 일 (음력 1840 년 1 월 1 일) 계산
			td1 = (1840 * 365) + (1840 / 4) - (1840 / 100) + (1840 / 400) + 23;
			sy = year;          // 년도 check
			sm = month;         // 월 check
			md[1] = daysInMonth(2, sy);           // 윤년 check
			sd = day || md[sm-1];    // 일수 check
			sy1 = sy - 1;
			td2 = sy1 * 365 + sy1 / 4 - sy1 / 100 + sy1 / 400 + parseInt(sd, 10);
			for (i = 0; i < sm - 1; i++) {
				td2 = td2 + md[i];
			}
			td =  td2 - td1 + 1;
			for (i = 0; i <= sy - 1841; i++) {
			   	dt[i] =0;
				for(j = 0; j < 12; j++) {
					switch(kk[i][j]) {
					    case 1 :
						    mm=29;
						    break;
					    case 2 :
						    mm=30;
						    break;
					    case 3 :
						    mm=58;     // 29+29
							break;
					    case 4 :
							mm=59;     // 29+30
							break;
					    case 5 :
						    mm=59;     // 30+29
						    break;
						case 6 :
						    mm=60;     // 30+30
						    break;
					}
					dt[i] = dt[i] + mm;
				}
			}
			ly =0 ;
			while (true) {
				if (td > dt[ly] ) {
					td = td - dt[ly];
					ly = ly + 1;
				}
				else {
					break;
				}
			}
			lm=0;
			while (true) {
				if (kk[ly][lm] <= 2) {
					mm = kk[ly][lm] +28;
					if (td > mm) {
						td = td - mm;
						lm = lm +1;
					}
					else {
						break;
					}
				}
				else {
					switch (kk[ly][lm]) {
						case 3:
							m1 = 29;
							m2 = 29;
							break;
						case 4:
							m1 = 29;
							m2 = 30;
							break;
						case 5:
							m1 = 30;
							m2 = 29;
							break;
						case 6:
							m1 = 30;
							m2 = 30;
							break;
					}
					if (td > m1) {
						td = td - m1;
						if (td > m2) {
							td = td - m2;
							lm = lm + 1;
						}
						else {
							break;
						}
					}
					else {
					    break;
					}
				}
			}
			ly = ly + 1841;
			lm = lm + 1;
			ld = td;

			return {
				year: ly,
				month: lm,
				day: ld
			};
		}
		if ( direction === 'ltos' ) {
			// 음력에서 양력으로 변환
			lyear = year;        // 년도 check
			lmonth = month;     // 월 check
			y1 = lyear - 1841;
			m1 = lmonth - 1;
			leapyes = 0;
			if (kk[y1][m1] > 2)  {
				switch (kk[y1][m1]) {
					case 1:
					case 3:
					case 4:
						mm = 29;
						break;
					case 2:
					case 5:
					case 6:
						mm = 30;
						break;
				}
			}

			lday = day;

			td = 0;
			for (i = 0; i < y1; i++) {
				for (j = 0; j < 12; j++) {
					switch (kk[i][j]) {
					   	case 1:
							td = td + 29;
							break;
					   	case 2:
							td = td + 30;
							break;
					   	case 3:
							td = td + 58;    // 29+29
							break;
					  	case 4:
							td = td + 59;    // 29+30
							break;
					   	case 5:
							td = td + 59;    // 30+29
							break;
					   	case 6:
							td = td + 60;    // 30+30
							break;
				   	}
				}
			}
			for (j=0; j < m1; j++) {
				switch (kk[y1][j]) {
					case 1:
						td = td + 29;
						break;
					case 2:
						td = td + 30;
						break;
					case 3:
						td = td + 58;    // 29+29
						break;
					case 4:
						td = td + 59;    // 29+30
						break;
					case 5:
						td = td + 59;    // 30+29
						break;
					case 6:
						td = td + 60;    // 30+30
						break;
				}
			}
			if (leapyes === 1) {
				switch(kk[y1][m1]) {
					case 3:
					case 4:
						td = td + 29;
						break;
					case 5:
					case 6:
						td = td + 30;
						break;
				}
			}
			td =  td + parseFloat(lday) + 22;
			// td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
			y1 = 1840;
			while (true) {
				y1 = y1 +1;
				if  ((y1 % 400 === 0) || ((y1 % 100 !== 0) && (y1 % 4 === 0))) {
					y2 = 366;
				}
				else {
					y2 = 365;
				}
				if (td <= y2) {
					break;
				}
				td = td- y2;
			}
			syear = y1;
			md[1] = parseInt(y2, 10) -337;
			m1 = 0;
			while (true) {
				m1= m1 + 1;
				if (td <= md[m1-1]) {
					break;
				}
				td = td - md[m1-1];
			}
			smonth = parseInt(m1, 10);
			sday = parseInt(td, 10);

			return {
				year: syear,
				month: smonth,
				day: sday
			};
		}
	};

	getNextDate = function (data, interval) {
		var date, obj;
		if (!interval) {interval = 1;}
		date = new Date(data.year, data.month - 1, parseInt(data.date,10) + interval);
		obj = {
			date: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};
		obj.week = getWeekNum(obj.date, obj.month, obj.year);
		obj.day = new Date(obj.year, obj.month - 1, obj.date).getDay();
		return obj;
	};
	getPrevDate = function (data, interval) {
		var date, obj;
		if (!interval) {interval = 1;}
		date = new Date(data.year, data.month - 1, data.date - interval);
		obj = {
			date: date.getDate(),
			month: date.getMonth() + 1,
			year: date.getFullYear()
		};
		obj.week = getWeekNum(obj.date, obj.month, obj.year);
		obj.day = new Date(obj.year, obj.month - 1, obj.date).getDay();
		return obj;
	};

	getPrevString = function (str, interval) {
		if (!interval) {interval = 1;}
		var obj = getPrevDate(str, interval);
		return stringify(obj);
	};

	getNextString = function (str, interval) {
		if (!interval) {interval = 1;}
		var obj = getNextDate(str, interval);
		return stringify(obj);
	};

	stringify = function (data, delimiter) {
		var string = '',
			date = data.date,
			month = data.month,
			year = data.year,
			week;
		if (!delimiter) {delimiter = '';}
		string += year;
		if (data.week) {
			week = data.week;
			string = string + delimiter + week;
		} else if (month) {
			if (month < 10) {string += 0;}
			string = string + delimiter + month;
		}
		if (date) {
			if (date < 10 ) {string += 0;}
			string = string + delimiter +date;
		}
		return string;
	};

	objectify = function (str) {
		if (typeof str !== 'string') {
			console.warn('인자는 문자열이어야 합니다.');
			return false;
		}
		var obj, year, month, date;
		if (str.length === 8) {
			year = str.substr(0, 4);
			month = str.substr(4, 2);
			date = str.substr(6, 2);
		} else if (str.length === 10) {
			year = str.substr(0,4);
			month = str.substr(5,2);
			date = str.substr(8,2);
		}
		obj = {
			year: parseInt(year, 10),
			month: parseInt(month, 10),
			date: parseInt(date, 10),
			week: getWeekNum(year, month, date)
		};
		return obj;
	};

	dayOfWeek = function (date, month, year) {
		if (!year) {year = new Date().getFullYear();}
		var day = new Date(year, month - 1, date).getDay();
		return configMap.day_list[day];
	};

	dayOfYear = function (date, month, year) {
		var
			daysList = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			i = 0,
            total = 0;
		if (!year) {year = new Date().getFullYear();}
		if (daysInMonth(2, year) === 29) {daysList[1] = 29;}
		// 인자로 년월일을 입력했을 경우
		if (month) {
			// 전달까지의 날짜를 다 더한다
			while (i < month - 1) {
				total += daysList[i];
				i++;
			}
			total += date;
			return total;
		}
		// 인자로 0~366 사이의 숫자를 입력했을 경우
		while (date > 0) {
			date -= daysList[i];
			i++;
		}
		month = i;
		date += daysList[i - 1];
		return {
			month: month,
			date: date,
			year: year
		};
	};

	daysInMonth = function (month, year) {
		if (!year) {
			year = new Date().getFullYear();
		}
		return new Date(year, month, 0).getDate();
	};

	// 해당주의 날짜들을 배열로 돌려주는 함수
	getWeekDay = function (week, year) {
		var
			i = 0,
			firstDay = new Date(year, 0, 1).getDay(),
			list = [],
			days, result;
		if (!year) {
			year = new Date().getFullYear();
		}
		days = week * 7 - firstDay - 6;
		for (i; i < 7; i++) {
			result = dayOfYear(days);
			list[i] = {
				month: result.month,
				date: result.date
			};
			days++;
		}
		return list;
	};

	// 해당일이 그 해의 몇 번째 주인지 찾는 함수
	// 인자: date, month[, year] 또는 dateString
	getWeekNum = function (date, month, year) {
		var
			firstDay = new Date(year, 0, 1).getDay(),
			dayOfToday = new Date(year, month - 1, date).getDay(),
			offset = 6 - dayOfToday,
			weekNum, total;
		if (!year) {
			year = new Date().getFullYear();
		}
		total = dayOfYear(date, month, year) + firstDay + offset;
		weekNum = Math.floor(total / 7);

		// 각 달의 1일이 금, 토면 그 주는 전달 마지막 주로 친다.
		if (firstDay > 4) {
			weekNum -= 1;
		}
		return weekNum;
	};

	return {
		initModule: initModule,
		getWeekNum: getWeekNum,
		dayOfYear: dayOfYear,
		getWeekDay: getWeekDay,
		daysInMonth: daysInMonth,
		dayOfWeek: dayOfWeek,
		stringify: stringify,
		objectify: objectify,
		lunarSolar: lunarSolar,
		getPrevDate: getPrevDate,
		getNextDate: getNextDate,
		getPrevString: getPrevString,
		getNextString: getNextString
	};
}());