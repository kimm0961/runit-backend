const mongoose = require('mongoose');


const regionSchema = new mongoose.Schema({
    regionnavn: {
        type: String,
        // required: true
    }
})


module.exports = mongoose.model('Region', regionSchema, 'region')