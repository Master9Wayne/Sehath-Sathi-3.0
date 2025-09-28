// fileName: src/routes/medicineschedule.routes.js

import { Router } from 'express'; 
import { verifyJWT } from '../middleware/auth.middleware.js'; 
import { 
    assignMedicationToSchedule, 
    getMedicationSchedulesForPatient, 
    deleteMedicationSchedule,
    updateMedicationSchedule
} from '../controllers/medicineschedule.controller.js'; 

const router = Router(); 

router.route('/').post(verifyJWT, assignMedicationToSchedule);

// GET route for fetching the schedule for a patient
router.route('/:patientId').get(verifyJWT, getMedicationSchedulesForPatient);

router.route('/:medScheduleId').delete(verifyJWT, deleteMedicationSchedule);
router.route('/:medScheduleId').put(verifyJWT, updateMedicationSchedule);

export default router;