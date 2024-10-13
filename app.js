const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Sample users array
let users = [];

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello, welcome to the app!');
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    users.push({ username, password });
    res.status(201).json({ message: 'User created successfully!' });
  } else {
    res.status(400).json({ message: 'Username and password are required!' });
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});