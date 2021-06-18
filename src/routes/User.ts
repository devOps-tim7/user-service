import express from 'express';
import UserController from '../controllers/UserController';
import loggedIn from '../middleware/Auth';

const router = express.Router();

router.get('/ping', UserController.ping);

router.post('/', UserController.register);
router.put('/', loggedIn, UserController.update);
router.get('/', UserController.getAll);
router.get('/:username', UserController.get);
router.get('/auth/:username', UserController.getForAuth);
router.post('/ban/:id', UserController.ban);
router.post('/approve/:id', UserController.approveAgent);

export default router;
