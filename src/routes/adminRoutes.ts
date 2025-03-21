import express from 'express';
import { getAllUsers } from '../controller/adminController';

const router = express.Router();

router.get('/users', getAllUsers);


export default router;