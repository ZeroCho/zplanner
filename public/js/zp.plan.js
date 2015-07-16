zp.plan = (function () {
	var
		configMap = {
			settable_map  : {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			$container: null,
			taphold   : null
		},
		jqueryMap = {},
		setJqueryMap, configModule, initModule, showPlan, calculate, onDelete,
		updateStartTime, updateEndTime, updateText, holdTap, holdStop,
		applyStartTime, applyEndTime, applyText;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$main     : $container.find('.plan-main')
		};
	};
	showPlan = function () {
		var planMap, startdate, starttime, enddate, endtime, i, result,
			startStr, endStr, $div, $option, $del, $alarm, $text, $start, $end,
			$frag = $(document.createDocumentFragment());
		result = zp.model.getPlan();
		result.done(function (planList) {
			if (planList.length) {
				jqueryMap.$main.html('');
				for (i = 0; i < planList.length; i++) {
					planMap = planList[i];
					if (planMap) {
						startdate = planMap.startdate;
						starttime = planMap.starttime;
						enddate = planMap.enddate;
						endtime = planMap.endtime;
						startStr = startdate + ' ' + starttime;
						endStr = enddate + ' ' + endtime;
						$div = $('<div/>').addClass('plan-item').attr('data-id', planMap._id);
						$option = $('<div/>').addClass('plan-option');
						$del = $('<div/>').addClass('plan-del').html('<i class="fa fa-trash-o"></i>');
						$alarm = $('<div/>"').addClass('plan-alarm').html('<i class="fa fa-alarm"></i>');
						$text = $('<div/>').addClass('plan-text').text(planMap.text);
						$start = $('<div/>').addClass('plan-start').text(startStr);
						$end = $('<div/>').addClass('plan-end').text(endStr);
						$option.append($del).append($alarm);
						$div.append($start).append($end).append($text).append($option);
						$frag.append($div);
					}
				}
				jqueryMap.$main.append($frag);
			}
		});
		jqueryMap.$main.html('<div class="no-content">일정을 작성해주세요</div>');
	};
	onDelete = function () {
		var
			$item = $(this).closest('.plan-item'),
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
			if (e.target.className === 'plan-text') {
				updateText(e.target);
			} else if (e.target.className === 'plan-start') {
				updateStartTime(e.target);
			} else if (e.target.className === 'plan-end') {
				updateEndTime(e.target);
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
	updateStartTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyStartTime);
	};
	updateEndTime = function (target) {
		var time = $(target).text();
		$(target).empty().append('<input type="text" value="' + time + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: time
		}, applyEndTime);
	};
	updateText = function (target) {
		var text = $(target).text();
		$(target).empty().append('<input type="text" value="' + text + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: text
		}, applyText);
	};
	applyStartTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx, date, time;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		date = update.substr(0, 10);
		time = update.substr(11, 8);
		alert(cidx);
		plan_list[cidx].startdate = date;
		plan_list[cidx].starttime = time;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	applyEndTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx, date, time;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		date = update.substr(0, 10);
		time = update.substr(11, 8);
		alert(cidx);
		plan_list[cidx].enddate = date;
		plan_list[cidx].endtime = time;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	applyText = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			change_obj, plan_list, cidx;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		change_obj = JSON.parse(localStorage.change);
		plan_list = JSON.parse(localStorage.plan);
		cidx = $target.parent('.plan-item').data('id');
		alert(cidx);
		plan_list[cidx].text = update;
		change_obj.u.push({
			cidx: cidx,
			type: 'plan'
		});
		localStorage.plan = JSON.stringify(plan_list);
		localStorage.change = JSON.stringify(change_obj);
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map   : input_map,
			settable_map: configMap.settable_map,
			config_map  : configMap
		});
	};
	initModule = function ($container) {
		$container.load('/html/zp.plan.html', function () {
			stateMap.$container = $container;
			setJqueryMap($container);
			showPlan();
			jqueryMap.$main.on('click', '.plan-del', onDelete);
			jqueryMap.$main.on('touchstart', '.plan-text, .plan-start, .plan-end', holdTap);
			jqueryMap.$main.on('touchend', '.plan-text, .plan-start, .plan-end', holdStop);
		});
	};
	return {
		configModule: configModule,
		initModule  : initModule
	};
}());