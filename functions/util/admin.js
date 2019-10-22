const admin = require('firebase-admin')
const serviceAccount = require('../lostandfoundapps-firebase-adminsdk-uuvvr-4062b280a3.json')
require('dotenv').config()
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.URLS,
});

const db = admin.firestore()

module.exports = { admin, db };