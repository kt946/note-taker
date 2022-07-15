// import express, fs, and db.json as notes
const express = require('express');
const notes = require("./db/db.json");
const fs = require('fs');
const path = require('path');

// port for Heroku and default
const PORT = process.env.PORT || 3001;
const app = express();

// middleware to serve static files
app.use(express.static('public'));

// middleware to parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// middleware to parse incoming JSON data
app.use(express.json());

// function to create new notes
function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        // save JavaScript array data as JSON
        JSON.stringify(notesArray, null, 2)
    );
    return note;
}

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

// route to POST requests to notes
app.post('/api/notes', (req, res) => {
    // create new id based on next index in array
    req.body.id = notes.length.toString();

    // add new note to db.json
    const newNote = createNewNote(req.body, notes);
    
    // return new note
    res.json(newNote);
});

app.listen(PORT, () => {
    console.log(`API server now at http://localhost:${PORT}`);
});