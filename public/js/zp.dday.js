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
			$main: $container.find('#dday-main')
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
			$text, $div, $del, ddayMap, $target, $left, $option, target, i, spinner,
			$frag = $(document.createDocumentFragment()),
			result = zp.model.getDday();
		result.done(function (dday_list) {
			$(spinner.el).remove();
			if (dday_list.length) {
				jqueryMap.$main.html('');
				for (i = 0; i < dday_list.length; i++) {
					ddayMap = dday_list[i];
					if (ddayMap) {
						target = ddayMap.target;
						$div = $('<div/>').addClass('dday-item').attr('data-id', ddayMap._id);
						$text = $('<div/>').addClass('dday-text').text(ddayMap.text);
						$target = $('<div/>').addClass('dday-target').text(target);
						$left = $('<div/>').addClass('dday-left').text(calculate(target));
						$del = $('<div/>').addClass('item-del').html('<i class="fa fa-trash-o"></i>');
						$option = $('<div/>').addClass('dday-option').append($del);
						$div.append($left).append($text).append($target).append($option);
						$frag.append($div);
					}
				}
				jqueryMap.$main.append($frag);
			}
		});
		result.fail(function (err) {
			$(spinner.el).remove();
			if (err === 'not_found') {
				jqueryMap.$main.html('<div class="no-content">기념일이나 D-day를 작성해주세요</div>');
			} else {
				alert(err);
			}
		});
		spinner = new Spinner().spin();
		jqueryMap.$main.append(spinner.el);
		return true;
	};
	onDelete = function () {
		var
			$item = $(this).closest('.dday-item'),
			id = $item.data('id'), result;
		if (!confirm('삭제하시겠습니까?')) {
			return false;
		}
		result = zp.model.deleteItem(id);
		result.done(function () {
			$item.remove();
		});
		result.fail(function () {
			alert('오류 발생');
		});
		return true;
	};
	holdTap = function (e) {
		console.log('holdtap');
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
	holdStop = function (e) {
		console.log('holdstop');
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
			id, date;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		id = $target.parent('.dday-item').data('id');
		date = update.substr(0, 10);
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
		cidx = $target.parent('.dday-item').data('id');
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
		$container.html($('#zp-dday').html());
		stateMap.$container = $container;
		setJqueryMap($container);
		showDday();
		jqueryMap.$main.on('click', '.item-del', onDelete);
		jqueryMap.$main.on('touchstart', '.dday-target, .dday-text', holdTap);
		jqueryMap.$main.on('touchend', '.dday-target, .dday-text', holdStop);
		return $container;
	};
	return {
		configModule: configModule,
		initModule: initModule,
		calculate: calculate
	};
}());