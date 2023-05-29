const config = require('config');
const APP_SECRET = process.env.MESSENGER_APP_SECRET || config.get('appSecret');
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN || config.get('validationToken');
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN || config.get('pageAccessToken');
const SERVER_URL = process.env.SERVER_URL || config.get('serverURL');
const URL_CHAT = process.env.URL_CHAT || config.get('urlChat');
const ORG_ID = process.env.ORG_ID || config.get('orgId');
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || config.get('deploymentId');
const BUTTON_ID = process.env.BUTTON_ID || config.get('buttonId');
const USER_AGENT = process.env.USER_AGENT || config.get('userAgent');
const LANGUAGE = process.env.LANGUAGE || config.get('language');
const SCREEN_RESOLUTION = process.env.SCREEN_RESOLUTION || config.get('screenResolution');
const CREATE_SESSION = '/chat/rest/System/SessionId';
const CREATE_VISITOR_SESSION = '/chat/rest/Chasitor/ChasitorInit';
const MESSAGES = '/chat/rest/System/Messages';
let mappingSesion = {};


module.exports = { APP_SECRET,VALIDATION_TOKEN,PAGE_ACCESS_TOKEN,SERVER_URL,URL_CHAT,ORG_ID,DEPLOYMENT_ID,BUTTON_ID,USER_AGENT,LANGUAGE,SCREEN_RESOLUTION,CREATE_SESSION,CREATE_VISITOR_SESSION,MESSAGES,mappingSesion};