zp.dday = (function () {
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
			taphold: null
		},
		jqueryMap = {},
		setJqueryMap, showDday, configModule, initModule, onDelete, calculate,
		updateTime, updateText, holdTap, holdStop, applyTime, applyText;

	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$main: $container.find('.dday-main')
		};
	};

	calculate = function (target) {
		var
			today = new Date(),
			obj = zp.calendar.objectify(String(target)),
			dest = new Date(obj.year, obj.month - 1, obj.date),
			gap = dest.getTime() - today.getTime(),
			result
		;
		gap = Math.ceil(gap / 1000 / 60 / 60 / 24);
		if (gap > 0) {
			result = 'D-' + gap;
		} else if (gap === 0) {
			result = 'D-day';
		} else {
			result = 'D+' + Math.abs(gap);
		}
		return result;
	};

	showDday = function () {
		var
			$text, $div, $del, dday_obj, $target, $left, target, i,
			$frag = $(document.createDocumentFragment());
		zp.model.getDday();
		$.gevent.subscribe(jqueryMap.$main, 'getDday', function (e, dday_list) {
			e.preventDefault();
			if (dday_list.length) {
				jqueryMap.$main.html('');
				for (i = 0; i < dday_list.length; i++) {
					dday_obj = dday_list[i];
					if (dday_obj) {
						target = dday_obj.target;
						$div = $('<div/>').addClass('dday-item').attr('data-idx', i);
						$text = $('<div/>').addClass('dday-text').text(dday_obj.text);
						$target = $('<div/>').addClass('dday-target').text(target);
						$left = $('<div/>').addClass('dday-left').text(calculate(target));
						$del = $('<div/>').addClass('dday-del').html('<i class="fa fa-trash-o"></i>');
						$div.append($left).append($text).append($target).append($del);
						$frag.append($div);
					}
				}
				jqueryMap.$main.append($frag);
			}
		});
		jqueryMap.$main.html('<div style="text-align:center">기념일이나 D-day를 작성해주세요</div>');
		return true;
	};

	onDelete = function () {
		if (!confirm('삭제하시겠습니까?')) {
			return false;
		}
		var 
			$item = $(this).closest('.dday-item'),
			cidx = $item.data('idx'),
			change_map = localStorage.change ? JSON.parse(localStorage.change) : {c: [], u: [], d: []},
			dday_list = JSON.parse(localStorage.dday);
		delete dday_list[cidx];
		$item.remove();
		localStorage.dday = JSON.stringify(dday_list);
		change_map.d.push({cidx: cidx, type: 'dday'});
		localStorage.change = JSON.stringify(change_map);
		return true;
	};

	holdTap = function (e) { console.log('holdtap');
		e.stopImmediatePropagation();
		stateMap.taphold = setTimeout(function () {
			if (e.target.className === 'dday-text') {
				updateText(e.target);	
			} else if (e.target.className === 'dday-target') {
				updateTime(e.target);	
			}
		}, 1000);
		return false;
	};
	
	holdStop = function (e) { console.log('holdstop');
		e.stopPropagation();
		clearTimeout(stateMap.taphold);
		return false;
	};
	
	updateTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyTime);
	};
	
	updateText = function (target) {
		var text = $(target).text();
		$(target).empty().append('<input type="text" value="' + text + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: text
		}, applyText);
	};

	applyTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, dday_list, cidx, date;
		if (data.origin === update) {
			$target.empty().text(data.origin); 			
			return;	
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		dday_list = JSON.parse(localStorage.dday);
		cidx = $target.parent('.dday-item').data('idx');
		date = update.substr(0, 10);
		alert(cidx);
		dday_list[cidx].target = date;
		change_obj.u.push({
			cidx: cidx,
			type: 'dday'
		});
		localStorage.dday = JSON.stringify(dday_list);
		localStorage.change = JSON.stringify(change_obj); 		
	};
	
	applyText = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, dday_list, cidx;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		dday_list = JSON.parse(localStorage.dday);
		cidx = $target.parent('.dday-item').data('idx');
		alert(cidx);
		dday_list[cidx].text = update;
		change_obj.u.push({
			cidx: cidx,
			type: 'dday'
		});
		localStorage.dday = JSON.stringify(dday_list);
		localStorage.change = JSON.stringify(change_obj); 		
	};


	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};

	initModule = function ($container) {
		$container.load('/html/zp.dday.html', function () {
			stateMap.$container = $container;
			setJqueryMap($container);
			showDday();
			jqueryMap.$main.on('click', '.dday-del', onDelete);
			jqueryMap.$main.on('touchstart', '.dday-target, .dday-text', holdTap);
			jqueryMap.$main.on('touchend', '.dday-target, .dday-text', holdStop);
		});
		return $container;
	};

	return {
		configModule: configModule,
		initModule: initModule,
				calculate: calculate
	};
}());