var phonegapHandler = {
	initialize: function () {
		$(document).on('deviceready', function () {
			var db = new PouchDB('loca');
		});
	}
};