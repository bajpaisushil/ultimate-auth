import express from 'express';
import { accountActivation, forgotPassword, login, resetPassword, signup } from '../controllers/userController.js';
const router=express.Router();


router.post('/signup', signup);
router.post('/account-activation', accountActivation);
router.post('/login', login);
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);


export default router;
