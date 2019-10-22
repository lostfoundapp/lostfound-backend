const { admin, db } = require('./admin')

module.exports = (req, res, next) => {
    let idToken
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]
    }else{
        return res.status(403).json({ error: 'Unauthorized'})
    }

    admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
        req.user = decodedToken
        return db.collection('Users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get()
    })
    .then((data) => {
        req.user.name = data.docs[0].data().name
        req.user.userId = data.docs[0].data().userId
        return next()
    })
    .catch((err)=> {
        return res.status(403).json(err)
    })
}
