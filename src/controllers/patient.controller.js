// import { asyncHandler } from "../utilities/asyncHandler.js";
// import { ApiError } from "../utilities/ApiError.js";
// import { ApiResponse } from "../utilities/ApiResponse.js";
// import { Patient } from "../models/patient.model.js";
// import { User } from "../models/user.model.js";

// const addPatient = asyncHandler(async (req, res) => {
//     const { fullName, phonenumber } = req.body;
//     const caretaker = req.user;
//     if (!fullName) {
//         throw new ApiError(400, "Full Name is required");
//     }
//     const patient = await Patient.create({ caretaker: caretaker._id, fullName, phonenumber });
//     const user = await User.findById(caretaker._id);
//     user.patientsList.push(patient._id);
//     await user.save({ validateBeforeSave: false });
//     return res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
// });

// const getPatientsForUser = asyncHandler(async (req, res) => {
//     const user = await User.findById(req.user._id).populate("patientsList");
//     if (!user) throw new ApiError(404, "User not found.");
//     return res.status(200).json(new ApiResponse(200, user.patientsList, "Patients fetched successfully"));
// });

// const updatePatient = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { fullName, phonenumber } = req.body;
//     const user = req.user;
//     if (!fullName && !phonenumber) throw new ApiError(400, "Full Name or Phone Number is required to update");
//     if (!user.patientsList.map(p => p.toString()).includes(id)) throw new ApiError(403, "Forbidden: Patient does not belong to this user");
//     const updatedPatient = await Patient.findByIdAndUpdate(id, { $set: { fullName, phonenumber } }, { new: true });
//     if (!updatedPatient) throw new ApiError(404, "Patient not found");
//     return res.status(200).json(new ApiResponse(200, updatedPatient, "Patient details updated successfully"));
// });

// const deletePatient = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const user = await User.findById(req.user._id);
//     if (!user.patientsList.map(p => p.toString()).includes(id)) throw new ApiError(403, "Forbidden: Patient does not belong to this user");
//     user.patientsList = user.patientsList.filter(pId => pId.toString() !== id);
//     await user.save({ validateBeforeSave: false });
//     await Patient.findByIdAndDelete(id);
//     return res.status(200).json(new ApiResponse(200, null, "Patient deleted successfully"));
// });

// const getPatientById = asyncHandler(async (req, res) => {
//     const { patientId } = req.params;
//     const user = req.user;
//     if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
//         throw new ApiError(403, "Forbidden: You are not authorized to view this patient");
//     }
//     const patient = await Patient.findById(patientId);
//     if (!patient) throw new ApiError(404, "Patient not found");
//     return res.status(200).json(new ApiResponse(200, patient, "Patient details fetched successfully"));
// });

// export { addPatient, getPatientsForUser, updatePatient, deletePatient, getPatientById };

import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { User } from "../models/user.model.js";

const addPatient = asyncHandler(async (req, res) => {
    const { fullName, phonenumber } = req.body;
    const caretaker = req.user;
    if (!fullName) {
        throw new ApiError(400, "Full Name is required");
    }
    const patient = await Patient.create({ caretaker: caretaker._id, fullName, phonenumber });
    const user = await User.findById(caretaker._id);
    user.patientsList.push(patient._id);
    await user.save({ validateBeforeSave: false });
    return res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
});

const getPatientsForUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("patientsList");
    if (!user) throw new ApiError(404, "User not found.");
    return res.status(200).json(new ApiResponse(200, user.patientsList, "Patients fetched successfully"));
});

const updatePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, phonenumber } = req.body;
    const user = req.user;
    if (!fullName && !phonenumber) throw new ApiError(400, "Full Name or Phone Number is required to update");
    if (!user.patientsList.map(p => p.toString()).includes(id)) throw new ApiError(403, "Forbidden: Patient does not belong to this user");
    const updatedPatient = await Patient.findByIdAndUpdate(id, { $set: { fullName, phonenumber } }, { new: true });
    if (!updatedPatient) throw new ApiError(404, "Patient not found");
    return res.status(200).json(new ApiResponse(200, updatedPatient, "Patient details updated successfully"));
});

const deletePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user.patientsList.map(p => p.toString()).includes(id)) {
        throw new ApiError(403, "Forbidden: Patient does not belong to this user");
    }
    
    // 1. Remove Patient ID from User's list
    user.patientsList = user.patientsList.filter(pId => pId.toString() !== id);
    await user.save({ validateBeforeSave: false });
    
    // 2. Delete the Patient document
    await Patient.findByIdAndDelete(id);
    
    // Note: To be fully robust, you would also need to delete:
    // - All MedicineSchedule entries linked to this patient's Medicine IDs.
    // - All Medicine entries linked to this patient ID.
    // For now, we rely on the core User/Patient deletion.

    return res.status(200).json(new ApiResponse(200, null, "Patient deleted successfully"));
});

const getPatientById = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const user = req.user;
    if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
        throw new ApiError(403, "Forbidden: You are not authorized to view this patient");
    }
    const patient = await Patient.findById(patientId);
    if (!patient) throw new ApiError(404, "Patient not found");
    return res.status(200).json(new ApiResponse(200, patient, "Patient details fetched successfully"));
});

export { addPatient, getPatientsForUser, updatePatient, deletePatient, getPatientById };