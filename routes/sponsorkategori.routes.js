const Sponsorkategori = require('../models/sponsorkategori.model');

const express = require('express');
const formData = require('express-form-data');              // HVIS der bruges multer et sted så skal denne kun placeres i routes UDEN multer!!!

const router = express.Router();
router.use(formData.parse());                               // nødvendig for at kunne modtage formdata fx 'e.target' fra react/frontend



// ----- HENT/GET ALLE ------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    console.log("HENT ALLE sponsorkategori");

    try {
        const sponsorkategori = await Sponsorkategori.find();

        res.json(sponsorkategori);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});


// ----- HENT/GET UDVALGT sponsorkategori ------------------------------------------------------------------------------------------------------------- 

router.get('/:id', findSponsorkategori, async (req, res) => { //

    console.log("HENT UDVALGT")

    res.json(res.sponsorkategori);

});


// ADMIN ROUTES  -----------------------------------------------------------
// *************************************************************************


// ----- OPRET/POST NY ----------------------------------------------------------------------------------------

router.post('/admin', async (req, res) => {

    console.log("POST sponsorkategori");

    const sponsorkategori = new Sponsorkategori(req.body);

    try {
        const ny = await sponsorkategori.save();
        res.status(201).json({ message: "Ny sponsorkategori er oprettet", sponsorkategori: ny });

    } catch (error) {
        res.status(400).json({ message: "Der er sket en fejl", error: error });
    }

});



// ----- SLET/DELETE ------------------------------------------------------------------------------------------------------------- 

router.delete('/admin/:id', findSponsorkategori, async (req, res) => {

    console.log("DELETE sponsorkategori")

    try {

        await res.sponsorkategori.remove();
        res.status(200).json({ message: 'sponsorkategori er nu slettet' })

    } catch (error) {
        res.status(500).json({ message: 'sponsorkategori kan ikke slettes - der er opstået en fejl: ' + error.message })
    }



});



// ----- RET/PUT ------------------------------------------------------------------------------------------------------------- 

router.put('/admin/:id', findSponsorkategori, async (req, res) => {

    console.log("PUT sponsorkategori")

    try {

        // Husk at id ikke er med i req.body - derfor dur det ikke med res.gaade = req.body;
        res.sponsorkategori.kategori = req.body.kategori;

        await res.sponsorkategori.save();
        res.status(200).json({ message: 'sponsorkategori er rettet', rettetsponsorkategori: res.sponsorkategori });

    } catch (error) {
        res.status(400).json({ message: 'sponsorkategori kan ikke rettes - der er opstået en fejl: ' + error.message })
    }

});



// MIDDLEWARE 
// FIND UD FRA ID  ---------------------------------------------------------------------------------------------

async function findSponsorkategori(req, res, next) {

    console.log("FIND UD FRA ID", req.params.id)
    let sponsorkategori;

    try {

        sponsorkategori = await Sponsorkategori.findById(req.params.id);

        if (sponsorkategori == null) {
            return res.status(404).json({ message: 'Ingen sponsorkategori med den ID' });
        }


    } catch (error) {

        console.log(error);
        return res.status(500).json({ message: "Problemer: " + error.message }); // problemer med server
    }

    res.sponsorkategori = sponsorkategori; // put det fundne ind i responset
    next();
}


module.exports = router;