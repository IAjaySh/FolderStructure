const express = require('express');
const bodyParser = require('body-parser');
const router = require('../routes/FolderStructureRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.send("hello world");
});

app.use('/api', router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
