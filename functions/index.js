'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://pwfridge-89b1d.firebaseio.com'
});

const firestore = admin.firestore();
/**
 * Triggers when a user gets a new follower and sends a notification.
 *
 * Followers add a flag to `/followers/{followedUid}/{followerUid}`.
 * Users save their device notification tokens to `/users/{followedUid}/notificationTokens/{notificationToken}`.
 */

exports.sendExpiryNotification = functions.firestore.document('fridges/{userUid}/products/{productId}').onCreate(event=>{
	const product = event.data.data();
	const userUid = event.params.userUid;

	var daysLeftToExpiry = Math.ceil((product.expiryDate - new Date()) / (1000 * 3600 * 24));
	if(daysLeftToExpiry>2){
		return;
	}

	const getUserSettings = firestore.doc("user-settings/"+userUid).get();

	return Promise.all([daysLeftToExpiry, getUserSettings, product]).then(results => {
		const daysLeft = results[0];
		const userTokens = results[1].data().notificationTokens;
		const product = results[2];

	    // Notification details.
	    var payload = {
	      notification: {
	        title: 'You have an expiring product',
	        body: `${product.name} will expire in ${daysLeft} day${daysLeft>1?"s":""}`
	      }
	    };

	    if(daysLeft<1){
	    	payload.notification.title = "A product has expired";
	    	payload.notification.body = `${product.name} has expired`;
	    }

	    return admin.messaging().sendToDevice(userTokens, payload).catch(function(err){
	    	console.log("error sending: "+err);
	    });

	});
});
