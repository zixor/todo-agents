const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running successfully' });
});

// Greeting endpoint: Receives a name and returns a personalized greeting with the server time
app.get('/api/greet', (req, res) => {
    const username = req.query.name;
    let message = 'No user name provided.';

    if (username) {
        // Format date/time to be readable
        const date = new Date();
        const timeOptions = {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        };
        const timeString = date.toLocaleDateString('es-ES', timeOptions);

        message = `¡Hola, ${username}! El saludo de hoy es ${timeString}.`;
    }

    res.json({
        success: true,
        message: message
    });
});

// ===== Todo CRUD Routes =====
let todos = [];
let nextId = 1;

app.get('/api/todos', (req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
    }
    const todo = { id: nextId++, title: title.trim(), completed: false, createdAt: new Date() };
    todos.push(todo);
    res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    const { title, completed } = req.body;
    if (title !== undefined) todo.title = title.trim();
    if (completed !== undefined) todo.completed = completed;
    res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Todo not found' });
    }
    todos.splice(index, 1);
    res.json({ message: 'Todo deleted' });
});

// Start the server
app.listen(PORT, function() {
    console.log("Server running on http://localhost:" + PORT);
});