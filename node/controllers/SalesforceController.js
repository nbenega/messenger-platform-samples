const fetch = require("node-fetch"); // Asegúrate de requerir cualquier módulo necesario
const { URL_CHAT,ORG_ID,DEPLOYMENT_ID,BUTTON_ID,USER_AGENT,LANGUAGE,SCREEN_RESOLUTION,CREATE_SESSION,CREATE_VISITOR_SESSION,CHAT_MESSAGE,mappingSesion} = require('../global/Variables');


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
          "X-LIVEAGENT-SESSION-KEY": session.sessionKey
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const body = await response;
        console.log("Mensaje enviado correctamente, body: %s", body);
      } else {
        console.log(response);
        console.error("Failed calling chatMessage", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  module.exports = { createSFSession,createSFVisitorSession,chatMessage };