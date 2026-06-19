const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

//ENTER
router.post('/signup', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({error : 'Username and password required'});
    }

    try{
        //hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, password) VALUES (?,?)';

        db.query(sql, [username, hashedPassword], (err, result) => {
            if(err) {
                if(err.code === 'ER_DUP_ENTRY'){
                    return res.status(400).json({error: 'Username already taken'})
                }
                return res.status(500).json({error:err.message});
            }
            res.status(201).json({message: 'Account created successfully'});
        });
    }catch (err) {
        res.status(500).json({error: err.message});
    }
});

//LOGIN
router.post('/login', (req,res)=> {
    const {username, password} = req.body;

    if (!username || !password){
        return res.status(400).json({error: 'Username and Password required'});
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        if(results.length === 0){
            return res.status(401).json({error : 'Invalid Username and password'});
        }
        const user = results[0];

        //COMPARE THE GIVEN PASSWORD WITH THNE HASHED PASSWORD GIVEN IN THE DATABASE
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({error : 'Invalid Username or passowrd'});
        }

        //Save user in session
        req.session.user = {id: user.id, username: user.username};
        res.json({message: 'Login Successful', username: user.username});
    });
});

//LOGOUT
router.post('/logout', (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return res.status(500).json({error: 'Logout Failed'});
        }
        res.json({message: 'Logged Out Successfully'});
    });
});

//CHECK IF THE USER IS LOCKED IN
router.get('/me', (req,res) => {
    if(req.session.user){
        res.json({loggedIn: true, username:req.session.user.username})
    }else{
        res.json({loggedIn: false});
    }
});

module.exports = router;