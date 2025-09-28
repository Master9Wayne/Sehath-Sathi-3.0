// fileName: schedule.routes.js
import { Router } from 'express'; 
// CHANGE THIS LINE:
import { verifyJWT } from '../middleware/auth.middleware.js'; // <-- Corrected from 'authorize' to 'verifyJWT'
import { 
    createScheduleTemplate, 
    getSchedulesForUser, 
    updateScheduleTemplate, 
    deleteScheduleTemplate 
} from '../controllers/schedule.controller.js'; 

const router = Router(); 

// AND CHANGE THE USAGE HERE:
router.route('/').post(verifyJWT, createScheduleTemplate);         // <-- Corrected
router.route('/').get(verifyJWT, getSchedulesForUser);          // <-- Corrected
router.route('/:scheduleId').put(verifyJWT, updateScheduleTemplate); // <-- Corrected
router.route('/:scheduleId').delete(verifyJWT, deleteScheduleTemplate); // <-- Corrected

export default router;