const express = require('express');
const router = express.Router();
const db = require('../db');

//MIDDLEWARE TO CHECK IF USER IS LOGGED IN
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please Login First' });
    }
    next();
}

// GET  all expenses
// router.get('/', requireLogin, (req, res) => {
//     const sql = 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC';

//     db.query(sql, [req.session.user.id], (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.json(results);
//     });
// });

router.get('/', requireLogin, (req, res) => {
    const { category } = req.query;

    let sql = 'SELECT * FROM expenses WHERE user_id = ? ';
    const values = [req.session.user.id];

    if (category && category !== 'all') {
        sql += 'AND LOWER(category) = LOWER(?) ';
        values.push(category);
    }

    sql += 'ORDER BY date DESC';

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST add a new expense
router.post('/', requireLogin, (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (title.length > 100) {
        return res.status(400).json({ error: 'Title is too long' });
    }

    const sql = 'INSERT INTO expenses (title, amount, category,date, user_id) VALUES ( ?, ?, ?, ?, ?)';
    const values = [title, amount, category, date, req.session.user.id];

    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Expense added', id: results.insertId });
    });
});

//UPDATE an expense
router.put('/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    if (title.length > 100) {
        return res.status(400).json({ error: 'Title is too long' });
    }

    const sql = 'UPDATE expenses SET title = ?, amount = ?,category = ?, date = ? WHERE id = ? and user_id = ?';
    const values = [title, amount, category, date, id, req.session.user.id];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense Updated' });
    });

});

//GET total amount of all the expenses
router.get('/total', requireLogin, (req, res) => {
    const sql = 'SELECT SUM(amount) AS total FROM expenses WHERE user_id = ?';

    db.query(sql, [req.session.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total: result[0].total || 0 });
    });
});

//DELETE an expense from the table

router.delete('/:id', requireLogin, (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';

    db.query(sql, [id, req.session.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    });
});

router.get('/', (req, res) => {
    res.json({ message: 'Expenses Rout Workinng' });
});



module.exports = router;