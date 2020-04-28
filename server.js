"use strict"
const fs = require('fs');
const url = require('url');
const path = require('path');
const HEADERS = require('headers');
const ERRORS = require('errors');
const HTTPS = require('https');
//mongoose.connect("mongodb+srv://" + process.env.DBProgetto + ":" + process.env.DBprogetto1423513 + "@dbprogetto-5y5yb.mongodb.net/test?retryWrites=true&w=majority");
// mongo
const MONGO_CLIENT = require("mongodb").MongoClient;
const STRING_CONNECT = 'mongodb://127.0.0.1:27017';
const PARAMETERS = {
    useNewUrlParser: true,
    /* useUnifiedTopology: true */
};

// express
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

// Online RSA Key Generator
const privateKey = fs.readFileSync("keys/private.key", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = {"key":privateKey, "cert":certificate};

// avvio server
const TIMEOUT = 90; // 180 SEC
let pageNotFound;

var httpsServer = HTTPS.createServer(credentials, app);
httpsServer.listen(8888, function() {
    fs.readFile("./static/index.html", function(err, content) {
        if (err)
            content = "<h1>Risorsa non trovata</h1>"
        pageNotFound = content.toString();
    });
    console.log("Server in ascolto sulla porta: " + this.address().port);
});

/* ************************************************************ */

// middleware
app.use("/", bodyParser.json());
app.use("/", bodyParser.urlencoded({ extended: true }));

app.use("/", function(req, res, next) {
    console.log(">_ " + req.method + ": " + req.originalUrl);
    if (Object.keys(req.query).length != 0)
        console.log("Parametri GET: " + JSON.stringify(req.query));
    if (Object.keys(req.body).length != 0)
        console.log("Parametri BODY: " + JSON.stringify(req.body));
    // Il log di req.params può essere fatto solo DOPO aver assegnato un nome	
    next();
});

/* --------------------------------------------------------------- */
app.get('/', function(req, res, next) {
    controllaToken(req, res, next);
});
app.get('/index.html', function(req, res, next) {
    controllaToken(req, res, next);
});
/* --------------------------------------------------------------- */

app.use("/", express.static('./static'));

// controllo del token
app.use('/api', function(req, res, next) {
    controllaToken(req, res, next);
});

function controllaToken(req, res, next) {
    if (req.originalUrl == '/api/loginA' || req.originalUrl == '/api/loginU' || req.originalUrl == '/api/insertAmministratore'|| req.originalUrl == '/api/insertCondomino'/*|| req.originalUrl == '/api/elencoReparti' || req.originalUrl == '/api/elencoMediciReparto' || req.originalUrl == '/api/lastIdVisita' || req.originalUrl == '/api/insertVisita'*/)
        {
        next();}
    else {
        let token = readCookie(req);
        if (token == '') {
            error(req, res, null, ERRORS.FORBIDDEN);
        } else {
            jwt.verify(token, privateKey, function(err, payload) {
                if (err)
                    error(req, res, err, ERRORS.FORBIDDEN);
                else {
                    // aggiornamento del token
                    var exp = Math.floor(Date.now() / 1000) + TIMEOUT;
                    payload = {...payload, 'exp': exp }
                    token = createToken(payload)
                    writeCookie(res, token)
                    req.payload = payload;
                    next();
                }
            });
        }
    }
}

function readCookie(req) {
    var valoreCookie = "";
    if (req.headers.cookie) {
        var cookies = req.headers.cookie.split('; ');
        for (var i = 0; i < cookies.length; i++) {
            cookies[i] = cookies[i].split("=");
            if (cookies[i][0] == "token") {
                valoreCookie = cookies[i][1];
                break;
            }
        }
    }
    return valoreCookie;
}

/* ************************************************************ */

app.post('/api/loginA', function(req, res, next) {

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        console.log("Connesso");
        if (err){
            error(req, res, err, ERRORS.DB_CONNECTION);
            console.log("Errore Server");}
        else {
            const DB = client.db('housing');
            const collection = DB.collection('amministratori');

            let _codFA = req.body.codFA;
            collection.findOne({ "codiceFiscale": _codFA }, function(err, dbUser) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("0");}
                    
                else {
					console.log(dbUser);
                    if (dbUser == null){
                        console.log("1");
                        error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                    }
						
                        
                    else {  
                        if (dbUser.password != req.body.pwd){
                            console.log(JSON.stringify(ERRORS));
                            console.log("PWD Ciccata");
                            error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {
                            var token = createToken(dbUser);                                  
                            writeCookie(res, token)
                            res.send({"ris":"ok"});
                        }
                    }
                }
                client.close();
            });
        }
    });
});

app.post('/api/loginU', function(req, res, next) {

    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function(err, client) {
        console.log("Connesso");
        if (err){
            error(req, res, err, ERRORS.DB_CONNECTION);
            console.log("Errore Server");}
        else {
            const DB = client.db('housing');
            const collection = DB.collection('condomini');

            let _codFU = req.body.codFU;
            collection.findOne({ "codiceFiscale": _codFU }, function(err, dbUser) {
                if (err){
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("0");}
                    
                else {
					console.log(dbUser);
                    if (dbUser == null){
                        console.log("1");
                        error(req, res, null, JSON.stringify(new ERRORS.Http401Error({})));
                    }
						
                        
                    else {  
                        if (dbUser.password != req.body.pwdU){
                            console.log(JSON.stringify(ERRORS));
                            error(req, res, err, JSON.stringify(new ERRORS.Http401Error({})));
                        }
                        else {
                            var token = createToken(dbUser);                                  
                            writeCookie(res, token)
                            res.send({"ris":"ok"});
                        }
                    }
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertAmministratore', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('amministratori');
            let par = {
                "codiceFiscale": req.body.codiceFiscaleA,
                "nome":req.body.nomeA,
                "cognome":req.body.cognomeA,
                "DataNascita":req.body.DataNascitaA,
                "password":req.body.passwordA,
                "telefono":req.body.telefonoA
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito l'amministratore");
                }
                client.close();
            });
        }
    });
});

app.post('/api/insertCondomino', function (req, res, next) {
    console.log("Entro in inserimento");
    MONGO_CLIENT.connect(STRING_CONNECT, PARAMETERS, function (err, client) {
        if (err)
            error(req, res, err, JSON.stringify(new ERRORS.DB_CONNECTION({})));
        else {
            let db = client.db('housing');
            let collection = db.collection('condomini');
            let par = {
                "codiceFiscale": req.body.codiceFiscaleA,
                "nome":req.body.nomeA,
                "cognome":req.body.cognomeA,
                "DataNascita":req.body.DataNascitaA,
                "password":req.body.passwordA,
                "telefono":req.body.telefonoA
            };

            collection.insertOne(par, function (err, data) {
                if (err) {
                    error(req, res, err, JSON.stringify(new ERRORS.QUERY_EXECUTE({})));
                    console.log("Errore nella insertOne");
                }
                else {
                    res.send(JSON.stringify(data));
                    console.log("Ho inserito il condomino");
                }
                client.close();
            });
        }
    });
});


function createToken(obj) {
   let token = jwt.sign({
            '_id': obj._id,
            'password': obj.id,
            'iat': obj.iat || Math.floor(Date.now() / 1000),
			'exp': obj.exp || Math.floor(Date.now() / 1000 + TIMEOUT)
        },
        privateKey
    );
    console.log("Creato Nuovo token");
    console.log(token);
    return token;
}

app.post('/api/logout', function(req, res, next) {
    res.set("Set-Cookie", "token=;max-age=-1;Path=/;httponly=true");
    res.send({"ris":"LogOutOk"});
});

function writeCookie(res, token) {
	// sintassi nodejs
    // res.setHeader("Set-Cookie", "token=" + token + ";max-age=" + TIMEOUT + ";Path=/");
	// sintassi express
    res.set("Set-Cookie", "token=" + token + ";max-age=" + TIMEOUT + ";Path=/;httponly=true;secure=true");
}

// gestione degli errori
function error(req, res, err, httpError) {
    console.log("httpError: " + httpError);
    if (err)
        console.log(err.message);
    //res.status(httpError.CODE);
    console.log("URI: " + req.originalUrl);
    if (req.originalUrl.startsWith("/api"))
        res.send(httpError.message);
    else
    // L'unico errore su una richiesta di pagina può essere il token non valido 
    //  (oppure il successivo 404 not found)
        res.sendFile('index.html', { root: './static' })
}

// default route finale
app.use('/', function(req, res, next) {
    res.status(404)
    if (req.originalUrl.startsWith("/api")) {
        res.send('Risorsa non trovata');
    } else {
        res.send(pageNotFound);
    }
});