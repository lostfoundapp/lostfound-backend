const config = require('../util/config')
const { admin, db } = require('../util/admin')

exports.getPoliceStations = (req, res) =>{
    db
    .collection('PoliceStations')
    .orderBy('city', 'asc')
    .get()
    .then(data => {
        let policeStations = []
        data.forEach(doc => {
            policeStations.push({
                policeStation_id: doc.id,
                address: doc.data().address,
                city: doc.data().city,
                name: doc.data().name,
                district: doc.data().district
            })    
        })
        return res.json({"PoliceStations":policeStations})
    })
    .catch(err => console.error(err))
}

exports.getPoliceStation = (req, res) => {
    db
    .collection('PoliceStations')
    .doc(req.params.id)
    .get()
    .then(data => {
        let policeStations = []
            policeStations.push({
                //policeStation_id: doc.id,
                address: data.data().address,
                city: data.data().city,
                name: data.data().name,
                district: data.data().district
            })   
            console.log(policeStations)
        return res.json(policeStations)
    })
    .catch(err => console.error(err))
}