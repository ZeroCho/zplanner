zp.plan = (function () {
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
        setJqueryMap, configModule, initModule, showPlan, calculate, onDelete,
        updateStartTime, updateEndTime, updateText, holdTap, holdStop,
        applyStartTime, applyEndTime, applyText;

    setJqueryMap = function ($container) {
        jqueryMap = {
            $container: $container,
            $main: $container.find('.plan-main')
        };
    };

    calculate = function (data) {
        var data_list = [],
            obj, day, i, index, count, temp, interval;
        if (data.num) {
            obj = zp.calendar.objectify(data.startdate);
            day = new Date(obj.year, obj.month - 1, obj.date).getDay();
            for (i = 0; i < data.day.length; i++) {
                if (data.day[i] === day) {
                    index = day;
                    break;
                }
            }
            data.day = data.day.map(function (idx, item) {
                temp = item;
                index = temp;
                return index;
            });
            data.day = data.day.map(function (idx, item) {
                var
                    nextday, gap;
                nextday = data.day[idx + 1] || data.day[0];
                gap = nextday - item;
                if (gap < 0) {
                    gap = 7 + gap;
                }
                return gap;
            });
            count = data.num - 1;
            for (i = 0; i < count; i++) {
                interval = data.day[i];
                data.cidx++;
                data.startdate = zp.calendar.getNextString(data.startdate, interval);
                data.enddate = zp.calendar.getNextString(data.enddate, interval);
                data_list.push(data);
            }
        }

        return data_list;
    };

    showPlan = function () {
        var plan_obj, startdate, starttime, enddate, endtime, i,
            start_str, end_str, $div, $option, $del, $alarm, $text, $start, $end,
            $frag = $(document.createDocumentFragment());
        zp.model.getPlan();
        $.gevent.subscribe(jqueryMap.$main, 'getPlan', function (e, plan_list) {
            e.preventDefault();
            if (plan_list.length) {
                jqueryMap.$main.html('');
                for (i = 0; i < plan_list.length; i++) {
                    plan_obj = plan_list[i];
                    if (plan_obj) {
                        startdate = plan_obj.startdate;
                        starttime = plan_obj.starttime;
                        enddate = plan_obj.enddate;
                        endtime = plan_obj.endtime;
                        start_str = startdate + ' ' + starttime;
                        end_str = enddate + ' ' + endtime;
                        $div = $('<div/>').addClass('plan-item').attr('data-idx', i);
                        $option = $('<div/>').addClass('plan-option');
                        $del = $('<div/>').addClass('plan-del').html('<i class="fa fa-trash-o"></i>');
                        $alarm = $('<div/>"').addClass('plan-alarm').html('<i class="fa fa-alarm"></i>');
                        $text = $('<div/>').addClass('plan-text').text(plan_obj.text);
                        $start = $('<div/>').addClass('plan-start').text(start_str);
                        $end = $('<div/>').addClass('plan-end').text(end_str);
                        $option.append($del).append($alarm);
                        $div.append($start).append($end).append($text).append($option);
                        $frag.append($div);
                    }
                }
                jqueryMap.$main.append($frag);
            }
        })
        jqueryMap.$main.html('<div style="text-align:center">일정을 작성해주세요</div>');
    };

    onDelete = function () {
        if (!confirm('삭제하시겠습니까?')) {
            return false;
        }
        var
            $item = $(this).closest('.plan-item'),
            cidx = $item.data('idx'),
            change_map = localStorage.change ? JSON.parse(localStorage.change) : {c: [], u: [], d: []},
            plan_list = JSON.parse(localStorage.plan);
        delete plan_list[cidx];
        $item.remove();
        localStorage.plan = JSON.stringify(plan_list);
        change_map.d.push({cidx: cidx, type: 'plan'});
        localStorage.change = JSON.stringify(change_map);
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
        cidx = $target.parent('.plan-item').data('idx');
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
        cidx = $target.parent('.plan-item').data('idx');
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
        cidx = $target.parent('.todo-item').data('idx');
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
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
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
        initModule: initModule,
        calculate: calculate
    };
}());