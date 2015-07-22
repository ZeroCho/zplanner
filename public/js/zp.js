/*
 * zp.js
 * 루트 네임스페이스 모듈 
 */

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/

/*global $, zp */

var zp = (function () {
	'use strict';
	var initModule = function ($container) {
		//zp.data.initModule();
		zp.model.initModule();
		zp.shell.initModule($container);
	};
	return {
		initModule: initModule
	};
}());
$(function () {
	zp.initModule($('#zplanner'));
});