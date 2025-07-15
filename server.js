const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {ExtractJwt, Strategy} = require('passport-jwt');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(passport.initialize());

// app.get('/', (req, res) => {
//   res.send('Welcome to the JWT Authentication Server!');    
// });

//hard coded data:
const movies = [
  {
    "id": 1,
    "title": "The Matrix",
    "director": "Lana Wachowski & Lilly Wachowski",
    "year": 1999,
    "imdbLink": "https://www.imdb.com/title/tt0133093/"
  },
  {
    "id": 2,
    "title": "Demon Slayer: Mugen Train",
    "director": "Haruo Sotozaki",
    "year": 2020,
    "imdbLink": "https://www.imdb.com/title/tt11032374/"
  },
  {
    "id": 3,
    "title": "Spy x Family Code: White",
    "director": "Kazuhiro Furuhashi and Takashi Katagiri",
    "year": 2023,
    "imdbLink": "https://www.imdb.com/title/tt26684398/"
  },
  {
    "id": 4,
    "title": "Mufasa: The Lion King",
    "director": "Barry Jenkins",
    "year": 2024,
    "imdbLink": "https://www.imdb.com/title/tt13186482/"
  },
  {
    "id": 5,
    "title": "How to Train Your Dragon",
    "director": "Dean DeBlois",
    "year": 2025,
    "imdbLink": "https://www.imdb.com/title/tt26743210/"  
  }
]

const users = [
  {
    _id: 1,
    userName: 'admin',
    password: 'password',
    fullName: 'Shrek',
    role: 'admin'
  },
  {
    _id: 2,
    userName: 'Joanne13',
    password: '27062004',
    fullName: 'Joanne Phan',
    role: 'admin'
  },
  {
    _id: 3,
    userName: 'DaFisher',
    password: '22092003',
    fullName: 'Devon Fisher',
    role: 'admin'
  }
];

const jwtSecret = 'nothing-beats-the-jet2holidays';

passport.use(
    new Strategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        },
        (payload, done) => {
            const user = users.find(user => user._id === payload._id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }
    )
);

const requireAuth = passport.authenticate('jwt', { session: false });

app.post('/api/login', (req, res) => {
    const { userName, password } = req.body;
    const user = users.find(u => u.userName === userName && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = 
    { 
        _id: user._id, 
        userName: user.userName, 
        fullName: user.fullName, 
        role: user.role 
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    return res.json({message: `Login successful, welcome ${payload.fullName} (${payload.role})`, token });
});

app.get('/api/movies', requireAuth, (req, res, next) => {
    console.log('Authenticated user:', req.headers.authorization);
    next();
}, requireAuth, (req, res) => {
    res.json(movies);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

