const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Home page
app.get('/', (req, res) => {
    fs.readdir('./files', (err, files) => {
        res.render('index', { files: files || [] });
    });
});

// Create new task
app.post('/create', (req, res) => {
    const title = req.body.title?.trim();
    const details = req.body.details;

    if (!title || !details) return res.send("Title or Details missing.");

    const filename = `${title.split(' ').join('')}.txt`;
    fs.writeFile(`./files/${filename}`, details, (err) => {
        if (err) return res.send("Error writing file.");
        res.redirect('/');
    });
});

// Show file content
app.get('/file/:fileName', (req, res) => {
    fs.readFile(`./files/${req.params.fileName}`, 'utf-8', (err, filedata) => {
        if (err) return res.status(404).send("File not found.");
        res.render('show', {
            title: req.params.fileName.replace('.txt', ''),
            message: filedata
        });
    });
});

// Edit form page
app.get('/edit/:fileName', (req, res) => {
    res.render('edit', { fileName: req.params.fileName });
});

// Rename file
app.post('/edit', (req, res) => {
    const oldName = req.body.previous;
    const newName = req.body.new;

    if (!oldName || !newName) return res.send("Both names required.");
    if (fs.existsSync(`./files/${newName}`)) return res.send("File with new name already exists.");

    fs.rename(`./files/${oldName}`, `./files/${newName}`, (err) => {
        if (err) return res.send("Error renaming file.");
        res.redirect('/');
    });
});
//update content
app.get("/update/:fileName", function (req, res) {
    const filePath = `./files/${req.params.fileName}`;
    fs.readFile(filePath, "utf-8", function (err, filedata) {
        if (err) return res.status(404).send("File not found!");

        res.render("update", {
            fileName: req.params.fileName,
            content: filedata
        });
    });
});
//post update
app.post("/update", function (req, res) {
    const filePath = `./files/${req.body.fileName}`;
    const updatedContent = req.body.content;

    fs.writeFile(filePath, updatedContent, function (err) {
        if (err) return res.send("❌ Failed to update file!");
        res.redirect('/');
    });
});
// Delete a task/file
app.get("/delete/:fileName", (req, res) => {
    const filePath = `./files/${req.params.fileName}`;
    fs.unlink(filePath, (err) => {
        if (err) return res.send("❌ Failed to delete file!");
        res.redirect('/');
    });
});


// Start server
app.listen(3000, () => {
    console.log("✅ Server running on http://localhost:3000");
});
