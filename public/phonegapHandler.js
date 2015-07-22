var phonegapHandler = {
	initialize: function () {
		$(document).on('deviceready', this.onDeviceready);
	},
	onDeviceready: function () {
		var db = new PouchDB('local');
		db.info(function(err, res) {
			console.log(err);
			console.log(res);
		});
		setTimeout(function() {
			navigator.splashscreen.hide();
		}, 2000);
	}
};