const Event = require('../models/event.model');
const Eventtilmelding = require('../models/eventtilmelding.model');

const express = require('express');
const router = express.Router();


// Multer middleware (upload-const skal ligge FØR de funktioner som kalder den (POST og PUT))
// Multer igonrer denne hvis der ikke er en fil med - ingen fejl eller noget - fortsætter bare og returnerer ingen file/filename (hurra aht patch/put!)
const multer = require('multer');
const upload = multer({

    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/images/events');
        },
        filename: function (req, file, cb) {
            //cb(null, Date.now() + '-' + file.originalname)
            cb(null, file.originalname)
        }
    })
});


// ----- HENT/GET ALLE ------------------------------------------------------------------------------------------

router.get('/', async (req, res) => {

    console.log("HENT ALLE event");

    try {
        const event = await Event.find().populate('region');
        res.json(event);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET SØGNING event ------------------------------------------------------------------------------------------------------------- 
// ----- OBS! Denne skal ligge før /:id da ordet "soeg" i routen ellers bliver regnet for en "id"

router.get('/soegavanceret', async (req, res) => { //

    console.log("SØG AVANCERET event");

    const { titel, distance_min, distance_max, pris_min, pris_max, region } = req.query;
    console.log(titel)

    try {

        const event = await Event.find({
            titel: (titel) ? { "$regex": titel, "$options": "i" } : /.*/,
            region: region,
            pris: { $gt: pris_min - 1, $lt: pris_max + 1 },
            distance: { $gt: distance_min - 1, $lt: distance_max + 1 }
        }).populate('region');

        res.json(event);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET SØGNING event ------------------------------------------------------------------------------------------------------------- 
// ----- OBS! Denne skal ligge før /:id da ordet "soeg" i routen ellers bliver regnet for en "id"

router.get('/soeg/:soegeord', async (req, res) => { //

    console.log("SØG SIMPEL event");

    try {

        const event = await Event.find({
            $or: [
                { "titel": { "$regex": req.params.soegeord, "$options": "i" } }, // søg i alt som små bogstaver
                { "beskrivelse": { "$regex": req.params.soegeord, "$options": "i" } }, // søg i alt som små bogstaver
            ]
        }).populate('region');

        res.json(event);

    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET SØGNING dato ------------------------------------------------------------------------------------------------------------- 
// ----- OBS! Denne skal ligge før /:id da ordet "soeg" i routen ellers bliver regnet for en "id"

router.get('/soegdato', async (req, res) => { //

    console.log("SØG DATO event");

    const { dato_fra } = req.query;

    try {

        // Find alle events mellem de to datoer
        let event = await Event.find({
            dato: { $gt: dato_fra }
        })
            .sort([['dato', 1]]) // sorter dato stigende ... hvis -1 sorteres faldende
            .populate('region');


        // Lav liste af alle events mellem de to datoer 
        let eventsliste = await Promise.all(event.map(async e => {

            // ... tjek i eventtilmelding hvor mange tilmeldinger/email-adresser der er til dette event i map-loop
            let antaltilmeldte = await Eventtilmelding.where({ "event": e._id }).count();

            console.log("antal", antaltilmeldte)

            return (
                {
                    ...e.toJSON(),

                    // beregning af antal-pladser tilbage ... indsættes i responset
                    pladsertilbage: e.antalpladser - antaltilmeldte // regnestykke antallet af pladser minus antallet af tilmeldte til dette event i loopen/map'en
                }
            )

        }));

        res.json(eventsliste);


    } catch (err) {
        res.status(500).json({ message: "Der var en fejl i / :" + err.message }); // 500 = serverproblem
    }

});



// ----- HENT/GET UDVALGT event ------------------------------------------------------------------------------------------------------------- 

router.get('/:id', findEvent, async (req, res) => { //

    console.log("HENT UDVALGT")

    res.json(res.event);

});



// ADMIN ROUTES  -----------------------------------------------------------
// *************************************************************************


// ----- OPRET/POST NY ----------------------------------------------------------------------------------------

router.post('/admin', upload.single('billede'), async (req, res) => {

    console.log("POST event");

    // TODO: Håndter manglende billede


    const event = new Event(req.body);
    event.billede = req.file ? req.file.filename : "paavej.jpg";      // filename kommer ikke automatisk med i request

    try {
        const ny = await event.save();
        res.status(201).json({ message: "Ny event er oprettet", event: ny });

    } catch (error) {
        res.status(400).json({ message: "Der er sket en fejl", error: error });
    }

});



// ----- SLET/DELETE ------------------------------------------------------------------------------------------------------------- 

router.delete('/admin/:id', findEvent, async (req, res) => {

    console.log("DELETE event")

    try {

        await res.event.remove();
        res.status(200).json({ message: 'event er nu slettet' })

    } catch (error) {
        res.status(500).json({ message: 'event kan ikke slettes - der er opstået en fejl: ' + error.message })
    }



});



// ----- RET/PUT ------------------------------------------------------------------------------------------------------------- 

router.put('/admin/:id', upload.single('billede'), findEvent, async (req, res) => {

    console.log("PUT event")

    try {

        res.event.titel = req.body.titel;
        res.event.dato = req.body.dato;
        res.event.beskrivelse = req.body.beskrivelse;
        res.event.distance = req.body.distance;
        res.event.pris = req.body.pris;
        res.event.antalpladser = req.body.antalpladser;
        res.event.region = req.body.region;
        // fra multer - skal kunne håndtere at billedet måske ikke skal udskiftes
        if (req.file) {
            res.event.billede = req.file.filename;
        }

        await res.event.save();
        res.status(200).json({ message: 'event er rettet', rettetevent: res.event });

    } catch (error) {
        res.status(400).json({ message: 'event kan ikke rettes - der er opstået en fejl: ' + error.message })
    }

});


// MIDDLEWARE 
// FIND UD FRA ID  ---------------------------------------------------------------------------------------------

async function findEvent(req, res, next) {

    console.log("FIND UD FRA ID", req.params.id)
    let event;

    try {

        event = await Event.findById(req.params.id).populate('region');
        // denne hvis region-navn skal trækkes med ud:
        // event = await (await Event.findById(req.params.id).populate('region')); 

        if (event == null) {
            return res.status(404).json({ message: 'Ingen event med den ID' });
        }


    } catch (error) {

        console.log("FEJL...", error);
        return res.status(500).json({ message: "Problemer: " + error.message }); // problemer med server
    }

    res.event = event; // put det fundne ind i responset
    next();
}


module.exports = router;