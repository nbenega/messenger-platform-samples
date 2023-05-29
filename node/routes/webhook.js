const express = require("express");
const router = express.Router();
const WebhookController = require('../controllers/WebhookController');
const SalesforceController = require('../controllers/SalesforceController');
const { VALIDATION_TOKEN,PAGE_ACCESS_TOKEN,mappingSesion} = require('../global/Variables');


/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
router.get('/webhook', function(req, res) {
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
router.get('/authorize', function(req, res) {
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

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */

router.post('/webhook', async function (req, res) { // <-- Nota el 'async' aquí
    var data = req.body;
  
    // Make sure this is a instagram subscription
    if (data.object == 'instagram') {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach(async function(pageEntry) { // <-- Nota el 'async' aquí
        var sender;
        var session;
        var senderID;
        // Iterate over each messaging event
        pageEntry.messaging.forEach(async function(messagingEvent) { // <-- Nota el 'async' aquí
          senderID = messagingEvent.sender.id;  
          session = mappingSesion[senderID];
          if (session){
              await SalesforceController.chatMessage(messagingEvent);
          } else {
            console.log("Entra al entry");
            await WebhookController.getUserName(senderID);
            console.log('mappingSesion[senderID]: %s', mappingSesion[senderID]);
            await SalesforceController.createSFSession(senderID); 
            console.log('mappingSesion[senderID]: %s', mappingSesion[senderID]);
            await SalesforceController.createSFVisitorSession(senderID);
            console.log("desp del name");
            await SalesforceController.chatMessage(messagingEvent);
          }
          SalesforceController.getSFMessages(senderID);
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
  
module.exports = router;
