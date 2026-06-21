const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.static('public'));

//session setup 
app.use(session({
    secret: process.env.SESSION_SECRET || 'expense_tracker_secret', //in production based this should be in your env file
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
}));

const db = require('./db');

//Keep database connection alive
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Keep alive ping failed:', err.message);
    }
  });
}, 4 * 60 * 1000); // every 4 minutes

const expenseRoutes = require('./routes/expenses');
app.use('/expenses', expenseRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});