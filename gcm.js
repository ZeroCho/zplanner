var gcm = require('node-gcm');
var message = new gcm.Message(),
	regIds = [],
	sender = new gcm.Sender('AIzaSyAWPUKbspucQ2S1_Iqn9_luSu7fN8rDuF8');
// Set up the sender with you API key
message.addData('key1', 'msg1');
regIds.push('APA91bFNUXt95SUZC1sWldsKZXfYczH9eSFi5i_vXSdsXeLa3p1soDAiD0VquGC5cPNFQ-v9HoxrjwX6ckCYP9KHzY-5-evIRESpspNvfBfZYMGl2NOndfeCd9v3y6diiTJYMYOjX020');
//Now the sender can be used to send messages
sender.send(message, regIds, function (err, result) {
	if (err) {
		console.error(err);
	} else {
		console.log(result);
	}
});
sender.sendNoRetry(message, regIds, function (err, result) {
	if (err) {
		console.error(err);
	} else {
		console.log(result);
	}
});