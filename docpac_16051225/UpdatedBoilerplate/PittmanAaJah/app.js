// imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// database setup
const db = new sqlite3.Database('./data/database.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (!err) console.log('Connected to SQLite database');
});
  
  // constants 
  const port = process.env.PORT || 3000; 
  const SESSION_SECRET = process.env.SESSION_SECRET || "pizza"; 
  const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420';
  const THIS_URL = process.env.THIS_URL || ' http://localhost:${port}'; 
  const API_KEY = process.env.API_KEY
  
  // middleware
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(express.urlencoded({ extended: true }));
  
  app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
  function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
  }
  
  // routes
  app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
  });
  