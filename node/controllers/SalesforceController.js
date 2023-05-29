const fetch = require("node-fetch"); // Asegúrate de requerir cualquier módulo necesario
const { PAGE_ACCESS_TOKEN,URL_CHAT,ORG_ID,DEPLOYMENT_ID,BUTTON_ID,USER_AGENT,LANGUAGE,SCREEN_RESOLUTION,CREATE_SESSION,CREATE_VISITOR_SESSION,CHAT_MESSAGE,MESSAGES,PAGE_ID,mappingSesion} = require('../global/Variables');
const { log } = require("console");
const request = require('request');


/*
 * Create a Salesforce Chat Session. If successful, we'll 
 * get the session metadata 
 *
 */
async function createSFSession(senderID) {
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
  
        var session = mappingSesion[senderID];
        
        console.log('mappingSesion[senderID]: %s', mappingSesion[senderID]);
        console.log('session: %s', session);
        if(session){
          session.sessionKey = body.key;
          session.affinityToken = body.affinityToken;
          session.sessionId = body.id;
          session.clientPollTimeout = body.clientPollTimeout;
          session.sequence = 1;
  
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
  
  /*
   * Create a Salesforce Chat Visitor Session. If successful, we'll 
   * get the session metadata 
   *
   */
  async function createSFVisitorSession(senderID) {
    var session = mappingSesion[senderID];
    var data = {
      "organizationId": ORG_ID, 
      "deploymentId": DEPLOYMENT_ID, 
      "buttonId": BUTTON_ID, 
      "sessionId": session.sessionId, 
      "userAgent": USER_AGENT, 
      "language": LANGUAGE, 
      "screenResolution": SCREEN_RESOLUTION, 
      "visitorName": session.name, 
      "prechatDetails": [],  
      "prechatEntities": [], 
      "receiveQueueUpdates": true, 
      "isPost": true 
    };
  
    try {
      const response = await fetch(URL_CHAT+CREATE_VISITOR_SESSION, {
        method: 'POST',
        headers: {
          "X-LIVEAGENT-API-VERSION": 34,
          "X-LIVEAGENT-AFFINITY": session.affinityToken,
          "X-LIVEAGENT-SESSION-KEY": session.sessionKey,
          "X-LIVEAGENT-SEQUENCE": session.sequence
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const body = await response;
        console.log("Sesión creada exitosamente, body: %s", body);
      } else {
        console.log(response);
        console.error("Failed calling createSFSession", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  /*
   * Create a Salesforce Chat Visitor Session. If successful, we'll 
   * get the session metadata 
   *
   */
  async function chatMessage(event) {
    var session = mappingSesion[event.sender.id];
    var data = {
      "text": event.message.text,
    };
  
    try {
      const response = await fetch(URL_CHAT+CHAT_MESSAGE, {
        method: 'POST',
        headers: {
          "X-LIVEAGENT-API-VERSION": 34,
          "X-LIVEAGENT-AFFINITY": session.affinityToken,
          "X-LIVEAGENT-SESSION-KEY": session.sessionKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const body = await response;
        console.log("Mensaje enviado correctamente, body: %s", body);
      } else {
        console.log(response);
        console.log(JSON.stringify(response));
        console.error("Failed calling chatMessage", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  /*
 * Create a Salesforce Chat Session. If successful, we'll 
 * get the session metadata 
 *
 */
async function getSFMessages(senderID) {
    var session = mappingSesion[senderID];

    try {
      const response = await fetch(URL_CHAT+MESSAGES, {
        headers: {
          "X-LIVEAGENT-API-VERSION": 34,
          "X-LIVEAGENT-AFFINITY": session.affinityToken,
          "X-LIVEAGENT-SESSION-KEY": session.sessionKey,
        }
      });
  
      if (response.ok) {
        const body = await response.json();
        console.log("Interaccion de salesforce recibida, body: %s", body);

        body.messages.forEach(async function(message) {
            switch (message.type) {
                case 'ChatMessage':
                    console.log("Message recibido: %s", JSON.stringify(message));
                    await sendIGMessage(message,senderID);
                    getSFMessages(senderID);
                    break;
                case 'ChatEnded':
                    console.log("Message recibido: %s", message);
                    break;
                default:
                  console.log("Message recibido: %s", message);
                  getSFMessages(senderID);
            }
        });
      } else {
        console.log(response);
        console.error("Failed calling getSFMessages", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
}

/*
 * Create a Salesforce Chat Session. If successful, we'll 
 * get the session metadata 
 */

async function sendIGMessage(message, senderID) {
  var data = {
      recipient: {
          id: senderID
      },
      message: {"text": message.message.text}
  };

  var url = `https://graph.facebook.com/v16.0/${PAGE_ID}/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  };

  console.log("armado URL sendIGmessage: %s", JSON.stringify(options));

  try {
      const response = await fetch(url, options);
      if (response.ok) {
          const body = await response.json();
          console.log("Mensaje enviado exitosamente, body: %s", JSON.stringify(body));
      } else {
          console.log(response);
          console.error("Failed calling sendIGMessage", response.status, response.statusText);
      }
  } catch (error) {
      console.error("Error:", error);
  }
}
  

/* USANDO EJEMPLO DE ME
async function sendIGMessage(message, senderID) {
  const data = {
      recipient: {
          id: senderID
      },
      message: {
          text: message.message.text,
          metadata: "DEVELOPER_DEFINED_METADATA"
      }
  };

  const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          console.error("Failed calling Send API", response.status, response.statusText);
          const errorBody = await response.json();
          console.error(errorBody.error);
          return;
      }

      const responseBody = await response.json();
      const recipientId = responseBody.recipient_id;
      const messageId = responseBody.message_id;

      if (messageId) {
          console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
          console.log("Successfully called Send API for recipient %s", recipientId);
      }
  } catch (error) {
      console.error("Error:", error);
  }
}
*/

module.exports = { createSFSession,createSFVisitorSession,chatMessage,getSFMessages };
