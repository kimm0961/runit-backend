const mongoose = require('mongoose');


const bestyrelseSchema = new mongoose.Schema({
    fornavn: {
        type: String,
        required: true
    },
    efternavn: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    beskrivelse: {
        type: String,
        required: true
    },
    billede: {
        type: String,
        required: true
    },
    bestyrelsespost: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bestyrelsespost'
    }
})


module.exports = mongoose.model('Bestyrelse', bestyrelseSchema, 'bestyrelse')