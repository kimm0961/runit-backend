const mongoose = require('mongoose');


const sponsorkategoriSchema = new mongoose.Schema({
    kategori: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('Sponsorkategori', sponsorkategoriSchema, 'sponsorkategori')