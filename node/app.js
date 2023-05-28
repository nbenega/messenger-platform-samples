'use strict';

const bodyParser = require('body-parser');
const config = require('config');
const crypto = require('crypto');
const express = require('express');
const request = require('request');
const fetch = require('node-fetch');

const URL_CHAT = process.env.URL_CHAT || config.get('urlChat');
const APP_SECRET = process.env.MESSENGER_APP_SECRET || config.get('appSecret');
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN || config.get('validationToken');
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN || config.get('pageAccessToken');
const SERVER_URL = process.env.SERVER_URL || config.get('serverURL');

const CREATE_SESSION = '/chat/rest/System/SessionId';

let mappingSesion = {};

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

let app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));


/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});



/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

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
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */

app.post('/webhook', async function (req, res) { // <-- Nota el 'async' aquí
  var data = req.body;

  // Make sure this is a instagram subscription
  if (data.object == 'instagram') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(async function(pageEntry) { // <-- Nota el 'async' aquí
      var sender;
      var session;
      // Iterate over each messaging event
      pageEntry.messaging.forEach(async function(messagingEvent) { // <-- Nota el 'async' aquí
          sender = mappingSesion[messagingEvent.sender.Id];
          if (sender){
            session = sender.session;
          } else {
            console.log("Entra al entry");
            await getUserName(messagingEvent); // <-- Nota el 'await' aquí
            console.log("desp del name");
          }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});


/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response TOBE USED
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}

/*
 * Get the User Name. The User Id  goes in the URL. If successful, we'll 
 * get the name of the user in a response 
 *
 */


async function getUserName(event) {
  var senderID = event.sender.id;
  try {
    let response = await fetch(`https://graph.facebook.com/v16.0/${senderID}?fields=name,username&access_token=${PAGE_ACCESS_TOKEN}`);
    if (response.ok) {
      let body = await response.json();
      let name = body.name;
      console.log(body);
      if (name) {
        var session = {};
        session.name = name;
        mappingSesion[senderID] = session;
        await createSFSession(event);
        console.log("fin");
      }
    } else {
      console.error("Failed calling Get User Name", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

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




//Metodos para Salesforce


/*
 * Get the User Name. The User Id  goes in the URL. If successful, we'll 
 * get the name of the user in a response 
 *
 */
async function createSFSession(event) {
  console.log("event: %s", event);
  try {
    const response = await fetch(URL_CHAT+CREATE_SESSION, {
      headers: {
        "X-LIVEAGENT-API-VERSION": 34,
        "X-LIVEAGENT-AFFINITY": null
      }
    });

    if (response.ok) {
      const body = await response.json();
      console.log("Sesión creada exitosamente, body: %s", body);

      console.log('mappingSession: %s', JSON.stringify(mappingSesion));
      console.log('event.sender.Id: %s', event.sender.Id);

      var session = mappingSesion[event.sender.Id];
      
      console.log('mappingSesion[event.sender.Id]: %s', mappingSesion[event.sender.Id]);
      console.log('session: %s', session);
      if(session){
        session.sessionKey = body.key;
        session.affinityToken = body.affinityToken;
        session.sessionId = body.id;

        console.log('mappingSession: %s', mappingSesion);
      }
    } else {
      console.log(response);
      console.error("Failed calling createSFSession", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

