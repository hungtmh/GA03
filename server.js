const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// In-memory data storage
let todos = [
  { id: 1, title: 'Học Tailwind CSS', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'Làm bài tập GA03', completed: false, createdAt: new Date().toISOString() },
  { id: 3, title: 'Ôn tập JavaScript', completed: true, createdAt: new Date().toISOString() },
];

let nextId = 4;

// Routes - Pages
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'TODO App - GA03',
    message: 'Welcome to TODO Application'
  });
});

app.get('/todos', (req, res) => {
  res.render('todos', { 
    title: 'My TODO List - GA03'
  });
});

// API Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { completed } = req.body;
  
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'TODO not found' });
  }
  
  todo.completed = completed;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'TODO not found' });
  }
  
  const deleted = todos.splice(index, 1)[0];
  res.json(deleted);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📝 TODO list at http://localhost:${port}/todos`);
});
