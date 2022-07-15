// import express, fs, and db.json as notes
const express = require('express');
const notes = require("./db/db.json");
const fs = require('fs');
const path = require('path');

// port for Heroku and default
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));

// middleware to parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// middleware to parse incoming JSON data
app.use(express.json());

// function to filter notes by id
function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
}
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

// function to validate notes
function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

// static route for notes.html
app.get('/notes', (req, res) => {
    res.sendFile(__dirname + '/public/notes.html');
});

// static route for db.json
app.get('/api/notes', (req, res) => res.json(notes));

// route to search for notes by id
app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    res.json(result);
});

// static route for index.html, * should always come last
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// route to POST requests to notes
app.post('/api/notes', (req, res) => {
    // create new id based on next index in array
    req.body.id = notes.length.toString();

    // if any data is missing or incorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        // add note to db.json
        const newNote = createNewNote(req.body, notes);
        res.json(newNote);
    }
});

app.listen(PORT, () => {
    console.log(`API server now at http://localhost:${PORT}`);
});