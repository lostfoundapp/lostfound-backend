const format = require('date-format')
const config = require('../util/config')
const { admin, db } = require('../util/admin')

const BusBoy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')


exports.getAllPosts = (req, res) => {

    db
        .collection('Posts')
        .orderBy('datetime', 'desc')
        .get()
        .then((data) => {
            let posts = []
            let qtd = data.size
            let status
            console.log(req.query.status)
            data.forEach(doc => {
                return db.collection(`PoliceStations`).doc(`${doc.data().policeStationId}`)
                    .get()
                    .then((dt) => {
                        qtd--
                        status = doc.data().statusId
                        if(status == "1")
                            status = "Aguardando"
                        else if(status == "2")
                            status = "Valido" 
                        else status = "Recusado"       
                         
                       if(status == req.query.status) posts.push({
                            post_id: doc.id,
                            image: doc.data().image,
                            userId: doc.data().userId,
                            name: doc.data().name,
                            description: doc.data().description,
                            datetime: doc.data().datetime,
                            statusId: status,
                            police: dt.data()
                        })
                        if (qtd == 0) return res.json({ posts })
                    })
                    .catch(err => console.error(err))
            })
        })
        .catch(err => console.error(err))
}


exports.postOnePost = (req, res) => {

    const busboy = new BusBoy({ headers: req.headers })

    let imageFileName
    let imageToBeUploaded = {}
    let imageUrl


    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        const imageExtension = filename.split('.')[filename.split('.').length - 1]
        imageFileName = `${Math.round(Math.random() * 100000000000).toString()}.${imageExtension}`

        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = { filepath, mimetype }
        file.pipe(fs.createWriteStream(filepath))

    })

    busboy.on('finish', () => {
        admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
            .then((image) => {
                image = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`

                imageUrl = image

                //console.log(req.headers)
                const newPost = {
                    userId: req.user.userId,
                    name: req.user.name,
                    image: imageUrl,
                    description: req.headers.description,
                    policeStationId: req.headers.police_station_id, //coloquei separado assim porque no header não ta pegando letra maiuscula (apagar esse comentario)
                    datetime: format("dd/MM/yyyy hh:mm:ss", new Date()),
                    statusId: "1"
                }

                return db.collection('Posts')
                    .add(newPost)
                    .then((doc) => {
                        const resPost = newPost;
                        resPost.PostId = doc.id;
                        return res.json(resPost);
                        //res.json({ message: `document ${ref.id} created successfully` })
                    })
                    .catch((err) => {
                        return res.status(403).json({ error: 'someting went wrongg' })
                        console.error(err)
                    })

            })
            .catch(err => {
                console.error(err)
                return res.status(500).json({ error: err.code })
            })
    })

    busboy.end(req.rawBody)


}