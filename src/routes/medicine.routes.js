// import { Router } from 'express';
// import { verifyJWT } from '../middleware/auth.middleware.js';
// import { 
//     addMedicine, 
//     getMedicationsForPatient, 
//     updateMedicine, 
//     deleteMedicine 
// } from '../controllers/medicine.controller.js';

// const router = Router();

// router.route('/:patientId').post(verifyJWT, addMedicine); 
// router.route('/:patientId').get(verifyJWT, getMedicationsForPatient);
// router.route('/item/:medicationId').put(verifyJWT, updateMedicine); 
// router.route('/item/:medicationId').delete(verifyJWT, deleteMedicine);

// export default router;

// fileName: src/routes/medicine.routes.js
import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { 
    addMedicine, 
    getMedicationsForPatient, 
    updateMedicine, 
    deleteMedicine 
} from '../controllers/medicine.controller.js';

const router = Router();

// POST and GET routes are for patient-specific actions (add new, get all)
router.route('/:patientId').post(verifyJWT, addMedicine); 
router.route('/:patientId').get(verifyJWT, getMedicationsForPatient);

// PUT and DELETE routes are for item-specific actions (update stock, delete)
router.route('/item/:medicationId').put(verifyJWT, updateMedicine); // Used for stock update
router.route('/item/:medicationId').delete(verifyJWT, deleteMedicine);

export default router;