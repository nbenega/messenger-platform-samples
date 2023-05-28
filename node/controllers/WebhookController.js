const fetch = require("node-fetch"); // Asegúrate de requerir cualquier módulo necesario
const config = require('config');
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN || config.get('pageAccessToken');
let mappingSesion = {};

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
        let name = body.name;
        console.log(body);
        if (name) {
          var session = {};
          session.name = name;
          mappingSesion[senderID] = session;
          console.log("fin");
        }
      } else {
        console.error("Failed calling Get User Name", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  module.exports = { getUserName,mappingSesion };
