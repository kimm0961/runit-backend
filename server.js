console.log("Hej fra server")

require('dotenv').config(); // KUN TIL DEV/test lokalt - 

const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT;


// Mongoose og DB ---------------------------------------------------
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to database "));


// APP ----------------------------------------------------------------
app.use(express.static('public'))                                           // Statiske filer//app.use(express.static(__dirname + '/public'));// app.use(express.static('public'));      // for at give adgang til static files (fx billeder) i public-folder - måske denne: https://stackoverflow.com/a/38812664/5094873
app.use(express.json());                                                    // nødvendig når post-data er i json - Content-Type: application/json
app.use(express.urlencoded({ extended: true }));                            // ellers er req.body undefined eller tom ved post

// Til session/login
app.use(cors({ credentials: true, origin: true }));                         // husk npm i cors https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b
//app.set('trust proxy', 1);                                                // trust first proxy ... HEROKU - for at få set-cookie med ... https://github.com/expressjs/session/issues/600 ....  sethgoodluck commented on 10 Nov 2019

// SESSION --------------------------------------------------------------

// For at bruge mongo som store for session - isf hukommelsen som ikke dur på fx heroku - Se også lidt info i _OM.txt i oprindelige tut-projekt SessionAuthenticationExpress
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);                       // session store - kunne også være i memory (uden store) eller file-store (json-fil for hver session)

const TWO_HOURS = 1000 * 60 * 60 * 2;
app.use(session({
    name: process.env.SESSION_NAME,                         //sid=sessionid,
    resave: true,                                               // true for at holde i live (se stackoverflowlink) - false for ikke at spilde connectionressources - uanset om det er redis eller db som gemmer info/cookie
    //rolling: true,                                        // Session timeout after inactivity in express-session in Express server: https://stackoverflow.com/a/43910142/5094873
    saveUninitialized: false,


    store: new MongoStore({ mongooseConnection: db }),      // EKSTRA HVIS session skal gemmes i mongo... kan udelades - i så fald gemmes session i serverens hukommelse = dur ikke på heroku

    secret: process.env.SESS_SECRET,
    cookie: {                                               // sat til http only fordi andet ikke er angivet
        maxAge: TWO_HOURS,                                  //... hvis denne IKKE sættes, så bliver det til en sessioncookie - se i devtool Cookies hvis der ingen Expires/Max-Age er bliver det = sessioncookie - højreklik så kan man vælge mellem at sltte sessioncookies eller all

        sameSite: 'strict',                                 // 'strict' el true ... https://adzerk.com/blog/chrome-samesite/#:~:text=The%20SameSite%20attribute%20tells%20browsers,a%20cookie%20to%20be%20accessed.
        secure: process.env.NODE_ENV === 'production',      // (secure: true - requires a https/production) - false hvis ikke/http https://stackoverflow.com/q/48582939
        httpOnly: true                                      // If the HttpOnly flag (optional) is included in the HTTP response header, the cookie cannot be accessed through client side script (again if the browser supports this flag)
    }
}))



// ROUTES ----------------------------------------------------------

//  INDEX
app.get('/', async (req, res) => {
    console.log("HEJ og velkommen")
});




// ----- TJEK OM AUTHORIZED hvis route indeholder ordet admin
// ----- UDKOMMENTER DENNE - hvis login skal slås fra
app.use('*/admin*', (req, res, next) => {

   
    console.log("session ", req.session, req.session.userId, req.session.userId)

    if (req.session && req.session.userId) {

        return next()

    } else {

        return res.status(401).json({ message: 'Du har ikke adgang - du skal være logget ind' }) //route
    }

})



//  ROUTES -------------------------------------------
app.use('/kontakt', require('./routes/kontakt.routes'));
app.use('/bestyrelsespost', require('./routes/bestyrelsespost.routes'));
app.use('/bestyrelse', require('./routes/bestyrelse.routes'));
app.use('/region', require('./routes/region.routes'));
app.use('/event', require('./routes/event.routes'));
app.use('/eventtilmelding', require('./routes/eventtilmelding.routes'));
app.use('/nyhedsbrevtilmelding', require('./routes/nyhedsbrevtilmelding.routes'));
app.use('/omos', require('./routes/omos.routes'));
app.use('/sponsor', require('./routes/sponsor.routes'));
app.use('/sponsorkategori', require('./routes/sponsorkategori.routes'));
app.use('/adminbruger', require('./routes/adminbruger.routes'));
app.use('/login', require('./routes/login.routes'));


// LISTEN --------------------------------------------------------------------------------------------------
app.listen(PORT, () => console.log('server started - lytter på port ' + PORT));
