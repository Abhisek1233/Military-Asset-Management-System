import express from 'express';
import { 
  getAssignments, 
  createAssignment, 
  getExpenditures, 
  createExpenditure 
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// /api/assignments
router.get('/', enforceBaseScope, getAssignments);
router.post('/', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createAssignment);

// /api/assignments/expenditures
router.get('/expenditures', enforceBaseScope, getExpenditures);
router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER'), createExpenditure);

export default router;
