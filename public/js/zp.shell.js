/*
 * zp.shell.js 
 * zecretary 셸 모듈
 */

/*jslint           browser : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true, todo    : true
 */

/*전역 $, zp */

zp.shell = (function () {
    'use strict';
    var
        configMap = {
            anchor_schema_map: {
                current: {
                    year: true,
                    month: true,
                    week: true,
                    day: true,
                    plan: true,
                    todo: true
                },
                date: true
            },
            today: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                date: new Date().getDate(),
                week: zp.calendar.getWeekNum(new Date().getDate(), new Date().getMonth() + 1),
                day: new Date().getDay()
            },
            day: ['일', '월', '화', '수', '목', '금', '토']
        },
        stateMap = {
            $container: null,
            anchor_map: {},
            cur: 'day',
            act: 'reload',
            date_info: {
                year: configMap.today.year,
                month: configMap.today.month,
                date: configMap.today.date,
                week: configMap.today.week,
                day: configMap.today.day
            },
            flick: [100, 200, 0],
            state: 'static',
            top: 0,
            left: 0,
            fidx: 0,
            db: null
        },
        jqueryMap = {},
        initModule, setJqueryMap, initMain, initDay, initWeek, initMonth, initYear, getDirection,
        changeAnchorPart, copyAnchorMap, toggleMain, introApp, setCurAnchor,
        onHashchange, onSearchDate, onLoginSuccess, onClickCell, onTouchend, onTouchmove, onTouchstart,
        onLogout, onUpload, onDownload, setTitle, onClickTitleYear, onClickTitleMonth, onClickTitleWeek, setPosition,
        onSubmit, toggleUserMenu, onSwipe, initPosition;

    setJqueryMap = function ($container) {
        jqueryMap = {
            $container: $container,
            $header: $container.find('header'),
            $user: $container.find('.user'),
            $avatar: $container.find('.avatar'),
            $info: $container.find('.info'),
            $name: $container.find('.name'),
            $menu: $container.find('.menu'),
            $logout: $container.find('.menu-logout'),
            $profile: $container.find('.menu-profile'),
            $upload: $container.find('.menu-upload'),
            $download: $container.find('.menu-download'),
            $main: $container.find('main'),
            $flickView: $container.find('.flick-view'),
            $flickCon: $container.find('.flick-con'),
            $flick: $container.find('.flick-panel'),
            $toggle: $container.find('.tool-toggle'),
            $search: $container.find('.tool-search'),
            $modal: $container.find('.modal'),
            $intro: $container.find('.intro')
        };
    };

    initDay = function (e, data) {
        e.preventDefault();
        var date_str;
        if (stateMap.state === 'static') {
            date_str = String(data.year) + ('0' + data.month).slice(-2) + ('0' + data.date).slice(-2);
            setCurAnchor('day', date_str);
            initPosition();
        } else {
            stateMap.state = 'static';
        }
    };

    initWeek = function (e, data) {
        e.preventDefault();
        var date_str;
        if (stateMap.state === 'static') {
            date_str = data.year + ('0' + data.week).slice(-2);
            setCurAnchor('week', date_str);
            initPosition();
        } else {
            stateMap.state = 'static';
        }
    };

    initMonth = function (e, data) {
        e.preventDefault();
        var date_str;
        if (stateMap.state === 'static') {
            date_str = data.year + ('0' + data.month).slice(-2);
            setCurAnchor('month', date_str);
            initPosition();
        } else {
            stateMap.state = 'static';
        }
    };

    initYear = function (e, data) {
        e.preventDefault();
        var date_str;
        if (stateMap.state === 'static') {
            date_str = String(data.year);
            setCurAnchor('year', date_str);
            initPosition();
        } else {
            stateMap.state = 'static';
        }
    };

    initMain = function (mod, data) {
        console.log('main을 초기화합니다.' + mod);
        var temp_data = {};
        data.week = data.week || zp.calendar.getWeekNum(data.date, data.month, data.year);
        zp[mod].initModule(jqueryMap.$flick.eq(0), data);
        if (mod === 'day') {
            temp_data = zp.calendar.getNextDate(data);
            zp.day.initModule(jqueryMap.$flick.eq(1), temp_data);
            temp_data = zp.calendar.getPrevDate(data);
            zp.day.initModule(jqueryMap.$flick.eq(2), temp_data);
        } else if (mod === 'week') {
            temp_data.week = data.week + 1;
            temp_data.year = data.year;
            if (temp_data.week === 54) {
                temp_data.week = 1;
                temp_data.year += 1;
            }
            zp.week.initModule(jqueryMap.$flick.eq(1), temp_data);
            temp_data.week = data.week - 1;
            if (temp_data.week === 0) {
                temp_data.week = 53;
                temp_data.year -= 1;
            }
            zp.week.initModule(jqueryMap.$flick.eq(2), temp_data);
        } else if (mod === 'month') {
            temp_data = {
                year: data.year,
                month: data.month + 1
            };
            if (temp_data.month === 13) {
                temp_data.month = 1;
                temp_data.year += 1;
            }
            zp.month.initModule(jqueryMap.$flick.eq(1), temp_data);
            temp_data = {
                year: data.year,
                month: data.month - 1
            };
            if (temp_data.month === 0) {
                temp_data.month = 12;
                temp_data.year -= 1;
            }
            zp.month.initModule(jqueryMap.$flick.eq(2), temp_data);
        } else if (mod === 'year') {
            temp_data = {
                year: data.year + 1
            };
            zp.year.initModule(jqueryMap.$flick.eq(1), temp_data);
            temp_data = {
                year: data.year - 1
            };
            zp.year.initModule(jqueryMap.$flick.eq(2), temp_data);
        }
        stateMap.cur = mod;
        setTitle(data);
        console.log('메인이 초기화되었습니다!');
    };

    setTitle = function (data) {
        console.log('상단 title을 변경합니다.');
        var title_str = '',
            style_str = '',
            cur = stateMap.cur;
        switch (cur) {
            case 'day':
                if (data.day === 0) {
                    style_str = 'style="color:yellow;"';
                } else if (data.day === 6) {
                    style_str = 'style="color:blue;"';
                }
                title_str = '<span class="title-year">' + data.year
                    + '</span>.<span class="title-month">' + data.month
                    + '</span>.<span class="title-date">' + data.date
                    + '</span> <span class="title-day" ' + style_str + '>'
                    + configMap.day[data.day] + '</span> <span class="title-week">'
                    + data.week + '주차</span>';
                break;
            case 'week':
                data.week = data.week || zp.calendar.getWeekNum(data.date, data.month, data.year);
                title_str = '<span class="title-year">' + data.year
                    + '</span>년 <span class="title">' + data.week + '주차</span>';
                break;
            case 'month':
                title_str = '<span class="title-year">' + data.year
                    + '년</span> <span class="title">' + data.month + '월</span>';
                break;
            case 'year':
                title_str = '<span class="title">' + data.year + '년</span>';
                break;
            case 'todo':
                title_str = '<span class="title">할일</span>';
                break;
            case 'plan':
                title_str = '<span class="title">일정</span>';
                break;
            case 'dday':
                title_str = '<span class="title">D-day / 기념일</span>';
                break;
        }
        jqueryMap.$info.html(title_str);
        if (data) {
            console.log('data가 있어 stateMap 날짜 정보를 변경합니다.');
            if (data.hasOwnProperty('date')) {
                stateMap.date_info.date = data.date;
            }
            if (data.hasOwnProperty('month')) {
                stateMap.date_info.month = data.month;
            }
            if (data.hasOwnProperty('year')) {
                stateMap.date_info.year = data.year;
            }
            if (data.hasOwnProperty('week')) {
                stateMap.date_info.week = data.week;
            }
        }
        return $.extend({}, data);
    };

    introApp = function () {
        alert('처음이시군요!');
        jqueryMap.$intro.show();
        if (!confirm('다음 실행 때도 보시겠습니까?')) {
            localStorage.first = 'false';
        }
    };

    onLogout = function (e) {
        e.stopPropagation();
        if (JSON.parse(localStorage.online) === false) {
            zp.modal.initModule(jqueryMap.$modal, 'login').show();
            return false;
        }
        if (!confirm('로그아웃하시겠습니까?')) {
            return false;
        }
        jqueryMap.$name.html('로그인');
        jqueryMap.$avatar.html('');
        localStorage.removeItem('user');
        localStorage.online = 'false';
        alert('로그아웃되었습니다!');
        jqueryMap.$menu.hide();
        zp.modal.initModule(jqueryMap.$modal, 'login').show();
        jqueryMap.$modal.find('.input-id').focus();
    };

    onUpload = function () {
        zp.model.upload();
    };

    onDownload = function () {
        zp.model.download();
    };

    onClickTitleYear = function () {
        initPosition();
        setCurAnchor('year', stateMap.date_info.year);
        stateMap.cur = 'year';
        setTitle(stateMap.date_info);
    };

    onClickTitleMonth = function () {
        initPosition();
        setCurAnchor('month', stateMap.date_info.year + ('0' + stateMap.date_info.month).slice(-2));
        stateMap.cur = 'month';
        setTitle(stateMap.date_info);
    };

    onClickTitleWeek = function () {
        initPosition();
        setCurAnchor('week', stateMap.date_info.year + ('0' + stateMap.date_info.week).slice(-2));
        stateMap.cur = 'week';
        setTitle(stateMap.date_info);
    };

    onSwipe = function (direction, cur_data) {
        var cur = stateMap.cur,
            temp_data, page;
        stateMap.act = 'swipe';
        cur_data.year = parseInt(cur_data.year, 10);
        cur_data.month = parseInt(cur_data.month, 10);
        cur_data.week = parseInt(cur_data.week, 10);
        if (direction === 'left') { // show next
            console.log('swiped to the left!');
            page = (stateMap.fidx + 1) % 3;
            switch (cur) {
                case 'day':
                    cur_data = setTitle(zp.calendar.getNextDate(cur_data));
                    // 다음 모듈을 미리 로드(2일 후)
                    temp_data = zp.calendar.getNextDate(cur_data);
                    zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
                    // 주소는 1일 후로
                    setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2) + ('0' + cur_data.date).slice(-2));
                    break;
                case 'week':
                    cur_data.week += 1;
                    if (cur_data.week === 54) {
                        cur_data.week = 1;
                        cur_data.year += 1;
                    }
                    // 다음 모듈을 미리 로드(2주 후)
                    temp_data = setTitle(cur_data);
                    temp_data.week += 1;
                    if (temp_data.week === 54) {
                        temp_data.week = 1;
                        temp_data.year += 1;
                    }
                    zp.week.initModule(jqueryMap.$flick.eq(page), temp_data);
                    // 주소는 1달 후로
                    setCurAnchor('week', cur_data.year + ('0' + cur_data.week).slice(-2));
                    break;
                case 'month':
                    cur_data.month += 1;
                    if (cur_data.month === 13) {
                        cur_data.month = 1;
                        cur_data.year += 1;
                    }
                    // 다음 모듈을 미리 로드(2달 후)
                    temp_data = setTitle(cur_data);
                    temp_data.month += 1;
                    if (temp_data.month === 13) {
                        temp_data.month = 1;
                        temp_data.year += 1;
                    }
                    zp.month.initModule(jqueryMap.$flick.eq(page), temp_data);
                    // 주소는 1달 후로
                    setCurAnchor('month', cur_data.year + ('0' + cur_data.month).slice(-2));
                    break;
                case 'year':
                    cur_data.year += 1;
                    // 다음 모듈을 미리 로드 (2년 후)
                    cur_data = setTitle(cur_data);
                    temp_data = $.extend({}, cur_data);
                    temp_data.year += 1;
                    zp.year.initModule(jqueryMap.$flick.eq(page), temp_data);
                    setCurAnchor('year', cur_data.year);
                    break;
                case 'todo':
                    stateMap.cur = 'plan';
                    setTitle();
                    break;
                case 'plan':
                    stateMap.cur = 'dday';
                    setTitle();
                    break;
                case 'dday':
                    stateMap.cur = 'todo';
                    setTitle();
                    break;
            }
        } else { // right prev
            console.log('swiped to the right!');
            page = (stateMap.fidx - 1) % 3;
            switch (cur) {
                case 'day':
                    cur_data = setTitle(zp.calendar.getPrevDate(cur_data));
                    temp_data = zp.calendar.getPrevDate(cur_data);
                    zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
                    setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2) + ('0' + cur_data.date).slice(-2));
                    break;
                case 'week':
                    cur_data.week -= 1;
                    if (cur_data.week === 0) {
                        cur_data.week = 53;
                        cur_data.year -= 1;
                    }
                    // 다음 모듈을 미리 로드(2주 후)
                    temp_data = setTitle(cur_data);
                    temp_data.week -= 1;
                    if (temp_data.week === 0) {
                        temp_data.week = 53;
                        temp_data.year -= 1;
                    }
                    zp.week.initModule(jqueryMap.$flick.eq(page), temp_data);
                    // 주소는 1달 후로
                    setCurAnchor('week', cur_data.year + ('0' + cur_data.week).slice(-2));
                    break;
                case 'month':
                    cur_data.month -= 1;
                    if (cur_data.month === 0) {
                        cur_data.month = 12;
                        cur_data.year -= 1;
                    }
                    temp_data = setTitle(cur_data);
                    temp_data.month -= 1;
                    if (temp_data.month === 0) {
                        temp_data.month = 12;
                        temp_data.year -= 1;
                    }
                    zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
                    setCurAnchor(cur, cur_data.year + ('0' + cur_data.month).slice(-2));
                    break;
                case 'year':
                    cur_data.year -= 1;
                    temp_data = setTitle(cur_data);
                    temp_data.year -= 1;
                    zp[cur].initModule(jqueryMap.$flick.eq(page), temp_data);
                    setCurAnchor(cur, cur_data.year);
                    break;
                case 'todo':
                    stateMap.cur = 'dday';
                    setTitle();
                    break;
                case 'plan':
                    stateMap.cur = 'todo';
                    setTitle();
                    break;
                case 'dday':
                    stateMap.cur = 'plan';
                    setTitle();
                    break;
            }
        }
        jqueryMap.$flick.eq(page).css('top', 0);
        stateMap.date_info = cur_data;
        console.log('swipe가 완료되었습니다', stateMap.act);
        return cur_data;
    };

    toggleUserMenu = function () {
        if (localStorage.online !== 'true') {
            zp.modal.initModule(jqueryMap.$modal, 'login').show();
            return false;
        }
        jqueryMap.$menu.toggle();
        return false;
    };

    onLoginSuccess = function (e, user_map) {
        e.preventDefault();
        localStorage.online = 'true';
        jqueryMap.$name.html(user_map.name);
        jqueryMap.$avatar.html(user_map.avatar || '');
        localStorage.user = JSON.stringify(user_map);
        console.log('online mode');
        if (!localStorage.first && JSON.parse(localStorage.first)) {
            introApp();
        }
    };

    onSearchDate = function () {
        zp.modal.configModule({set_cur_anchor: setCurAnchor});
        zp.modal.initModule(jqueryMap.$modal, 'search').show();
    };

    onSubmit = function (e, data) {
        e.preventDefault();
        console.log('onSubmit', data);
        setCurAnchor(data);
    };

    onClickCell = function (e, data) {
        e.preventDefault();
        zp.modal.initModule(jqueryMap.$modal, 'type', data).show();
    };

    toggleMain = function () {
        var cur = copyAnchorMap().current;
        stateMap.act = 'reload';
        if (cur === 'todo' || cur === 'plan' || cur === 'dday') {
            setCurAnchor('day');
            jqueryMap.$toggle.html('<i class="fa fa-list"></i>');
        } else {
            setCurAnchor('todo');
            jqueryMap.$toggle.html('<i class="fa fa-calendar"></i>');
        }
    };

    copyAnchorMap = function () {
        return $.extend(true, {}, stateMap.anchor_map);
    };

    changeAnchorPart = function (arg_map) {
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                if (key_name.indexOf('_') === 0) {
                    continue;
                }
                anchor_map_revise[key_name] = arg_map[key_name];
                if (arg_map[key_name] === undefined) {
                    delete arg_map[key_name];
                    delete anchor_map_revise[key_name];
                }
                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                } else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        } catch (error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
        return bool_return;
    };

    setCurAnchor = function (status, date) {
        var arg_map = {
            current: status,
            date: date
        };
        return changeAnchorPart(arg_map);
    };

    onHashchange = function () {
        var
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed, _s_cur_previous, _s_cur_proposed, s_cur_proposed,
            _s_date_previous, _s_date_proposed, data = {};
        console.log(
            new Date().getHours(), new Date().getMinutes(),
            new Date().getSeconds(), '해시가 변경이 시도되었습니다.'
        );
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        if (anchor_map_proposed.current === undefined) {
            anchor_map_proposed.current = 'day';
        }
        stateMap.anchor_map = anchor_map_proposed;
        _s_date_previous = anchor_map_previous._s_date;
        _s_date_proposed = anchor_map_proposed._s_date;
        _s_cur_previous = anchor_map_previous._s_current;
        _s_cur_proposed = anchor_map_proposed._s_current;
        if (!Object.keys(anchor_map_previous).length ||
            _s_cur_previous !== _s_cur_proposed ||
            _s_date_previous !== _s_date_proposed) {
            s_cur_proposed = anchor_map_proposed.current;
            switch (s_cur_proposed) {
                case 'year':
                    if (stateMap.act === 'reload') {
                        if (_s_date_proposed) {
                            data.year = stateMap.date_info.year =
                                parseInt(_s_date_proposed.substr(0, 4), 10);
                        }
                        initMain('year', data);
                    } else {
                        stateMap.act = 'reload';
                    }
                    break;
                case 'month':
                    if (stateMap.act === 'reload') {
                        if (_s_date_proposed) {
                            data.year = stateMap.date_info.year =
                                parseInt(_s_date_proposed.substr(0, 4), 10);
                            data.month = stateMap.date_info.month =
                                parseInt(_s_date_proposed.substr(4, 2), 10);
                        }
                        initMain('month', data);
                    } else {
                        stateMap.act = 'reload';
                    }
                    break;
                case 'week':
                    if (stateMap.act === 'reload') {
                        if (_s_date_proposed) {
                            data.year = stateMap.date_info.year =
                                parseInt(_s_date_proposed.substr(0, 4), 10);
                            data.week = stateMap.date_info.week =
                                parseInt(_s_date_proposed.substr(4, 2), 10);
                        }
                        console.log('onhashchange', 'data.week', data.week);
                        initMain('week', data);
                    } else {
                        stateMap.act = 'reload';
                    }
                    break;
                case 'day':
                    if (stateMap.act === 'reload') {
                        if (_s_date_proposed) {
                            data.year = stateMap.date_info.year =
                                parseInt(_s_date_proposed.substr(0, 4), 10);
                            data.month = stateMap.date_info.month =
                                parseInt(_s_date_proposed.substr(4, 2), 10);
                            data.date = stateMap.date_info.date =
                                parseInt(_s_date_proposed.substr(6, 2), 10);
                        } else {
                            data.year = stateMap.date_info.year;
                            data.month = stateMap.date_info.month;
                            data.date = stateMap.date_info.date;
                        }
                        data.day = new Date(data.year, data.month - 1, data.date).getDay();
                        data.week = zp.calendar.getWeekNum(data.date, data.month, data.year);
                        initMain('day', data);
                    } else {
                        stateMap.act = 'reload';
                    }
                    break;
                case 'plan':
                    initPosition();
                    zp.plan.initModule(jqueryMap.$flick.eq(0));
                    zp.dday.initModule(jqueryMap.$flick.eq(1));
                    zp.todo.initModule(jqueryMap.$flick.eq(2));
                    stateMap.cur = 'plan';
                    setTitle();
                    break;
                case 'todo':
                    initPosition();
                    zp.todo.initModule(jqueryMap.$flick.eq(0));
                    zp.plan.initModule(jqueryMap.$flick.eq(1));
                    zp.dday.initModule(jqueryMap.$flick.eq(2));
                    stateMap.cur = 'todo';
                    setTitle();
                    break;
                case 'dday':
                    initPosition();
                    zp.dday.initModule(jqueryMap.$flick.eq(0));
                    zp.todo.initModule(jqueryMap.$flick.eq(1));
                    zp.plan.initModule(jqueryMap.$flick.eq(2));
                    stateMap.cur = 'dday';
                    setTitle();
                    break;
                default:
                    delete anchor_map_proposed.current;
                    delete anchor_map_proposed.date;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
    };

    initPosition = function () {
        console.log('flick 포지션을 초기화합니다');
        jqueryMap.$main.css('height', $(window).height() - jqueryMap.$header.height());
        jqueryMap.$flick.css('min-height', $(window).height() - jqueryMap.$header.height());
        jqueryMap.$flick.eq(0).css('left', '0%');
        jqueryMap.$flick.eq(1).css('left', '100%');
        jqueryMap.$flick.eq(2).css('left', '-100%');
    };

    setPosition = function () {
        stateMap.fidx = (stateMap.fidx < 0) ? stateMap.fidx + 3 : stateMap.fidx % 3;
        var cidx = stateMap.fidx,
            ridx = cidx + 1,
            lidx = cidx - 1;
        if (cidx - 1 < 0) {
            lidx = 2;
        }
        if (cidx + 1 > 2) {
            ridx = 0;
        }
        jqueryMap.$flick.eq(lidx).css({left: '-100%'});
        jqueryMap.$flick.eq(cidx).css({left: '0%'});
        jqueryMap.$flick.eq(ridx).css({left: '100%'});
    };

    getDirection = function (x, y) {
        var slope = Math.abs(parseFloat((y / x).toFixed(2))), dir,
            slope_h = ((window.innerHeight / 2) / window.innerWidth).toFixed(2),
            slope_x = (window.innerHeight / (window.innerWidth / 2)).toFixed(2);
        if (slope >= slope_h) {
            dir = 2;
        } else if (slope <= slope_x) {
            dir = 0;
        } else {
            dir = 1;
        }
        return dir;
    };
    onTouchstart = function (e) {
        jqueryMap.$flickCon.css({webkitTransition: 'null'});
        stateMap.touch_start_x = stateMap.touch_x = e.originalEvent.touches[0].clientX;
        stateMap.touch_start_y = stateMap.touch_y = e.originalEvent.touches[0].clientY;
        return true;
    };

    onTouchmove = function (e) {
        stateMap.touch_x = e.originalEvent.touches[0].clientX;
        stateMap.touch_y = e.originalEvent.touches[0].clientY;
        stateMap.gap_x = stateMap.touch_x - stateMap.touch_start_x;
        stateMap.gap_y = stateMap.touch_y - stateMap.touch_start_y;
        stateMap.direction = stateMap.direction || getDirection(stateMap.gap_x, stateMap.gap_y);
        if (stateMap.direction === 0) {
            e.preventDefault();
            jqueryMap.$flickCon.css({transform: 'translate(' + stateMap.gap_x + 'px)'});
        }
        stateMap.state = 'drag';
    };

    onTouchend = function () {
        if (Math.abs(stateMap.gap_x) > $(window).width() / 2.5) {
            if (stateMap.gap_x < 0) {
                jqueryMap.$flickCon.css({
                    transform: 'translate(100%,0)', webkitTransition: '200ms'
                });
                stateMap.fidx++;
                onSwipe('left', stateMap.date_info);
            } else {
                jqueryMap.$flickCon.css({
                    transform: 'translate(-100%,0)', webkitTransition: '200ms'
                });
                stateMap.fidx--;
                onSwipe('right', stateMap.date_info);
            }
            setPosition();
            jqueryMap.$flickCon.css({transform: 'translate(0)', webkitTransition: 'null'});
        } else {
            jqueryMap.$flickCon.css({transform: 'translate(0)', webkitTransition: '200ms'});
        }
        stateMap.direction = undefined;
        stateMap.gap_x = 0;
        return true;
    };

    initModule = function ($container) {
        console.log('shell init!');
        var
            online = localStorage.online ? JSON.parse(localStorage.online) : false;
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });
        localStorage.first = localStorage.first ? JSON.parse(localStorage.first) : false;
        stateMap.$container = $container;
        setJqueryMap($container);
        if (online) {
            onLoginSuccess(event, JSON.parse(localStorage.user));
        } else {
            console.log('오프라인모드로 접속합니다.');
            localStorage.user = 'anon';
        }
        initPosition();
        $(window)
            .on('error', function (errorMsg, url, lineNumber, column, errorObj) {
                console.error(errorMsg);
                if (errorMsg.indexOf('Script error.') > -1) {
                    return;
                }
                alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
                    + ' Column: ' + column + ' StackTrace: ' + errorObj);
            })
            .on('hashchange', onHashchange).trigger('hashchange')
            .on('orientationchange resize', function () {
                jqueryMap.$main.css('height', $(window).height() - jqueryMap.$header.height());
                jqueryMap.$flick.css('min-height', $(window).height() - jqueryMap.$header.height());
            });
        $.gevent.subscribe(jqueryMap.$user, 'login', onLoginSuccess);
        $.gevent.subscribe(jqueryMap.$container, 'submit', onSubmit);
        $.gevent.subscribe(jqueryMap.$main, 'day', initDay);
        $.gevent.subscribe(jqueryMap.$main, 'week', initWeek);
        $.gevent.subscribe(jqueryMap.$main, 'month', initMonth);
        $.gevent.subscribe(jqueryMap.$main, 'year', initYear);
        $.gevent.subscribe(jqueryMap.$modal, 'cell', onClickCell);
        // 이벤트 핸들러
        jqueryMap.$user.on('click', toggleUserMenu);
        jqueryMap.$logout.on('click', onLogout);
        jqueryMap.$toggle.on('click', toggleMain);
        jqueryMap.$search.on('click', onSearchDate);
        jqueryMap.$info.on('click', '.title-year', onClickTitleYear);
        jqueryMap.$info.on('click', '.title-month', onClickTitleMonth);
        jqueryMap.$info.on('click', '.title-week', onClickTitleWeek);
        // drag
        jqueryMap.$flickView
            .on('touchstart', onTouchstart)
            .on('touchmove', onTouchmove)
            .on('touchend', onTouchend);
    };
    return {
        initModule: initModule
    };
}());