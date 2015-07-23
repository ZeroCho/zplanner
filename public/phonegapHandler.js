var phonegapHandler = {
	initialize: function () {
		$(document).on('deviceready', this.onDeviceready);
	},
	onDeviceready: function () {
		var db = new PouchDB('local');
		navigator.splashscreen.show();
		db.info(function(err, res) {
			console.log(err);
			console.log(res);
		});
		setTimeout(function() {
			navigator.splashscreen.hide();
		}, 3000);
		cordova.plugins.notification.local.on("click", function (notification) {
			zp.model.updateItem(notification.id, {
				alarm: false
			});
		});
	}
};