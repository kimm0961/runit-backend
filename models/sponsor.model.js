const mongoose = require('mongoose');


const sponsorSchema = new mongoose.Schema({
    navn: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    sponsorkategori: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sponsorkategori'
    }
})


module.exports = mongoose.model('Sponsor', sponsorSchema, 'sponsor')