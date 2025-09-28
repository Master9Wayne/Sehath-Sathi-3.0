import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Medicine } from "../models/medicine.model.js";

const addMedicine = asyncHandler( async (req, res) => {
    const {name, stock} = req.body;
    const { patientId } = req.params;
    const user = req.user;

    if (!name || stock === undefined) {
        throw new ApiError(400, "Name and stock are required");      
    }

    if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
        throw new ApiError(403, "Forbidden: Patient does not belong to this user");
    }
    
    const existedMedicine = await Medicine.findOne({ name, patient: patientId });
    if (existedMedicine) {
        throw new ApiError(409, `Medicine '${name}' already exists for this patient. Use update instead.`);
    }

    const medicine = await Medicine.create({
        name,
        stock,
        patient: patientId
    });

    return res.status(201).json(new ApiResponse(201, medicine, "Medicine added successfully"));
});

const getMedicationsForPatient = asyncHandler(async(req, res) => {
    const { patientId } = req.params;
    const user = req.user;

    if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
        throw new ApiError(403, "Forbidden: Patient does not belong to this user");
    }

    const medicines = await Medicine.find({ patient: patientId });

    return res.status(200).json(new ApiResponse(200, medicines, "Medications fetched successfully"));
});

const updateMedicine = asyncHandler(async(req, res) => {
    const { medicationId } = req.params;
    const { name, stock } = req.body;
    const user = req.user;

    if (!name && stock === undefined) {
        throw new ApiError(400, "Either name or stock is required");
    }

    const medicine = await Medicine.findById(medicationId);
    if (!medicine) {
        throw new ApiError(404, "Medicine not found");
    }

    if (!user.patientsList.map(p => p.toString()).includes(medicine.patient.toString())) {
        throw new ApiError(403, "Forbidden: You do not own this patient's medication");
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicationId,
        { $set: { name, stock } },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedMedicine, "Medicine details updated successfully"));
});

const deleteMedicine = asyncHandler(async(req, res)=>{
    const { medicationId } = req.params;
    const user = req.user;

    const medicine = await Medicine.findById(medicationId);
    if (!medicine) {
        throw new ApiError(404, "Medicine not found");
    }
     if (!user.patientsList.map(p => p.toString()).includes(medicine.patient.toString())) {
        throw new ApiError(403, "Forbidden: You do not own this patient's medication");
    }

    await Medicine.findByIdAndDelete(medicationId);
    
    return res.status(200).json(new ApiResponse(200, null, "Medicine deleted successfully"));
});

export {
    addMedicine,
    getMedicationsForPatient,
    updateMedicine,
    deleteMedicine
};