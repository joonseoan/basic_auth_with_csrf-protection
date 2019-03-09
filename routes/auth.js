const express = require('express');
const router = express.Router();

const {
    
    getLogin,
    postLogin,
    postLogout,
    postSignup,
    getSignup

    
} = require('../controllers/auth');

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.post('/login', postLogin);

router.post('/signup', postSignup);

router.post('/logout', postLogout);

module.exports = router;