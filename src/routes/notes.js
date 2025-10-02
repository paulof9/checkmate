import { Router } from 'express';
import * as controller from '../controllers/notesControllers.js';

const router = Router();

router.get('/', controller.list);
router.get('/info', controller.info);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.delete('/', controller.removeAll);

export default router;