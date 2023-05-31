const fetch = require("node-fetch"); // Asegúrate de requerir cualquier módulo necesario
const { PAGE_ACCESS_TOKEN,URL_CHAT,ORG_ID,DEPLOYMENT_ID,BUTTON_ID,USER_AGENT,LANGUAGE,SCREEN_RESOLUTION,CREATE_SESSION,CREATE_VISITOR_SESSION,CHAT_MESSAGE,MESSAGES,PAGE_ID,mappingSesion} = require('../global/Variables');
const SERVER_UNAVAILABLE = 503;
const OK = 200;

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
        console.log("Sesión de chat creada exitosamente");
  
        var session = mappingSesion[senderID];
        if(session){
          session.sessionKey = body.key;
          session.affinityToken = body.affinityToken;
          session.sessionId = body.id;
          session.clientPollTimeout = body.clientPollTimeout;
          session.sequence = 1;
          session.offset = -1;
          session.active = true;
        }
      } else {
        console.error("Failed calling createSFSession", response.status, response.statusText);
        console.log(response);
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
      "prechatDetails": [
        {
          "label": "First Name",
          "value": session.name,
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "Last Name",
          "value": session.name,
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "Email",
          "value": session.username+"@gmail.com",
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "Username",
          "value": session.username,
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "SenderId",
          "value": senderID,
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "issue",
          "value": "Contacto Instagram",
          "transcriptFields":[],
          "displayToAgent": false
        }, {
          "label": "origen",
          "value": "Instagram",
          "transcriptFields":[],
          "displayToAgent": false
        }
      ],  
      "prechatEntities": [
        {
          "entityName": "SocialNetworkUser__c",
          "showOnCreate": true,
          "saveToTranscript": "SocialNetworkUser__c",
          "entityFieldsMaps": [
            {
              "isExactMatch": true,
              "fieldName": "Username__c",
              "doCreate": true,
              "doFind": true,
              "label": "Username"
            },
            {
              "isExactMatch": true,
              "fieldName": "SocialNetwork__c",
              "doCreate": true,
              "doFind": true,
              "label": "origen"
            },
            {
              "isExactMatch": true,
              "fieldName": "UserId__c",
              "doCreate": true,
              "doFind": true,
              "label": "SenderId"
            }
          ]
        },
        {
          "entityName": "Contact",
          "showOnCreate": true,
          "linkToEntityName": "Case",
          "linkToEntityField": "ContactId",
          "linkToEntityName": "SocialNetworkUser__c",
          "linkToEntityField": "ContactId__c",
          "saveToTranscript": "ContactId",
          "entityFieldsMaps": [
            {
              "isExactMatch": true,
              "fieldName": "FirstName",
              "doCreate": true,
              "doFind": true,
              "label": "First Name"
            },
            {
              "isExactMatch": true,
              "fieldName": "LastName",
              "doCreate": true,
              "doFind": true,
              "label": "Last Name"
            },
            {
              "isExactMatch": true,
              "fieldName": "Email",
              "doCreate": true,
              "doFind": true,
              "label": "Email"
            }
          ]
        },
        {
          "entityName": "Case",
          "showOnCreate": true,
          "saveToTranscript": "CaseId",
          "entityFieldsMaps": [
            {
              "isExactMatch": false,
              "fieldName": "Subject",
              "doCreate": true,
              "doFind": false,
              "label": "issue"
            },
            {
              "isExactMatch": false,
              "fieldName": "Origin",
              "doCreate": true,
              "doFind": false,
              "label": "origin"
            }
          ]
        }
      ],
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
        console.log("Sesión de visitante creada exitosamente");
      } else {
        console.error("Failed calling createSFVisitorSession", response.status, response.statusText);
        console.log(response);
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
          "Content-Type": 'application/json',
          "Accept": '*/*',
          "Accept-Encoding": 'gzip, deflate, br',
          "User-Agent": USER_AGENT,
          "Connection": 'keep-alive',
          "X-LIVEAGENT-API-VERSION": 34,
          "X-LIVEAGENT-AFFINITY": session.affinityToken,
          "X-LIVEAGENT-SESSION-KEY": session.sessionKey
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const body = await response;
        console.log("Mensaje enviado al agente correctamente");
      } else {
        console.error("Failed calling chatMessage", response.status, response.statusText);
        console.log(response);
        console.log(JSON.stringify(response));
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

    var options = {
      headers: {
        "X-LIVEAGENT-API-VERSION": 34,
        "X-LIVEAGENT-AFFINITY": session.affinityToken,
        "X-LIVEAGENT-SESSION-KEY": session.sessionKey
      },
      qs: {
        ack: session.offset
      }
    };

    try {
      const response = await fetch(URL_CHAT+MESSAGES, options);
  
      if (response.ok) {
        if(response.status == OK){
          const body = await response.json();
          if(body.sequence){
            session.sequence = body.sequence;
            session.offset = body.sequence;
          }
          body.messages.forEach(async function(message) {
            console.log("Message recibido: %s", message);
            switch (message.type) {
              case 'ChatMessage':
                console.log("Message recibido: %s", JSON.stringify(message));
                await sendIGMessage(message,senderID);
                console.log("Vuelve a escuchar novedades");
                await getSFMessages(senderID);
                break;

              case 'ChatRequestSuccess':// No se vuelve a escuchar novedades para que continué con la ejecuión principal y se envíe el primer mensaje al agente
                break;

              case 'ChatRequestFail':
                session.active = false;
                //TODO: ver que hacer cuando falle el request porque sino cree que envía el mensaje a SF y empieza a escuchar novedades
                break;

              case 'ChatEnded':
                session.active = false;
                break;

              case 'ChasitorSessionData':
                //TODO: tiene que procesarse luego de un ReconnectSession request y no tiene que enviarse nada hasta que se procese este mensaje
                break;

              default:
              console.log("Vuelve a escuchar novedades");
              await getSFMessages(senderID);
            }
          });
        } else {
          console.log("El agente no envió ningún mensaje, status code: %s. Vuelve a escuchar novedades", response.status);
          await getSFMessages(senderID);
        }
      } else {
        console.error("Failed calling getSFMessages", response.status, response.statusText);
        console.log(response);
        if(response.status == SERVER_UNAVAILABLE){
          //TODO: implementar el ReconnectSession y el ChasitorResyncState
        }
        //session.active = false; ¿Podría inactivarse la sesión cuando haya algún error en el getMessages
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

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      console.log("Mensaje enviado a IG exitosamente");
    } else {
      console.error("Failed calling sendIGMessage", response.status, response.statusText);
      console.log(response);
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
