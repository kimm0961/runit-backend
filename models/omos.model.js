const mongoose = require('mongoose');


const omosSchema = new mongoose.Schema({
    overskrift: {
        type: String,
        required: true
    },
    beskrivelse: {
        type: String,
        required: true
    },
    billede: {
        type: String
    }
})


module.exports = mongoose.model('Omos', omosSchema, 'omos')