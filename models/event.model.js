const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({

    titel: {
        type: String,
        required: true
    },
    dato: {
        type: Date
    },
    beskrivelse: {
        type: String
    },
    distance: {
        type: Number
    },
    pris: {
        type: Number
    }, 
    billede: {
        type: String
    },
    antalpladser: {
        type: Number
    },
    region: {
        type: mongoose.Schema.ObjectId,
        ref: 'Region'
    }
})


module.exports = mongoose.model('Event', eventSchema, 'event')