zp.modal = (function () {
    'use strict';
    var
        configMap = {
            settable_map: {
                set_cur_anchor: true
            },
            set_cur_anchor: null,
            today: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                date: new Date().getDate()
            }
        },
        stateMap = {
            $container: null,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            date: new Date().getDate(),
            hour: new Date().getHours(),
            minute: new Date().getMinutes()
        },

        jqueryMap = {},
        setJqueryMap, configModule, initModule, onClickClose, onClickBack,
        onTypeTodo, onTypePlan, onTypeDday, onSubmitTodo, onSubmitPlan, onSubmitDday,
        onRepeat, onSetStartdate, onSearch, onToggleRepeatType, showValue,
        onLogin, onClickJoin, onOffline, checkRegEmail, toToday,
        onJoin, onFindPw, onValidateEmail, onValidateAnswer, onCheckEmail;

    setJqueryMap = function ($container) {
        jqueryMap = {
            $container: $container,
            $close: $container.find('.modal-close'),
            $login: $container.find('#login-sbmt'),
            $todo: $container.find('.todo-btn button'),
            $plan: $container.find('.plan-btn button '),
            $dday: $container.find('.dday-btn button '),
            $join: $container.find('.join-btn'),
            $back: $container.find('.modal-back'),
            $typeTodo: $container.find('#type-todo'),
            $typePlan: $container.find('#type-plan'),
            $typeDday: $container.find('#type-dday'),
            $checkEmailBtn: $container.find('#check-email-btn'),
            $joinSbmt: $container.find('#join-sbmt'),
            $findpw: $container.find('.findpw-btn'),
            $findEmailForm: $container.find('#findpw-email-form'),
            $findEmailBtn: $container.find('#findpw-email-sbmt'),
            $findPwForm: $container.find('#findpw-qst-form'),
            $findPwBtn: $container.find('#findpw-ans-sbmt'),
            $findPwResult: $container.find('#findpw-result'),
            $offline: $container.find('.offline-btn'),
            $repeat: $container.find('#plan-input-repeat'),
            $repeatType: $container.find('input[name="repeat-type"]'),
            $search: $container.find('#search-btn'),
            $today: $container.find('#search-today')
        };
    };

    showValue = function () {
        $(this).parent().find('output').val($(this).val() + '점');
    };

    onTypeTodo = function (e) {
        zp.modal.initModule(jqueryMap.$container, 'todo', e.data);
    };
    onTypePlan = function (e) {
        zp.modal.initModule(jqueryMap.$container, 'plan', e.data);
    };
    onTypeDday = function (e) {
        zp.modal.initModule(jqueryMap.$container, 'dday', e.data);
    };
    onOffline = function () {
        $.gevent.publish('zp-offline', []);
        jqueryMap.$container.hide();
    };

    onClickClose = function () {
        jqueryMap.$container.empty().hide();
    };

    onClickBack = function () {
        zp.modal.initModule(jqueryMap.$container, 'login');
    };

    onFindPw = function () {
        zp.modal.initModule(jqueryMap.$container, 'findpw');
    };

    onValidateEmail = function (e) {
        e.preventDefault();
        var data = {
            email: jqueryMap.$findEmailForm.find('#findpw-email').val()
        };
        $.post('/findid', data, function (result) {
            if (result) {
                jqueryMap.$findPwForm.show();
                jqueryMap.$findPwForm.find('#findpw-qst').html(result.qst);
                jqueryMap.$findPwForm.find('#findpw-email2').val(data.email);
                alert('아이디가 있습니다.');
            } else {
                alert('아이디가 없습니다.');
            }
        });
        return false;
    };

    onValidateAnswer = function (e) {
        e.preventDefault();
        var data = {
            email: jqueryMap.$findEmailForm.find('#findpw-email').val(),
            ans: jqueryMap.$findPwForm.find('#findpw-ans').val()
        };

        $.post('/findpw', data, function (result) {
            alert(JSON.stringify(result));
            if (result) {
                jqueryMap.$findPwResult.html(result.pw);
            } else {
                alert('답이 틀렸습니다.');
            }
        }).fail(function (xhr) {
            alert(xhr.responseText);
        });
        return false;
    };

    onClickJoin = function () {
        zp.modal.initModule(jqueryMap.$container, 'join');
    };

    onCheckEmail = function (e) {
        var email = $(e.target).prev().val(),
            result;
        if (email === '') {
            alert('이메일을 입력해주세요.');
            return false;
        }
        if (!checkRegEmail(email)) {
           return false;
        }
        result = zp.model.checkEmail(email);
        result.fail(function(err) {
            alert('이미 사용하고 있는 이메일입니다.', err);
            return false;
        });
        result.done(function (data) {
            console.log(data);
           alert('사용하셔도 좋습니다!');
            $('#join-agree').removeAttr('disabled');
        });
    };

    checkRegEmail = function (e) {
        var reg_email = /^[\-A-Za-z0-9_]+[\-A-Za-z0-9_.]*@[\-A-Za-z0-9_]+[\-A-Za-z0-9_.]*\.[A-Za-z]{2,5}$/,
            email = e.hasOwnProperty('data') ? e.data.value.val() : e;
        if (e.hasOwnProperty('data') && email === '') { // 블러로 접근하고 빈칸일 때
            return false;
        }
        if (typeof email !== 'string' || email === '') { //
            alert('이메일이 문자열이 아니거나 빈칸입니다.');
            return false;
        }
        if (email.search(reg_email) === -1) {
            alert('이메일 형식에 맞지 않습니다.');
            return false;
        }
        return true; // button 이벤트로 발생한 경우
    };

    onJoin = function (e) {
        e.preventDefault();
        var $email = $('#join-email'),
            $name = $('#join-name'),
            $pw = $('#join-pw'),
            $pwc = $('#join-pwc'),
            $qst = $('#join-qst'),
            $ans = $('#join-ans'),
            $agree = $('#join-agree'),
            data = {
                _id: $email.val(),
                pw: $pw.val(),
                name: $name.val(),
                qst: $qst.val(),
                ans: $ans.val(),
                avatar: 'z'
            },
            result;
        if (!$email.val()) {
            alert('이메일을 입력해주세요.');
            $email.focus();
            return false;
        }
        if (!$name.val()) {
            alert('닉네임을 입력해주세요.');
            $name.focus();
            return false;
        }
        if (!$pw.val()) {
            alert('비밀번호를 입력해주세요.');
            $pw.focus();
            return false;
        }
        if (!$qst.val()) {
            alert('질문을 입력해주세요.');
            $qst.focus();
            return false;
        }
        if (!$ans.val()) {
            alert('답변을 입력해주세요.');
            $ans.focus();
            return false;
        }
        if ($pw.val() !== $pwc.val()) {
            alert('비밀번호 확인이 일치하지 않습니다.');
            $pw.focus();
            return false;
        }
        if ($agree.prop('disabled')) {
            alert('중복확인을 해주세요.');
        }
        if (!$agree.is(':checked')) {
            alert('약관에 동의하셔야 합니다.');
            $agree.focus();
            return false;
        }
        result = zp.model.join(data);
        result.done(function (res) {
            console.log(res);
            alert('회원이 되신 것을 축하드립니다!');
        });
        result.fail(function (err) {
            console.log(err);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        });
    };

    onLogin = function (e) {
        e.preventDefault();
        var
            $login_input = $(this).parent().prev(),
            $input_email = $login_input.find('#login-email'),
            $input_pw = $login_input.find('#login-pw'),
            email = $input_email.val(), pw = $input_pw.val(), data, result;
        if (email.trim() === '') {
            alert('아이디를 입력해주십시오.');
            $input_email.focus();
        } else if (pw.trim() === '') {
            alert('비밀번호를 입력해주십시오.');
            $input_pw.focus();
            return false;
        }
        if (!checkRegEmail(email)) {
            $input_email.focus();
            return false;
        }
        data = {
            email: email,
            pw: pw
        };
        result = zp.model.login(data);
        result.done(function (data) {
            alert('로그인 성공!');
            jqueryMap.$container.hide();
            $.gevent.publish('login', [data]);
            if (confirm('서버의 데이터와 동기화하시겠습니까?')) {
                zp.model.sync(email);
            }
        });
        result.fail(function (err) {
            alert(err);
            $input_email.empty().focus();
            $input_pw.empty();
            return false;
        });
    };

    onRepeat = function () {
        $(this).next().toggle();
    };

    onToggleRepeatType = function () {
        var $weekBox = $('.plan-repeat-everyweek'),
            $checkboxDay = $weekBox.find('input[name=repeat-day]');
        if ($(this).val() === 'everyday') {
            $checkboxDay.prop('checked', true);
            $weekBox.hide();
        } else if ($(this).val() === 'everyweek') {
            $checkboxDay.prop('checked', false);
            $weekBox.show();
        }
    };

    onSetStartdate = function () {
        var $enddate = $(this).next('.plan-input-enddate');
        if ($enddate.val() === '') {
            $enddate.val($(this).val());
        }
    };

    onSearch = function (e) {
        e.preventDefault();
        var
            date_str = $(this).prev('#search-date').val(),
            year, month, date;
        if (!date_str) {
            alert('날짜를 입력하세요');
            return true;
        }
        year = date_str.substr(0, 4);
        month = date_str.substr(5, 2);
        date = date_str.substr(8, 2);
        if (date === '' || date === '00') {
            if (month === '' || month === '00') {
                configMap.set_cur_anchor('year', year);
            } else {
                configMap.set_cur_anchor('month', year + month);
            }
        } else {
            configMap.set_cur_anchor('day', year + month + date);
        }
        jqueryMap.$container.empty().hide();
    };

    toToday = function (e) {
        e.preventDefault();
        var date_str, month, date;
        month = configMap.today.month;
        date = configMap.today.date;
        if (month < 10) {
            month = '0' + month;
        }
        if (date < 10) {
            date = '0' + date;
        }
        date_str = String(configMap.today.year) + month + date;
        configMap.set_cur_anchor('day', date_str);
        jqueryMap.$container.empty().hide();
    };

    onSubmitTodo = function (e) {
        e.preventDefault();
        var
            $input = $(this).parent().prev(),
            date = $input.find('#todo-input-date').val(),
            time = $input.find('#todo-input-time').val(),
            text = $input.find('#todo-input-text').val(),
            nodue = $input.find('#todo-input-nodue').is(':checked'),
            data, result;
        if (date === "" || time === "" || text === "") {
            alert('빈칸이 있습니다.');
            return false;
        }
        if (nodue === true) {
            date = 'nodue';
            time = 'nodue';
        }

        data = {
            _id: new Date(date + ' ' + time).getTime(),
            date: date,
            time: time,
            text: text,
            done: false,
            type: 'todo'
        };
        result = zp.model.setTodo(data);
        result.done(function () {
            jqueryMap.$container.empty().hide();
            console.log('successfully submit todo', result);
            $.gevent.publish('submit', ['todo']);
        });
        result.fail(function () {
            alert('error!');
        });
    };

    onSubmitPlan = function () {
        var
            $input = $(this).parent().prev(),
            startdate = $input.find('#plan-input-startdate').val(),
            starttime = $input.find('#plan-input-starttime').val(),
            enddate = $input.find('#plan-input-enddate').val(),
            endtime = $input.find('#plan-input-endtime').val(),
            text = $input.find('.plan-input-text').val(),
            data, i, data_list, repeat = {}, date, month, day, result;

        if (startdate === '' || text === '') {
            alert('빈칸이 있습니다');
            return false;
        }
        if (!enddate) {
            date = new Date(startdate + ' ' + starttime);
            date.setHours(date.getHours() + 1);
            month = ('0' + (date.getMonth() + 1)).slice(-2);
            day = ('0' + date.getDate()).slice(-2);
            enddate = date.getFullYear() + '-' + month + '-' + day;
            endtime = date.getHours() + ':' + date.getMinutes();
        }
        data = {
            _id: new Date(startdate + ' ' + starttime).getTime(),
            startdate: startdate,
            starttime: starttime,
            enddate: enddate,
            endtime: endtime,
            text: text,
            type: 'plan'
        };
        console.log(data);
        result = zp.model.setPlan(data);
        result.done(function () {
            if ($input.find('#plan-input-repeat').is(':checked')) { // 반복이 있을 시
                repeat = {
                    num: $input.find('.plan-input-number').val(),
                    lastdate: $input.find('.plan-input-lastdate').val()
                };
                repeat.day = $input.find('input[name="repeat-day"]:checked').map(function () {
                    return $(this).val();
                }).get();
                data.num = repeat.num;
                data.lastdate = repeat.lastdate;
                data.day = repeat.day;
                data_list = zp.plan.calculate(data);
                for (i = 0; i < data_list.length; i++) {
                    zp.model.setPlan(data_list[i]);
                }
            }
            jqueryMap.$container.empty().hide();
        });
        return false;
    };

    onSubmitDday = function () {
        var
            $input = $(this).parent().prev(),
            target = $input.find('.dday-input-target').val(),
            text = $input.find('.dday-input-text').val(),
            data, result;
        if (target === '' || text === '') {
            alert('빈칸이 있습니다');
            return false;
        }
        data = {
            _id: new Date(target).getTime(),
            target: target,
            text: text,
            type: 'dday'
        };
        result = zp.model.setDday(data);
        result.done(function () {
            jqueryMap.$container.empty().hide();
            $.gevent.publish('submit', ['dday']);
            console.log('dday registered', result);
        });
        result.fail(function (err) {
            alert('error');
        });
        return false;
    };

    configModule = function (input_map) {
        zp.util.setConfigMap({
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
        });
    };

    initModule = function ($container, state, data) {
        if (typeof state !== 'string') {
            throw "initModule argument type error";
        }
        if (state === '') {
            state = 'login';
        }
        $container.load('/html/zp.modal.html #modal-' + state, function () {
            stateMap.$container = $container;
            setJqueryMap($container);
            if (data && (state === 'todo' || state === 'plan' || state === 'dday')) {
                var data_str;
                data.month = (data.month < 10) ? ('0' + data.month) : data.month;
                data.date = (data.date < 10) ? ('0' + data.date) : data.date;
                data_str = data.year + '-' + data.month + '-' + data.date;
                data.time = (data.time.length === 4) ? '0' + data.time : data.time;
                if (state === 'todo') {
                    $container.find('#todo-input-date').val(data_str);
                    $container.find('#todo-input-time').val(data.time);

                } else if (state === 'plan') {
                    $container.find('#plan-input-startdate').val(data_str);
                    $container.find('#plan-input-starttime').val(data.time);
                } else if (state === 'dday') {
                    $container.find('.dday-input-target').val(data_str);
                }
            }
            $(document).on('blur', '#login-email', {value: $(this).find('#login-email')}, checkRegEmail);
            jqueryMap.$close.on('click', onClickClose);
            jqueryMap.$login.on('click', onLogin);
            jqueryMap.$repeat.on('click', onRepeat);
            jqueryMap.$todo.on('click', data, onSubmitTodo);
            jqueryMap.$plan.on('click', data, onSubmitPlan);
            jqueryMap.$dday.on('click', data, onSubmitDday);
            jqueryMap.$plan.prev().find('.plan-input-startdate').on('change', onSetStartdate);
            jqueryMap.$container.find('#todo-input-score').on('input', showValue);
            jqueryMap.$typeTodo.on('click', data, onTypeTodo);
            jqueryMap.$typePlan.on('click', data, onTypePlan);
            jqueryMap.$typeDday.on('click', data, onTypeDday);
            jqueryMap.$join.on('click', onClickJoin);
            jqueryMap.$back.on('click', onClickBack);
            jqueryMap.$joinSbmt.on('click', onJoin);
            jqueryMap.$checkEmailBtn.on('click', onCheckEmail);
            jqueryMap.$findpw.on('click', onFindPw);
            jqueryMap.$findEmailBtn.on('click', onValidateEmail);
            jqueryMap.$findPwBtn.on('click', onValidateAnswer);
            jqueryMap.$offline.on('click', onOffline);
            jqueryMap.$search.on('click', onSearch);
            jqueryMap.$today.on('click', toToday);
            jqueryMap.$repeatType.on('change', onToggleRepeatType);
            return $container;
        });
        return $container;
    };

    return {
        configModule: configModule,
        initModule: initModule
    };
}());