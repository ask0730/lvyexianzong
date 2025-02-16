import express from 'express';
import favoriteRouter from './favorite';

const router = express.Router();

// ... 其他路由 ...

router.use('/webapi/news', favoriteRouter);

export default router; 