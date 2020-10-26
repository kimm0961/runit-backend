const Eventtilmelding = require('../models/eventtilmelding.model');

const express = require('express');
const formData = require('express-form-data');              // HVIS der bruges multer et sted så skal denne kun placeres i routes UDEN multer!!!

const router = express.Router();
router.use(formData.parse());                               // nødvendig for at kunne modtage formdata fx 'e.target' fra react/frontend


// ----- HENT/GET ALLE ------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    console.log("HENT ALLE eventtilmelding");

    try {
        const eventtilmelding = await Eventtilmelding.find().populate('event');
        res.json(eventtilmelding);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET UDVALGT eventtilmelding ------------------------------------------------------------------------------------------------------------- 

router.get('/:id', findEventtilmelding, async (req, res) => { //

    console.log("HENT UDVALGT")

    res.json(res.eventtilmelding);

});




// ----- OPRET/POST NY ----------------------------------------------------------------------------------------
// ----- Kræver ikke admin - brugerne skal kunne poste en eventtilmelding!

router.post('/', async (req, res) => {
    
    console.log("POST eventtilmelding");
    
    const eventtilmelding = new Eventtilmelding(req.body);
    
    try {
        const ny = await eventtilmelding.save();
        res.status(201).json({ message: "Ny eventtilmelding er oprettet", eventtilmelding: ny });
        
    } catch (error) {
        res.status(400).json({ message: "Der er sket en fejl", error: error });
    }
    
});



// ADMIN ROUTES  -----------------------------------------------------------
// *************************************************************************


// ----- SLET/DELETE ------------------------------------------------------------------------------------------------------------- 

router.delete('/admin/:id', findEventtilmelding, async (req, res) => {

    console.log("DELETE eventtilmelding")

    try {

        await res.eventtilmelding.remove();
        res.status(200).json({ message: 'eventtilmelding er nu slettet' })

    } catch (error) {
        res.status(500).json({ message: 'eventtilmelding kan ikke slettes - der er opstået en fejl: ' + error.message })
    }



});



// ----- RET/PUT ------------------------------------------------------------------------------------------------------------- 

router.put('/admin/:id', findEventtilmelding, async (req, res) => {

    console.log("PUT eventtilmelding")

    try {

        // Husk at id ikke er med i req.body - derfor dur det ikke med res.gaade = req.body;
        res.eventtilmelding.email = req.body.email;
        res.eventtilmelding.event = req.body.event;

        await res.eventtilmelding.save();
        res.status(200).json({ message: 'eventtilmelding er rettet', retteteventtilmelding: res.eventtilmelding });

    } catch (error) {
        res.status(400).json({ message: 'eventtilmelding kan ikke rettes - der er opstået en fejl: ' + error.message })
    }

});



// MIDDLEWARE 
// FIND UD FRA ID  ---------------------------------------------------------------------------------------------

async function findEventtilmelding(req, res, next) {

    console.log("FIND UD FRA ID", req.params.id)
    let eventtilmelding;

    try {

        eventtilmelding = await Eventtilmelding.findById(req.params.id);

        if (eventtilmelding == null) {
            return res.status(404).json({ message: 'Ingen eventtilmelding med den ID' });
        }


    } catch (error) {

        console.log(error);
        return res.status(500).json({ message: "Problemer: " + error.message }); // problemer med server
    }

    res.eventtilmelding = eventtilmelding; // put det fundne ind i responset
    next();
}


module.exports = router;