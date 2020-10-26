const express = require('express');
const formData = require('express-form-data');              // HVIS der bruges multer et sted så skal denne kun placeres i routes UDEN multer!!!
const router = express.Router();
const Adminbruger = require('../models/adminbruger.model');
router.use(formData.parse());                               // nødvendig for at kunne modtage formdata fx 'e.target' fra react/frontend


// ----- LOGIN (tilføj session hvis match) ---------------------------------------------------------------------------------
// ----- GET http://localhost:5021/login/login

router.post('/login', async (req, res) => {

    console.log("LOGIN");

    try {

        const { brugernavn, password } = req.body;

        const adminbruger = await Adminbruger.findOne({ brugernavn: brugernavn });
        console.log(brugernavn)

        if (!adminbruger) {
            // slet cookie - så en evt. tidligere succes bliver slettet når man forsøger at logge ind med forkert
            //TODO: res.clearCookie(process.env.SESSION_NAME).json({ message: "2. Bruger, email og/eller password findes ikke" });
            // http status koden 400 laver automatisk en error 
            return res.status(401).json({ message: "1. Bruger findes ikke" })
        }


        adminbruger.comparePassword(password, function (err, isMatch) {

            if (err) throw err;
            console.log('Password: ', isMatch); //

            if (isMatch) {

                console.log('der er match!!!')
                
                // put lidt ekstra i session
                req.session.userId = adminbruger._id // LAV SESSION med brugers id .."adminbruger._id"

                console.log("authtroutes login", req.session);

                // response/message til login'eren
                res.json({ brugernavn: adminbruger.brugernavn, brugerID: adminbruger._id });

            } else {
                // slet cookie - så en evt. tidligere succes bliver slettet når man forsøger at logge ind med forkert
                res.status(401).clearCookie(process.env.SESSION_NAME).json({ message: "2. Bruger findes ikke" });
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message }); // 500 = serverproblem
    }

});


// ----- LOGUD (destroy session) -------------------------------------------------------------------------------------------- 
// ----- GET http://localhost:5021/login/logout

router.get('/logout', async (req, res) => {

    console.log("LOGUD")
    console.log(" destroy session 1 ", req.session) // , req.session.userId

    // destroy - se express-session dokumentation - destroy vs clearcookie https://stackoverflow.com/a/58142467
    req.session.destroy(err => {

        // FEJL
        if (err) return res.status(500).json({ message: 'Logud lykkedes ikke - prøv igen' }) // hvis fejl/ikke kan destroy så send til ???

        // OK send response som sletter cookie hos klienten
        res.clearCookie(process.env.SESSION_NAME).json({ message: 'cookie slettet' });

    })

});



// ----- LOGGET IND? true eller false --------------------------------------------------------------------------------------- 
// ----- GET http://localhost:5021/login/loggedin

router.get('/loggedin', async (req, res) => {

    // Jeg gemmer userId i cookie - så derfor spørger jeg om den er der = logget ind
    //if (req.session.userId) {
    if (req.session.userId) {
        // Hvis der er logget ind
        return res.status(200).json({ message: 'Login er stadig aktiv' }) //route

    } else {
        // Hvis der ikke er et login/en session
        return res.status(401).json({ message: 'Login eksisterer ikke eller er udløbet' })
    }

})


module.exports = router;