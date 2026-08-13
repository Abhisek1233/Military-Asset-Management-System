import express from 'express';
import { getTransfers, createTransfer } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', enforceBaseScope, getTransfers);
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), createTransfer);

export default router;
