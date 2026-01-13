import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import db from './database.js';

dotenv.config();

const app = express();

app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Allow both Vite ports
  credentials: true
}));

import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(session);

app.use(session({
  store: new SQLiteStore({
    db: 'database.sqlite',
    dir: './'
  }),
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  const googleId = profile.id;
  const email = profile.emails[0].value;
  const name = profile.displayName;
  const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

  db.get('SELECT * FROM users WHERE googleId = ?', [googleId], (err, user) => {
    if (err) return done(err);
    if (user) {
      return done(null, user);
    } else {
      db.run('INSERT INTO users (googleId, email, name, picture) VALUES (?, ?, ?, ?)',
        [googleId, email, name, picture],
        function (err) {
          if (err) return done(err);
          const newUser = { id: this.lastID, googleId, email, name, picture };
          return done(null, newUser);
        });
    }
  });
}));

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return done(err);
    if (!user || !user.password) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
    } catch (e) {
      return done(e);
    }
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});


// Homepage route
app.get('/', (req, res) => {
  res.send('Goo-Link-Dash Backend is running!');
});

// Auth Routes
app.post('/auth/signup', async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return next(err);
        }

        const newUser = { id: this.lastID, email, name };
        req.login(newUser, (err) => {
          if (err) return next(err);
          return res.json({ user: newUser });
        });
      });
  } catch (e) {
    next(e);
  }
});

app.post('/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: true
}), (req, res) => {
  // Redirect to frontend dashboard after login
  res.redirect('http://localhost:8080/dashboard');
});

app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

app.get('/logout', (req, res, next) => {
  if (req.user) {
    // Delete user's links before logging out
    db.run('DELETE FROM links WHERE userId = ?', [req.user.id], (err) => {
      if (err) {
        console.error('Error deleting links on logout:', err);
      }

      req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  } else {
    res.redirect('/');
  }
});

// Links API
app.get('/api/links', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  db.all('SELECT * FROM links WHERE userId = ? ORDER BY createdAt DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ links: rows });
  });
});

app.post('/api/links', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  db.run('INSERT INTO links (userId, url) VALUES (?, ?)', [req.user.id, url], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, url, createdAt: new Date() });
  });
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});