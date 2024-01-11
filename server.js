const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// HTML Routes
// Serve index.html for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// Serve notes.html for the /notes route
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});


// API Routes
// Get all notes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error reading notes');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// create a new note
app.post('/api/notes', (req, res) => {
    const newNote = {
        id: uuidv4(),
        title: req.body.title,
        text: req.body.text
    };

    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error adding note');
        } else {
            const notes = JSON.parse(data);
            notes.push(newNote);
            fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error saving note');
                } else {
                    res.json(newNote);
                }
            });
        }
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting note');
        } else {
            const notes = JSON.parse(data);
            const updatedNotes = notes.filter((note) => note.id !== id);
            fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(updatedNotes), (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error saving notes');
                } else {
                    res.json({ message: 'Note deleted successfully' });
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});