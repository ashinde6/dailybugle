const http = require('http');
const url = require('url')
const express = require('express');
const session = require('express-session');
const requestIp = require('request-ip');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(requestIp.mw());

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

    const token = jwt.sign({ username: username, role: role }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const usersCollection = client.db('dailybugle').collection('users');
  const user = await usersCollection.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send('Invalid username or password');
  } else {
    const token = jwt.sign({ username: username, role: user.role, userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  }
});

app.post('/verifyToken', async (req, res) => {
  const token = req.body.token;
  console.log(token);
  try {
    const decodedToken = jwt.verify(token, secretKey);
    console.log(decodedToken);
    res.json({ success: true, username: decodedToken.username, role: decodedToken.role, userId: decodedToken.userId });
  } catch (error) {
    res.json({ success: false, error: 'Invalid token' });
  }
});

app.post('/articles', async (req, res) => {
  const { title, content, image, date, authorId } = req.body;
  const articlesCollection = client.db('dailybugle').collection('articles');
  const result = await articlesCollection.insertOne({ title: title, content: content, image: image, date: date, authorId: authorId });
});

app.post('/getArticles', async (req, res) => {
  const authorId = req.body.authorId;
  const articlesCollection = client.db('dailybugle').collection('articles');
  var query = { authorId: authorId };
  const documents = await articlesCollection.find(query).toArray((err, documents) => {
    if (err) throw err;
  });

  console.log(documents);

  res.json({documents});

});

app.post('/readerArticles', async (req, res) => {
  console.log(req.body.content);
  const documents = await client.db('dailybugle').collection('articles').find({}).toArray((err, documents) => {
    if (err) throw err;
    console.log('All documents in the collection:', documents);
  });
  console.log(documents);

  res.json({documents});
});

app.use(express.static('public'));

const fakeAds = [
  { id: 1, content: 'Burger', imageUrl: '/ads/burger.jpg' },
  { id: 2, content: 'Car', imageUrl: '/ads/car.jpg' },
  { id: 2, content: 'Lotion', imageUrl: '/ads/lotion.jpg' },
  { id: 2, content: 'Furniture', imageUrl: '/ads/furniture.jpg' },
  { id: 2, content: 'Water', imageUrl: '/ads/water.jpg' },
  { id: 2, content: 'Snickers Ice Cream', imageUrl: '/ads/snickers.jpg' },
  // Add more fake ads as needed
];

app.post('/getAds', async (req, res) => {
  // Choose a random fake ad
  const clientIp = req.clientIp;
  const adsCollection = client.db('dailybugle').collection('ads');
  if (req.body.request === 'viewer') {
    const result = await adsCollection.insertOne({ viewerClientIp: clientIp });
  } else {
    const result = await adsCollection.insertOne({ interactorClientIp: clientIp });
  }
});



