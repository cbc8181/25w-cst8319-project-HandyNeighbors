const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const taskRouter = require('./routes/tasks');

const app = express();

// CORS settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// public routes
app.use('/', indexRouter);
app.use('/api/auth', usersRouter);

// protected routes
app.use('/api/tasks', authMiddleware, taskRouter);
app.use('/api/users/profile', authMiddleware, usersRouter);

module.exports = app;
