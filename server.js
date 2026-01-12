const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Allows connections from any device on network
});

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/buttonDB');

const buttonSchema = new mongoose.Schema({
    id: Number,
    status: String
});
const Button = mongoose.model('Button', buttonSchema);

// INITIALIZE: Only if collection is empty
const initButtons = async () => {
    const count = await Button.countDocuments();
    if (count === 0) {
        const initialData = Array.from({ length: 6 }, (_, i) => ({ id: i, status: "Vacant" }));
        await Button.insertMany(initialData);
        console.log("Database seeded for the first time.");
    }
};
initButtons();

app.get('/buttons', async (req, res) => {
    const buttons = await Button.find().sort({ id: 1 });
    res.json(buttons);
});

app.put('/buttons/:id', async (req, res) => {
    const button = await Button.findOne({ id: req.params.id });
    button.status = button.status === "Vacant" ? "Taken" : "Vacant";
    await button.save();

    // REAL-TIME: Tell everyone the buttons changed
    const allButtons = await Button.find().sort({ id: 1 });
    io.emit('update', allButtons);

    res.json(button);
});

// LISTEN: 0.0.0.0 allows local network access
server.listen(5000, '0.0.0.0', () => {
    console.log("Server running on http://0.0.0.0:5000");
});

















/*
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (Replace with your URI)
mongoose.connect('mongodb://localhost:27017/buttonDB');

const buttonSchema = new mongoose.Schema({
    id: Number,
    status: String // "Taken" or "Vacant"
});

const Button = mongoose.model('Button', buttonSchema);

// Initialize 6 buttons if they don't exist
const initButtons = async () => {
    const count = await Button.countDocuments();
    if (count === 0) {
        const initialData = Array.from({ length: 6 }, (_, i) => ({ id: i, status: "Vacant" }));
        await Button.insertMany(initialData);
    }
};
initButtons();

// Get all buttons
app.get('/buttons', async (req, res) => {
    const buttons = await Button.find().sort({ id: 1 });
    res.json(buttons);
});

// Toggle button status
app.put('/buttons/:id', async (req, res) => {
    const button = await Button.findOne({ id: req.params.id });
    button.status = button.status === "Vacant" ? "Taken" : "Vacant";
    await button.save();
    res.json(button);
});

app.listen(5000, () => console.log("Server running on port 5000"));*/
