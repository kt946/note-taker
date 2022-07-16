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

// function to filter notes array by id
function filterById(id, notesArray) {
    console.log(`Deleting id: ${id}`);
    // Parse JSON string and filter array to exclude parameter id
    const result = JSON.parse(notesArray).filter(note => note.id !== id);
    return result;
}

// function to delete notes
function deleteNote(req) {
    // read file for existing array of notes
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) throw err;

        // filter current array for parameter and return updated array
        const updatedNotesArray = filterById(req.params.id, data);

        // convert array to JSON string and write updated array back to db.json
        fs.writeFile(
            path.join(__dirname, './db/db.json'),
            JSON.stringify(updatedNotesArray, null, 2),
            (writeErr) =>
                writeErr
                    // if error, print error message
                    ? console.error(writeErr)
                    // if successful, print success message
                    : console.info('Successfully deleted note!')
        );
    });
}

// static route for notes.html
app.get('/notes', (req, res) => {
    res.sendFile(__dirname + '/public/notes.html');
});

// static route for db.json and return saved notes
app.get('/api/notes', (req, res) => res.json(notes));

// static route for index.html, * should always come last
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// route for POST requests to notes
app.post('/api/notes', (req, res) => {
    // create new id based on next index in array
    req.body.id = notes.length.toString();

    // add new note to db.json
    const newNote = createNewNote(req.body, notes);
    
    // return new note
    res.json(newNote);
});

// route for DELETE requests to notes
app.delete('/api/notes/:id', (req, res) => {
    const newNoteArray = deleteNote(req);

    res.json(newNoteArray);
});

app.listen(PORT, () => {
    console.log(`API server now at http://localhost:${PORT}`);
});