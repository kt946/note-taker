// import express, fs, path, uuid package to generate id for notes
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
    // parse JSON string into a JavaScript object and filter array to exclude parameter id
    const result = JSON.parse(notesArray).filter(note => note.id !== id);
    return result;
}

// function to delete notes
function deleteNote(req) {
    // read file for current array of notes
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
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// static route for db.json and return saved notes
app.get('/api/notes', (req, res) => {
    // read file for current array of notes
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) throw err;
    
        // parse JSON string into a JavaScript object
        res.json(JSON.parse(data));
    });
});

// static route for index.html, * should always come last
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// route for POST requests to notes
app.post('/api/notes', (req, res) => {
    // create new id using uuid package
    req.body.id = uuidv4();

    // read file for current array of notes
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) throw err;
    
        // add new note to db.json and parse data
        const newNote = createNewNote(req.body, JSON.parse(data));

        console.info('Successfully added note!');
        res.json(newNote);
    });
});

// route for DELETE requests to notes
app.delete('/api/notes/:id', (req, res) => {
    // send req data to delete function
    const newNoteArray = deleteNote(req);

    res.json(newNoteArray);
});

app.listen(PORT, () => {
    console.log(`API server now at http://localhost:${PORT}`);
});