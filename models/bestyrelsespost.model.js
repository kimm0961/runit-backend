const mongoose = require('mongoose');


const bestyrelsespostSchema = new mongoose.Schema({
    post: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Bestyrelsespost', bestyrelsespostSchema, 'bestyrelsespost')