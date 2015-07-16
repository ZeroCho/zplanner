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
        setJqueryMap, showTodo, configModule, initModule, onCheck, onDelete, setAlarm,
        updateTime, updateText, holdTap, holdStop, applyTime, applyText, isMobile;

    setJqueryMap = function ($container) {
        jqueryMap = {
            $container: $container,
            $main: $container.find('.todo-main')
        };
    };
    showTodo = function () {
        var
            $due, $text, $check, $div, $del, $alarm, $option, checked, todoMap,
            dateStr, date, time, i, result,
            $frag = $(document.createDocumentFragment());
        result = zp.model.getTodo();
        result.done(function (todoList) {
            console.log(todoList);
            if (todoList.length) {
                jqueryMap.$main.html('');
                for (i = 0; i < todoList.length; i++) {
                    todoMap = todoList[i];
                    console.log(todoMap);
                    if (todoMap) {
                        date = todoMap.date;
                        time = todoMap.time;
                        checked = todoMap.done;
                        dateStr = date + ' ' + time;
                        $div = $('<div/>').addClass('todo-item').attr('data-id', todoMap._id);
                        $check = $('<div/>').addClass('todo-done').append('<input type="checkbox" size="3">');
                        $option = $('<div/>').addClass('todo-option');
                        $del = $('<div/>').addClass('todo-del').html('<i class="fa fa-trash-o"></i>');
                        $alarm = $('<div/>').addClass('todo-alarm').html('<i class="fa fa-bell-o"></i>');
                        $text = $('<div/>').addClass('todo-text').text(todoMap.text);
                        $due = $('<div/>').addClass('todo-due').text(dateStr);
                        if (new Date(dateStr).getTime() < new Date().getTime()) {
                            $text.addClass('item-due');
                        }
                        if (checked) {
                            $check.find('input').prop('checked', true);
                            $text.addClass('item-done');
                        }
                        $option.append($del).append($alarm);
                        $div.append($check).append($text).append($option).append($due);
                        $frag.append($div);
                    }
                }
                jqueryMap.$main.append($frag);
            }
        });
        result.fail(function (err) {
            alert(err);
        });
        jqueryMap.$main.html('<div class="no-content">할일을 작성해주세요</div>');
        return true;
    };

    onCheck = function () {
        var $text = $(this).parent().next(),
            id = $(this).closest('.todo-item').data('id');
        if ($(this).is(':checked')) {
            $(this).prop('checked', true);
            $text.addClass('item-done');
			zp.model.todoToggle(id, true);
        } else {
            $(this).prop('checked', false);
            $text.removeClass('item-done');
            zp.model.todoToggle(id, false);
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
            // todo: 모바일일 때 알람 구현
            alert('준비중입니다');
            return false;
        }
        alert('모바일에서만 가능한 기능입니다');
        return false;
    };

    holdTap = function (e) {
        console.log('holdtap');
        e.stopImmediatePropagation();
        stateMap.taphold = setTimeout(function () {
            if (e.target.className === 'todo-text') {
                updateText(e.target);
            } else if (e.target.className === 'todo-due') {
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
            change_obj, todo_list, cidx, date, time;
        if (data.origin === update) {
            $target.empty().text(data.origin);
            return;
        }
        $target.empty().text(update);
        change_obj = JSON.parse(localStorage.change);
        todo_list = JSON.parse(localStorage.todo);
        cidx = $target.parent('.todo-item').data('idx');
        date = update.substr(0, 10);
        time = update.substr(11, 8);
        alert(cidx);
        todo_list[cidx].date = date;
        todo_list[cidx].time = time;
        change_obj.u.push({
            cidx: cidx,
            type: 'todo'
        });
        localStorage.todo = JSON.stringify(todo_list);
        localStorage.change = JSON.stringify(change_obj);
    };

    applyText = function (e) {
        var data = e.data,
            $target = $(data.target),
            update = $target.find('input').val(),
            change_obj, todo_list, cidx;
        if (data.origin === update) {
            $target.empty().text(data.origin);
            return;
        }
        $target.empty().text(update);
        change_obj = JSON.parse(localStorage.change);
        todo_list = JSON.parse(localStorage.todo);
        cidx = $target.parent('.todo-item').data('idx');
        alert(cidx);
        todo_list[cidx].text = update;
        change_obj.u.push({
            cidx: cidx,
            type: 'todo'
        });
        localStorage.todo = JSON.stringify(todo_list);
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
        $container.load('/html/zp.todo.html', function () {
            stateMap.$container = $container;
            setJqueryMap($container);
            showTodo();
            jqueryMap.$main.on('click', 'input[type=checkbox]', onCheck);
            jqueryMap.$main.on('click', '.todo-del', onDelete);
            jqueryMap.$main.on('click', '.todo-alarm', setAlarm);
            jqueryMap.$main.on('touchstart', '.todo-text, .todo-due', holdTap);
            jqueryMap.$main.on('touchend', '.todo-text, .todo-due', holdStop);
        });
        return $container;
    };

    return {
        configModule: configModule,
        initModule: initModule
    };
}());