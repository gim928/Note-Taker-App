const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

//setting up port for heroku
const PORT = process.env.PORT || 3001;
const app = express();

// Helper method for generating unique ids
const uuid = require("./helpers/uuid");

//middleware for parsing JSON and url encoded from data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// GET Route for homepage
app.get("/*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// GET Route for notes page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/pages/notes.html"))
);

// Promise version of fs.readFile to read file
const readFromFile = util.promisify(fs.readFile);

//write data to the JSON file
//destination- the file you want to write to
//content is the content you want to write to the file
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 2), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

//   Function to read data from a given a file and append some content
//content- the content you want to append to the file
//file - the path to the file you want to save to
const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// GET Route for retrieving all the notes
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for tips`);
  readFromFile("./db.json").then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new UX/UI tip
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    readAndAppend(newNote, "./db.json");
    res.json(`Note added successfully 🚀`);
  } else {
    res.error("Error in adding note");
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
