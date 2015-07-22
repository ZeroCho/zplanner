zp.todo = (function () {
	'use strict';
	var
		configMap = {
			settable_map: {
				set_cur_anchor: true
			},
			set_cur_anchor: null
		},
		stateMap = {
			$container: null
		},
		jqueryMap = {},
		setJqueryMap, display, configModule, initModule, onCheck, onDelete, setAlarm,
		updateTime, updateText, holdTap, holdStop, applyTime, applyText, isMobile, onClickCaret;
	setJqueryMap = function ($container) {
		jqueryMap = {
			$container: $container,
			$main: $container.find('#todo-main'),
			$dateless: $container.find('#todo-dateless'),
			$normal: $container.find('#todo-normal')
		};
	};
	display = function () {
		var
			$due, $text, $check, $div, $del, $alarm, $option, checked, todoMap,
			dateStr, date, time, i, todoResult, spinner, datelessResult,
			$frag = $(document.createDocumentFragment()),
			$fragg = $frag.clone();
		datelessResult = zp.model.getTodo('dateless');
		datelessResult.done(function (todoList) {
			$(spinner.el).remove();
			if (todoList.length) {
				$frag.append('<div class="subheader"><i class="fa fa-caret-down"></i>무기한</div>').append('<div/>');
				for (i = 0; i < todoList.length; i++) {
					todoMap = todoList[i];
					if (todoMap) {
						date = todoMap.date;
						time = todoMap.time;
						checked = todoMap.done;
						dateStr = date + ' ' + time;
						$div = $('<div/>').addClass('dateless-item').attr('data-id', todoMap._id);
						$check = $('<div/>').addClass('dateless-done').append('<input type="checkbox" size="3">');
						$del = $('<div/>').addClass('item-del').html('<i class="fa fa-trash-o"></i>');
						$option = $('<div/>').addClass('dateless-option').append($del);
						$text = $('<div/>').addClass('dateless-text').text(todoMap.text);
						$div.append($check).append($text).append($option).append($due);
						$frag.find('div').eq(1).append($div);
					}
				}
				jqueryMap.$dateless.append($frag);
			}
		});
		datelessResult.fail(function (err) {
			$(spinner.el).remove();
			if (err === 'not_found') {
				jqueryMap.$dateless.html('<div class="no-content">할일을 작성해주세요</div>');
			} else {
				alert(err);
			}
		});
		todoResult = zp.model.getTodo();
		todoResult.done(function (todoList) {
			$(spinner.el).remove();
			if (todoList.length) {
				$fragg.append('<div class="subheader"><i class="fa fa-caret-down"></i>할일들</div>').append('<div/>');
				for (i = 0; i < todoList.length; i++) {
					todoMap = todoList[i];
					if (todoMap) {
						date = todoMap.date;
						time = todoMap.time;
						checked = todoMap.done;
						dateStr = date + ' ' + time;
						$div = $('<div/>').addClass('todo-item').attr('data-id', todoMap._id);
						$check = $('<div/>').addClass('todo-done').append('<input type="checkbox" size="3">');
						$del = $('<div/>').addClass('item-del').html('<i class="fa fa-trash-o"></i>');
						$alarm = $('<div/>').addClass('item-alarm').html('<i class="fa fa-bell-o"></i>');
						$option = $('<div/>').addClass('todo-option').append($del).append($alarm);
						$text = $('<div/>').addClass('todo-text').text(todoMap.text);
						$due = $('<div/>').addClass('todo-due').text(dateStr);
						if (new Date(dateStr).getTime() < new Date().getTime()) {
							$text.addClass('item-due');
						}
						if (checked) {
							$check.find('input').prop('checked', true);
							$text.addClass('item-done');
						}
						$div.append($check).append($text).append($option).append($due);
						$fragg.find('div').eq(1).append($div);
					}
				}
				jqueryMap.$normal.append($fragg);
			}
		});
		todoResult.fail(function (err) {
			$(spinner.el).remove();
			if (err === 'not_found') {
				jqueryMap.$normal.html('<div class="no-content">할일을 작성해주세요</div>');
			} else {
				alert(err);
			}
		});
		spinner = new Spinner().spin();
		jqueryMap.$main.append(spinner.el);
		return true;
	};
	onClickCaret = function () {
		var $this = $(this);
		if ($this.hasClass('fa-caret-down')) {
			$this.parent().next().hide();
			$this.removeClass('fa-caret-down');
			$this.addClass('fa-caret-right');
		} else if ($this.hasClass('fa-caret-right')) {
			$this.parent().next().show();
			$this.addClass('fa-caret-down');
			$this.removeClass('fa-caret-right');
		}
	};
	onCheck = function () {
		var $text = $(this).parent().next(),
			id = $(this).closest('.todo-item').data('id');
		if ($(this).is(':checked')) {
			$(this).prop('checked', true);
			$text.addClass('item-done');
			zp.model.updateItem(id, {'done': true});
		} else {
			$(this).prop('checked', false);
			$text.removeClass('item-done');
			zp.model.updateItem(id, {'done': false});
		}
		return true;
	};
	onDelete = function () {
		var
			$item = $(this).closest('.todo-item'),
			id = $item.data('id'),
			result;
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
	isMobile = function () {
		var ht = {
			Android: /Android/,
			iOS: /like Mac OS X/
		}, os, key;
		for (key in ht) {
			if (ht.hasOwnProperty(key) && ht[key].test(navigator.userAgent)) {
				os = key;
			}
		}
		return (os === 'Android' || os === 'iOS');
	};
	setAlarm = function () {
		if (isMobile()) {
			var $this = $(this);
			var id = $item.data('id');
			if ($this.hasClass('set')) { // 이미 설정되어 있을 경우
				cordova.plugins.notification.local.cancel(id, function () {
					// Notification was cancelled
				});
				$this.removeClass('set');
				$this.css('color', 'silver');
			} else {
				var $item = $this.closest('.todo-item');
				var text = $item.find('.todo-text').text();
				var date = $item.find('.todo-due').text();
				cordova.plugins.notification.local.schedule({
					id: id,
					text: text,
					at: new Date(date),
					sound: 'sound.mp3'
				});
				$this.addClass('set');
				$this.css('color', 'black');
				console.log(new Date().getTime(), new Date(date).getTime());
			}
			return false;
		}
		alert('모바일에서만 가능한 기능입니다');
		return false;
	};
	holdTap = function (e) {
		console.log('holdtap');
		stateMap.taphold = setTimeout(function () {
			if (e.target.className === 'todo-text') {
				updateText(e.target);
			} else if (e.target.className === 'todo-due') {
				updateTime(e.target);
			}
		}, 1000);
		return false;
	};
	holdStop = function () {
		console.log('holdstop');
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
	applyTime = function (e) {
		var data = e.data,
			$target = $(data.target),
			update = $target.find('input').val(),
			id = $target.parent('.todo-item').data('idx'),
			date, time, result;
		if (data.origin === update) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(update);
		date = update.substr(0, 10);
		time = update.substr(11, 8);
		result = zp.model.updateItem(id, {'date': date, 'time': time});
		result.fail(function (err) {
			console.log(err);
		});
	};
	updateText = function (target) {
		var text = $(target).text();
		$(target).empty().append('<input type="text" value="' + text + '"/>');
		$(target).find('input').focus().on('blur', {
			target: target,
			origin: text
		}, applyText);
	};
	applyText = function (e) {
		var data = e.data,
			$target = $(data.target),
			text = $target.find('input').val(),
			id = $target.parent('.todo-item').data('id'),
			result;
		if (data.origin === text) {
			$target.empty().text(data.origin);
			return;
		}
		$target.empty().text(text);
		result = zp.model.updateItem(id, {'text': text});
		result.fail(function (err) {
			console.log('todo update fail', err);
		});
	};
	configModule = function (input_map) {
		zp.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
	};
	initModule = function ($container) {
		$container.html($('#zp-todo').html());
		stateMap.$container = $container;
		setJqueryMap($container);
		display();
		jqueryMap.$main.on('click', 'input[type=checkbox]', onCheck);
		jqueryMap.$main.on('click', '.subheader i.fa', onClickCaret);
		jqueryMap.$main.on('click', '.item-del', onDelete);
		jqueryMap.$main.on('click', '.item-alarm', setAlarm);
		jqueryMap.$main.on('touchstart', '.todo-text, .todo-due', holdTap);
		jqueryMap.$main.on('touchmove', '.todo-text, .todo-due', holdStop);
		jqueryMap.$main.on('touchend', '.todo-text, .todo-due', holdStop);
		return $container;
	};
	return {
		configModule: configModule,
		initModule: initModule
	};
}());