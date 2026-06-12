const express = require('express');
const router = express.Router();
const db = require('../db');

// GET  all expenses
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM expenses ORDER BY date DESC';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST add a new expense
router.post('/', (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO expenses (title, amount, category,date) VALUES ( ?, ?, ?, ?)';
    const values = [title, amount, category, date];

    db.query(sql, values, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Expense added', id: results.insertId });
    });
});

//DELETE an expense from the table

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM expenses WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    });
});

//GET total amount of all the expenses
router.get('/total', (req, res) => {
    const sql = 'SELECT SUM(amount) AS total FROM expenses';

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total: result[0].total || 0 });
    });
});

router.get('/', (req, res) => {
    res.json({ message: 'Expenses Rout Workinng' });
});

module.exports = router;