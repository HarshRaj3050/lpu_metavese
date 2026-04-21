const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')

router.post("/register",  authController.userRegister);

router.post("/verify-email", authController.verifyEmail);

router.post("/login", authController.userLogin);

router.post("/logout", authController.logoutUser);



module.exports = router;