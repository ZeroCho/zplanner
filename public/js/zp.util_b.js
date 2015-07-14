/**
 * zp.util_b.js
 * 자바스크립트 브라우저 유틸리티 
 *
 * Michael S. Mikowski가 컴파일
 * 웹에서 영감을 얻어
 * 1998년부터 작성하고 수정한 루틴
 * MIT 라이선스
 */

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/

/*global $, zp, getComputedStyle */
zp.util_b = (function () {
    'use strict';
	//---------------- 모듈 스코프 변수 시작-------------- 
	var
		configMap = {
			regex_encode_html 	: /[&"'><]/g,
			regex_encode_noamp 	: /["'><]/g, 
			html_encode_map  	: {
            	'&' : '&#38;',
            	'"' : '&#34;',
            	"'" : '&#39;',
            	'>' : '&#62;',
            	'<' : '&#60;'
			} 
		},
    
    	decodeHtml, encodeHtml, getEmSize;
	
	configMap.encode_noamp_map = $.extend(
    	{}, configMap.html_encode_map
	);
	delete configMap.encode_noamp_map['&']; 
	//----------------- 모듈 스코프 변수 끝---------------

	//------------------- 유틸리티 메서드 시작------------------
	// decodeHtml 시작
	// HTML 엔티티를 브라우저 친화적으로 디코딩한다.
	// http://stackoverflow.com/questions/1912501/\ 
	// unescape-html-entities-in-javascript 참고
	//
	decodeHtml = function ( str ) {
    	return $('<div/>').html(str || '').text();
	};
	// decodeHtml 끝


 	// encodeHtml 시작
	// 모든 HTML 엔티티는 이 인코더를 통과한다. 
	// 이 인코더는 임의 개수의 문자를 처리한다. 
	//
	encodeHtml = function ( input_arg_str, exclude_amp ) {
	    var
			input_str = String( input_arg_str ),
	        regex, lookup_map
			;	
	    
	    if ( exclude_amp ) {
			lookup_map = configMap.encode_noamp_map;
	        regex = configMap.regex_encode_noamp;
		}
		else {
	        lookup_map = configMap.html_encode_map;
	        regex = configMap.regex_encode_html;
	    }
	    return input_str.replace(regex,
	        function (match) {
	            return lookup_map[ match ] || '';
	        }
		); 
	};
	// encodeHtml 끝
	
	// getEmSize 시작
	// em 크기를 픽셀값으로 반환
	//
	getEmSize = function ( elem ) {
		return Number(
    		getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
		);
	};
	// getEmSize 끝

	// 노출 메서드 
	return {
		decodeHtml : decodeHtml,
		encodeHtml : encodeHtml,
		getEmSize : getEmSize
	};
	//------------------- public 메서드 끝 --------------------- 
}());
