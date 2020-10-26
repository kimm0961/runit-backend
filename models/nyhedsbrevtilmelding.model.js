const mongoose = require('mongoose');


const nyhedsbrevtilmeldingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Nyhedsbrevtilmelding', nyhedsbrevtilmeldingSchema, 'nyhedsbrevtilmelding')