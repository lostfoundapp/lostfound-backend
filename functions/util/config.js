require('dotenv').config()
module.exports = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.URL,
    databaseURL: process.env.URLS,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGE,
    messagingSenderId: process.env.MSGSENDER,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID
  };
