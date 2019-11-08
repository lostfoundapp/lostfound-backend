const moment = require('moment-timezone')

exports.newDateTime = () => {
    return moment.tz(new Date().toISOString(), "America/Bahia").format('DD/MM/YYYY HH:mm:ss')
}