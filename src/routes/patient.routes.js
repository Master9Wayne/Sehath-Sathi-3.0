// fileName: patient.routes.js
import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { 
    addPatient, 
    getPatientsForUser, 
    updatePatient, 
    deletePatient,
    getPatientById
} from '../controllers/patient.controller.js';

const router = Router();

router.route('/').post(verifyJWT, addPatient);
router.route('/').get(verifyJWT, getPatientsForUser);
// Consistency Fix: Using /detail/:id route for GET
router.route('/detail/:id').get(verifyJWT, getPatientById); 
router.route('/:id').put(verifyJWT, updatePatient);

router.route('/:id').delete(verifyJWT, deletePatient);

export default router;
