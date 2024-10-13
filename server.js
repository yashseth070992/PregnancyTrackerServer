const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Datastore } = require('@google-cloud/datastore');

const app = express();
const port = process.env.PORT || 3000;

const datastore = new Datastore();
app.use(cors());
app.use(bodyParser.json());

// Function to save user in Datastore
async function addUser(email, firstName,lastName, password, age) {
  const userKey = datastore.key(['User', email]);  // Use email as the primary key
  const entity = {
    key: userKey,
    data: { email, firstName,lastName, password, age },
  };
  await datastore.save(entity);
}

// Function to check if user exists in Datastore
async function findUserByEmail(email) {
  const userKey = datastore.key(['User', email]);  // Use email to fetch the user
  const [user] = await datastore.get(userKey);
  return user;
}

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { firstName,lastName, password, email, age } = req.body;

  if (firstName &&lastName&& password && email && age) {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400).json({ message: 'Email already exists!' });
    } else {
      await addUser(email, firstName,lastName, password, age);
      res.status(201).json({ message: 'User created successfully!' });
    }
  } else {
    res.status(400).json({ message: 'All fields are required!' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (user && user.password === password) {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

app.patch('/users/:email', async (req, res) => {
  const { email } = req.params;
  const { firstName,lastName, password, age, conceiveDate, pregnancyWeek } = req.body;

  const userKey = datastore.key(['User', email]);  // Email used as the identifier
  const [user] = await datastore.get(userKey);

  if (user) {
    // Only update the fields provided in the request body
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.password = password || user.password;
    user.age = age || user.age;
    user.conceiveDate = conceiveDate || user.conceiveDate;
    user.pregnancyWeek = pregnancyWeek || user.pregnancyWeek;

    await datastore.save({ key: userKey, data: user });
    res.json({ message: 'User information updated successfully!' });
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
});

// Get user info endpoint by email
app.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  const user = await findUserByEmail(email);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found!' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});