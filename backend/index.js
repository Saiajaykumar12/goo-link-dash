import express from 'express';
import passport from 'passport';
import session from 'express-session'; // <-- use express-session
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();

const app = express();

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});


// Homepage route
app.get('/', (req, res) => {
  res.send('Goo-Link-Dash Backend is running!');
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

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});