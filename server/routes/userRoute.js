import express from 'express';
import { accountActivation, login, signup } from '../controllers/userController.js';
const router=express.Router();


router.post('/signup', signup);
router.post('/account-activation', accountActivation);
router.post('/login', login);


export default router;
