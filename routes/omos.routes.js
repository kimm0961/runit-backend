const Omos = require('../models/omos.model');

const express = require('express');
const router = express.Router();


// Multer middleware (upload-const skal ligge FØR de funktioner som kalder den (POST og PUT))
// Multer igonrer denne hvis der ikke er en fil med - ingen fejl eller noget - fortsætter bare og returnerer ingen file/filename (hurra aht patch/put!)
const multer = require('multer');
const upload = multer({

    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/omos');
        },
        filename: function (req, file, cb) {
            //cb(null, Date.now() + '-' + file.originalname)
            cb(null, file.originalname)
        }
    })
});



// ----- HENT/GET ALLE ------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    console.log("HENT ALLE omos");

    try {
        const omos = await Omos.find();

        res.json(omos);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET UDVALGT omos ------------------------------------------------------------------------------------------------------------- 

router.get('/:id', findOmos, async (req, res) => { //

    console.log("HENT UDVALGT")

    res.json(res.omos);

});



// ADMIN ROUTES  -----------------------------------------------------------
// *************************************************************************


// ----- OPRET/POST NY ----------------------------------------------------------------------------------------

router.post('/admin', upload.single('billede'), async (req, res) => {

    console.log("POST omos", req.body);

    // Med image-upload fra multer - testes med Postman
    const omos = new Omos(req.body);
    omos.billede = req.file ? req.file.filename : "paavej.jpg";      // filename kommer ikke automatisk med i request

    try {
        const ny = await omos.save();
        res.status(201).json({ message: "Ny omos er oprettet", omos: ny });

    } catch (error) {
        res.status(400).json({ message: "Der er sket en fejl", error: error });
    }

});



// ----- SLET/DELETE ------------------------------------------------------------------------------------------------------------- 

router.delete('/admin/:id', findOmos, async (req, res) => {

    console.log("DELETE omos")

    try {

        await res.omos.remove();
        res.status(200).json({ message: 'omos er nu slettet' })

    } catch (error) {
        res.status(500).json({ message: 'omos kan ikke slettes - der er opstået en fejl: ' + error.message })
    }



});



// ----- RET/PUT ------------------------------------------------------------------------------------------------------------- 

router.put('/admin/:id', upload.single('billede'), findOmos, async (req, res) => {

    console.log("PUT omos", res.overskrift)

    try {

        res.omos.overskrift = req.body.overskrift;
        res.omos.beskrivelse = req.body.beskrivelse;
        res.omos.billede = req.body.billede;
        // fra multer - skal kunne håndtere at billedet måske ikke skal udskiftes
        if (req.file) {
            res.omos.billede = req.file.filename;
        }

        await res.omos.save();
        res.status(200).json({ message: 'omos er rettet', rettetomos: res.omos });

    } catch (error) {
        res.status(400).json({ message: 'omos kan ikke rettes - der er opstået en fejl: ' + error.message })
    }

});



// MIDDLEWARE 
// FIND UD FRA ID  ---------------------------------------------------------------------------------------------

async function findOmos(req, res, next) {

    console.log("FIND UD FRA ID", req.params.id)
    let omos;

    try {

        omos = await Omos.findById(req.params.id);

        if (omos == null) {
            return res.status(404).json({ message: 'Ingen omos med den ID' });
        }


    } catch (error) {

        console.log(error);
        return res.status(500).json({ message: "Problemer: " + error.message }); // problemer med server
    }

    res.omos = omos; // put det fundne ind i responset
    next();
}


module.exports = router;