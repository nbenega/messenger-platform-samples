'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');
const { APP_SECRET,VALIDATION_TOKEN,PAGE_ACCESS_TOKEN,SERVER_URL} = require('./global/Variables');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

const app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));



require("./startup/routes")(app);
// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
const server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.export = {
    server,
    PAGE_ACCESS_TOKEN
  };


/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}




/*
 * Get the User Name. The User Id  goes in the URL. If successful, we'll 
 * get the name of the user in a response 
 *
 */



/*event.sender.name = name;
        if (event.optin) {
          receivedAuthentication(event);
        } else if (event.message) {
          receivedMessage(event);
        } else if (event.delivery) {
          receivedDeliveryConfirmation(event);
        } else if (event.postback) {
          receivedPostback(event);
        } else if (event.read) {
          receivedMessageRead(event);
        } else if (event.account_linking) {
          receivedAccountLink(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
*/



