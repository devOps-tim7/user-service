import express from 'express';
import RelationController from '../controllers/RelationController';
import loggedIn from '../middleware/Auth';

const router = express.Router();

router.get('/', loggedIn, RelationController.getAll);
router.post('/', loggedIn, RelationController.createRelation);
router.post('/accept', loggedIn, RelationController.acceptRequest);
router.post('/reject', loggedIn, RelationController.rejectRequest);

export default router;
