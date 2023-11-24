const http = require('http');
const url = require('url')
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const app = express();

const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb://127.0.0.1:27017/';

const client = new MongoClient(mongoURI);

const port = 3003;

const secretKey = crypto.randomBytes(32).toString('hex');

app.use(express.json());

app.listen(port, () => console.log(`listening on port ${port}`));

app.use(session({
  secret: secretKey,
  resave: true,
  saveUninitialized: true
}));

app.post('/register', async (req, res) => {
  const { email, username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  var query = { username: username };
  const count = await client.db('dailybugle').collection('users').countDocuments(query);
  console.log('count', count);

  if (count > 0) {
    return res.status(400).json({ status: 400, message: 'username ' + username + ' already exist!' });
  } else {
    const usersCollection = client.db('dailybugle').collection('users');
    const result = await usersCollection.insertOne({ email: email, username: username, password: hashedPassword, role: role });

    // res.status(201).send('User registered successfully');
    req.session.user = { username: username }
    res.redirect('/home');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const usersCollection = client.db('dailybugle').collection('users');
  const user = await usersCollection.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send('Invalid username or password');
  } else {
    // res.status(200).send('Login successful');
    req.session.user = { username: username }
    res.redirect('localhost:8080/api/users/home');
  }
});

app.get('/localhost:8080/api/users/home', (req, res) => {
  console.log('Hi');
})
