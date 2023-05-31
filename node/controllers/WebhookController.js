const fetch = require("node-fetch"); // Asegúrate de requerir cualquier módulo necesario
const { PAGE_ACCESS_TOKEN,mappingSesion} = require('../global/Variables');

/*
 * Get the User Name. The User Id  goes in the URL. If successful, we'll 
 * get the name of the user in a response 
 *
 */
async function getUserName(senderID) {
    try {
      let response = await fetch(`https://graph.facebook.com/v16.0/${senderID}?fields=name,username&access_token=${PAGE_ACCESS_TOKEN}`);
      if (response.ok) {
        let body = await response.json();
        if (body) {
          var session = {};
          session.name = body.name;
          session.firstName = body.first_name;
          session.lastName = body.last_name;
          session.username = body.username;
          mappingSesion[senderID] = session;
        }
      } else {
        console.error("Failed calling Get User Name", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  module.exports = { getUserName };
