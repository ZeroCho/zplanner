/*
 * zp.util.js
 * 범용 자바스크립트 유틸리티
 *
 * Michael S. Mikowski - mmikowski at gmail dot com
 * 웹에서 영감을 받아 1998년부터 계속해서 
 * 작성, 컴파일, 수정한 루틴이다.
 *
 * MIT License 
 *
 */

 /*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, zp */

zp.util = (function () {
	var makeError, setConfigMap;

	// public 생성자 /makeError/ 시작
	// 목적	: 에러 객체 생성을 위한 편의 래퍼
	// 인자	:
	//	* name_text – 에러명
	//	* msg_text – 상세 에러 메시지
	//	* data – 선택적으로 에러 객체에 첨부할 데이터
	// 반환값	: 새로 생성한 에러 객체 
	// 예외 	: 없음
	//
	makeError = function ( name_text, msg_text, data ) {
    	var error = new Error();
		error.name = name_text;
 		error.message = msg_text;
 
 		if ( data ){ error.data = data; }
 
 		return error;
 	};
	// public 생성자 /makeError/ 끝

	// public 메서드 /setConfigMap/ 시작
	// 목적	: 기능 모듈에서 설정을 지정하기 위한 공통 코드 
	// 인자	:
	//	* input_map – 설정에서 지정할 키-값 맵 
	//	* settable_map – 설정 가능한 키 맵
	//	* config_map – 설정을 적용할 맵
	// 반환값	: true
	// 예외 	: 입력 키가 허용되지 않은 키이면 예외를 던짐
	//
	setConfigMap = function ( arg_map ){
    	var
	        input_map = arg_map.input_map,
	        settable_map = arg_map.settable_map,
	        config_map = arg_map.config_map,
	        key_name, error;
        
        for ( key_name in input_map ){
        	if ( input_map.hasOwnProperty( key_name ) ){
            	if ( settable_map.hasOwnProperty( key_name ) ){
                	config_map[key_name] = input_map[key_name];
            	}
            	else {
            		error = makeError( 'Bad Input',
                		'Setting config key |' + key_name + '| is not supported'
                	);
                	throw error;
            	}
        	}
    	}
	};
	// public 메서드 /setConfigMap/ 끝 

	return {
		makeError : makeError,
      	setConfigMap : setConfigMap
  	};
}());
