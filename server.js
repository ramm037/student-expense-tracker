const express = require('express');
const app = express();

app.use(express.json());

const db = require('./db');

const expenseRoutes = require('./routes/expenses');
app.use('/expenses', expenseRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});