const Adminbruger = require('../models/adminbruger.model');

const express = require('express');
const formData = require('express-form-data');              // HVIS der bruges multer et sted så skal denne kun placeres i routes UDEN multer!!!

const router = express.Router();
router.use(formData.parse());                               // nødvendig for at kunne modtage formdata fx 'e.target' fra react/frontend



// ----- HENT/GET ALLE ------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    console.log("HENT ALLE");

    try {
        const adminbruger = await Adminbruger.find();

        res.json(adminbruger);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i: " + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET UDVALGT  ------------------------------------------------------------------------------------------------------------- 

router.get('/:id', findAdminbruger, async (req, res) => { //

    console.log("HENT UDVALGT")

    res.json(res.adminbruger);

});



// ----- OPRET/POST NY ----------------------------------------------------------------------------------------

router.post('/admin', async (req, res) => {

    console.log("POST", req.body);

    try {

        let adminbruger = await Adminbruger.findOne({ email: req.body.brugernavn })

        if (adminbruger) {

            console.log("Adminbrugernavn findes i forvejen = kan ikke oprettes igen")
            return res.status(401).json({ message: "Adminbrugeren findes allerede (OBS - denne besked skal laves om - GDPR!" })

        } else {

            console.log("Adminbruger findes IKKE i forvejen")
            adminbruger = new Adminbruger(req.body);
            const nyadminbruger = await adminbruger.save();
            res.status(201).json({ message: "Ny adminbruger er oprettet", nybruger: nyadminbruger });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Der er sket en fejl", error: error.message });
    }

});



// ----- SLET/DELETE ------------------------------------------------------------------------------------------------------------- 

router.delete('/admin/:id', findAdminbruger, async (req, res) => {
    console.log("DELETE")

    try {

        await res.adminbruger.remove();
        res.status(200).json({ message: 'Adminbruger er nu slettet' })

    } catch (error) {
        res.json(500).json({ message: 'Adminbruger kan ikke slettes - der er opstået en fejl: ' + error.message })
    }

});



// ----- RET/PUT ------------------------------------------------------------------------------------------------------------- 

router.put('/admin/:id', findAdminbruger, async (req, res) => {

    console.log("PUT")

    try {

        res.adminbruger.brugernavn = req.body.brugernavn;
        res.adminbruger.password = req.body.password;

        await res.adminbruger.save();
        res.status(200).json({ message: 'Adminbruger er rettet', rettetadminbruger: res.adminbruger });

    } catch (error) {
        res.status(400).json({ message: 'Adminbruger kan ikke rettes - der er opstået en fejl: ' + error.message })

    }

});



// MIDDLEWARE 

// FIND FRA ID  ---------------------------------------------------------------------------------------------

async function findAdminbruger(req, res, next) {

    console.log("FIND UD FRA ID", req.params.id)
    let adminbruger;

    try {

        adminbruger = await Adminbruger.findById(req.params.id);

        if (adminbruger == null) {
            return res.status(404).json({ message: 'Der findes ikke en bruger med den ID' });
        }


    } catch (error) {

        console.log(error);
        return res.status(500).json({ message: "Problemer: " + error.message }); // problemer med server
    }

    res.adminbruger = adminbruger; // put det fundne ind i responset
    next();
}


module.exports = router;
