// import express and db.json as notes
const notes = require("./db/db.json");
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

// static route for notes.html
app.get('/notes', (req, res) => {
    res.sendFile(__dirname + '/public/notes.html');
});
// static route for db.json
app.get('/api/notes', (req, res) => res.json(notes));
// static route for index.html, * should always come last
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`API server now at http://localhost:${PORT}`);
});