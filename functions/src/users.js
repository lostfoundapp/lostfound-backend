require('dotenv').config()
const nodemailer = require('nodemailer')
const { db } = require('../util/admin')
const dateTime = require('../util/dateTime')
const config = require('../util/config')
const firebase = require('firebase')
firebase.initializeApp(config)

const { validateSignupData, validateLoginData } = require('../util/validators')

exports.signup = (req, res) => {

    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        phone: req.body.phone
    }

    const { valid, errors } = validateSignupData(newUser)
    if (!valid) return res.status(400).json(errors)

    //TODO: Validate data
    let token, userId
    db
        .collection('Users')
        .where('phone', '==', newUser.phone)
        .get()
        .then((doc) => {
            if (!doc.empty) {                
                return res.status(400).json({ message: 'This phone is already in use'})                
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
                .then((data) => {
                    userId = data.user.uid
                    return data.user.getIdToken()
                })
                .then((idToken) => {
                    token = idToken
                    const userCredentials = {
                        name: newUser.name,
                        email: newUser.email,
                        phone: newUser.phone,
                        datetime: dateTime.newDateTime(),
                        token,
                        userId
                    }
                    return db.doc(`/Users/${userId}`).set(userCredentials)
                })
                .then(() => {
                    return res.status(201).json({ message: "Success" })
                })
                .catch((err) => {
                    if (err.code === 'auth/email-already-in-use') {
                        return res.status(400).json({ message: 'Email is already in use' })
                    } else {
                        console.error(err)
                    }
                })
            }       
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code })
        })
}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }
    let users = {}
    let dataUser
    const { valid, errors } = validateLoginData(user)
    if (!valid) return res.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            dataUser = data
            return data.user.getIdToken()
        })
        .then(token => {
            //console.log(dataUser.user.uid)
            return db.collection(`/Users`).doc(dataUser.user.uid).update({
                token: token
            })
                .then(data => {
                    //console.log(data.user.uid)
                    //return data.user.getIdToken()
                    return db.collection(`/Users`).doc(dataUser.user.uid)
                        .get()
                        .then((doc) => {
                            if (doc.exists) {
                                users = doc.data()
                                return res.status(201).json({ error: false, message: "Logado", users: users })
                            } else {
                                return res.status(404).json({ message: 'User not found' });
                            }

                        })
                })

        })
        .catch((err) => {
            console.log(err)
            if (err.code === 'auth/wrong-password') {
                return res.status(403)
                    .json({ message: 'Wrong credentials try again' })
            } else return res.status(500).json({ message: err.code })
        })
}

exports.verificationEmail = (req, res) => {
    const newVerification = {

        email: req.body.email,
        code: Math.round(Math.random() * 1000000).toString()
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    let mailOptions = {
        from: process.env.EMAIL,
        to: newVerification.email,
        subject: 'Email Verification Code.',
        text: `This is your verification code ${newVerification.code}.`
    }

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) return res.status(400).json({ message: "Error sending email", err })
        else {
            return db.doc(`/Verification/${newVerification.email}`)
                .get()
                .then(() => {
                    const userVerification = {
                        email: newVerification.email,
                        code: newVerification.code,
                        datetime: dateTime.newDateTime()
                    }
                    return db.doc(`/Verification/${userVerification.email}`).set(userVerification)

                })
                .then(() => {
                    return res.status(201).json({ message: "Success..." })
                })
        }
    })
}


exports.verificationCode = (req, res) => {
    db
        .collection('Verification')
        .doc(req.params.email)
        .get()
        .then(data => {

            return res.json({ code: data.data().code })
        })
        .catch(err => console.error(err))
}


exports.forgotPassword = (req, res) => {


    const email = req.body.email


    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            return res.status(201).json({ message: "Email sent" })
        })
        .catch((err) => {
            return res.status(400).json({ message: "Failed to send email ", err })
        })
}