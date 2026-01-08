// imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// constants
const port = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "eternity benjamin";
const AUTH_URL = process.env.AUTH_URL || 'http//localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || ' http://localhost:${port}'; 
const API_KEY = process.env.API_KEY 

// middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))

  function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });

});
app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;
         db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function(err) {  
             if (err) {
                console.error(err.message);
            } else {
                console.log(`User ${tokenData.displayName} added to database`);
            }   
        });
        return res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 119,
        to: 45,
        amount: 100,
        pin: 1703,
        reason: "test pogs"
    }
    socket.emit('transferDigipogs', data);
    res.send('Pogs sent!');
});

socket.on('connect', () => {
    console.log('Connected to auth server');
    socket.emit('getACtiveClass');
});

socket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});

socket.on('setClass', (classData) => {
    console.log('Active class updated:', classData);
});

// start server
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});
