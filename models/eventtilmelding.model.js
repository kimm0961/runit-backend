const mongoose = require('mongoose');


const eventtilmeldingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
    }
})


module.exports = mongoose.model('Eventtilmelding', eventtilmeldingSchema, 'eventtilmelding')