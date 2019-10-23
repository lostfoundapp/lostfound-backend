const functions = require('firebase-functions')
const bodyParser = require('body-parser')
//const serviceAccount = require('./lostandfoundapps-firebase-adminsdk-uuvvr-4062b280a3.json')

const app = require('express')()

const FBAuth = require('./util/fbAuth')
const { getAllPosts, postOnePost } = require('./src/posts')
const { signup, login, verificationEmail, verificationCode, forgotPassword } = require('./src/users')
const { getPoliceStations, getPoliceStation } = require('./src/policeStations')


//const firebase = require('firebase')

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://lostandfoundapps.firebaseio.com"
// });


//firebase.initializeApp(config)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.get('/getPosts', getAllPosts)
app.post('/createPost', FBAuth, postOnePost)
app.post('/signup', signup)
app.post('/login', login)
app.post('/verificationEmail', verificationEmail)
app.get('/verificationCode/:email', verificationCode)
app.post('/forgotPassword', forgotPassword)
app.get('/getPoliceStations', getPoliceStations)
app.get('/getPoliceStation/:id', getPoliceStation)


exports.api = functions.https.onRequest(app)