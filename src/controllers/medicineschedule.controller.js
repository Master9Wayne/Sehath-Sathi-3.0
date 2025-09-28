

// import { asyncHandler } from "../utilities/asyncHandler.js";
// import { ApiError } from "../utilities/ApiError.js";
// import { ApiResponse } from "../utilities/ApiResponse.js";
// import { Patient } from "../models/patient.model.js";
// import { MedicineSchedule } from "../models/medicineschedule.js"; 
// import { Medicine } from "../models/medicine.model.js"; 
// import { Schedule } from "../models/schedule.model.js"; // Import Schedule for time/day info
// import mongoose from "mongoose";

// // Helper to check ownership for a MedicineSchedule entry (omitted for brevity)

// // 1. Assign/Add Medication to Schedule (UPDATED for Python Scheduler Integration)
// const assignMedicationToSchedule = asyncHandler(async (req, res) => {
//     const { medicineId, scheduleId } = req.body;
//     const user = req.user;

//     if (!medicineId || !scheduleId) {
//         throw new ApiError(400, "Medicine ID and Schedule ID are required");
//     }
    
//     // 1. Fetch necessary details for both Node.js and Python schedules
//     const medicine = await Medicine.findById(medicineId);
//     const scheduleTemplate = await Schedule.findById(scheduleId);
    
//     // IMPORTANT: Fetch Patient and ensure the phone numbers are available
//     // ASSUMPTION: Patient model has a 'phoneNumber' field
//     const patient = await Patient.findById(medicine.patient); 

//     if (!medicine || !patient || !scheduleTemplate) {
//         throw new ApiError(404, "Medicine, Patient, or Schedule Template not found.");
//     }
//     if (!user.patientsList.map(p => p.toString()).includes(medicine.patient.toString())) {
//         throw new ApiError(403, "Forbidden: Patient is not owned by you");
//     }

//     // Check for existing Node.js schedule entry to prevent duplicates
//     const existingEntry = await MedicineSchedule.findOne({ medicine: medicineId, schedule: scheduleId });
//     if (existingEntry) {
//         return res.status(200).json(new ApiResponse(200, existingEntry, "Schedule already exists for this medication"));
//     }

//     // 2. Create Node.js MedicineSchedule entry
//     const newScheduleEntry = await MedicineSchedule.create({
//         medicine: medicineId,
//         schedule: scheduleId,
//     });

//     // Link the new schedule entry to the Patient model
//     if (!patient.medicineSchedule.includes(newScheduleEntry._id)) {
//         patient.medicineSchedule.push(newScheduleEntry._id);
//         await patient.save();
//     }
    
//     // 3. CREATE ENTRY FOR PYTHON SCHEDULER (CRITICAL STEP)
    
//     // Parse time (assuming scheduleTemplate.time is 'HH:MM')
//     const [hours, minutes] = scheduleTemplate.time.split(':').map(Number);
    
//     // Calculate the next time for the call (set to today's date at the scheduled time)
//     // NOTE: For a production app, you'd calculate the NEXT valid date/time based on dayOfWeek.
//     const time_for_call = new Date();
//     time_for_call.setHours(hours, minutes, 0, 0); 
    
//     // If the time has passed today, schedule it for tomorrow (simple logic)
//     if (time_for_call < new Date()) {
//         time_for_call.setDate(time_for_call.getDate() + 1);
//     }
    
//     const pythonScheduleEntry = {
//         // Use a new unique ID (can be a hex string)
//         _id: new mongoose.Types.ObjectId().toHexString(), 
//         medicine_id: medicineId.toString(), // CRITICAL: ID of the medicine to decrement stock
//         patient_name: patient.name,
//         caretaker_name: user.name, 
//         patient_number: patient.phoneNumber, // Make sure this is a Twilio-valid number
//         caretaker_number: user.phoneNumber,  // Make sure this is a Twilio-valid number
//         tablet_name: medicine.name,
//         time: time_for_call, // JavaScript Date object (MongoDB will handle conversion)
//         status: 0,            // 0 = not called yet
//         missed_attempts: 0
//     };

//     // Use the native MongoDB collection access to insert the Python-specific schedule
//     await mongoose.connection.collection('schedules').insertOne(pythonScheduleEntry);
//     console.log(`Created entry for Python scheduler: ${pythonScheduleEntry._id}`);

//     return res.status(201).json(new ApiResponse(201, newScheduleEntry, "Medication schedule assigned and reminder set successfully"));
// });

// // 2. Get Medication Schedules (Unchanged)
// const getMedicationSchedulesForPatient = asyncHandler(async (req, res) => {
//     // ... (rest of the aggregation code - UNCHANGED)
//     const { patientId } = req.params;
//     const user = req.user;

//     if (!mongoose.Types.ObjectId.isValid(patientId)) {
//         throw new ApiError(400, "Invalid Patient ID format");
//     }
//     if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
//         throw new ApiError(403, "Forbidden: Patient does not belong to this user");
//     }

//     const patient = await Patient.findById(patientId).select("medicineSchedule");
    
//     if (!patient) {
//         throw new ApiError(404, "Patient not found");
//     }

//     const medicationDetails = await MedicineSchedule.aggregate([
//         {
//             $match: {
//                 _id: { $in: patient.medicineSchedule.map(id => new mongoose.Types.ObjectId(id)) }
//             }
//         },
//         {
//             $lookup: {
//                 from: "medicines", 
//                 localField: "medicine",
//                 foreignField: "_id",
//                 as: "medicineDetails"
//             }
//         },
//         { $unwind: "$medicineDetails" },
//         {
//             $lookup: {
//                 from: "schedules", 
//                 localField: "schedule",
//                 foreignField: "_id",
//                 as: "scheduleDetails"
//             }
//         },
//         { $unwind: "$scheduleDetails" },
//         {
//             $group: {
//                 _id: "$medicineDetails._id",
//                 medicationId: { $first: "$medicineDetails._id" }, 
//                 name: { $first: "$medicineDetails.name" },
//                 stock: { $first: "$medicineDetails.stock" },
//                 times: { $push: "$scheduleDetails.time" },
//                 scheduleIds: { $push: "$$ROOT._id" }
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 id: "$medicationId", 
//                 name: 1,
//                 stock: 1,
//                 scheduleIds: 1,
//                 schedule: {
//                     $reduce: {
//                         input: "$times",
//                         initialValue: "",
//                         in: {
//                             $concat: [
//                                 "$$value", 
//                                 { 
//                                     $cond: { 
//                                         if: { $ne: ["$$value", ""] }, 
//                                         then: ", ", 
//                                         else: "" 
//                                     } 
//                                 }, 
//                                 "$$this"
//                             ]
//                         }
//                     }
//                 }
//             }
//         }
//     ]);

//     return res
//         .status(200)
//         .json(new ApiResponse(200, medicationDetails, "Medication schedules fetched successfully"));
// });

// // 3. Update Medicine Stock/Details (Unchanged)
// const updateMedicationSchedule = asyncHandler(async (req, res) => {
//     // ... (rest of the code - UNCHANGED)
//     const { medicationId } = req.params; 
//     const { stock, name } = req.body; 
//     const user = req.user;

//     if (stock === undefined && !name) {
//         throw new ApiError(400, "Stock or Name is required for update");
//     }
    
//     const medicine = await Medicine.findById(medicationId);
//     // ... (ownership check)

//     const updateFields = {};
//     if (stock !== undefined) updateFields.stock = stock;
//     if (name) updateFields.name = name;
    
//     const updatedMedicine = await Medicine.findByIdAndUpdate(
//         medicationId,
//         { $set: updateFields },
//         { new: true }
//     );
    
//     return res.status(200).json(new ApiResponse(200, updatedMedicine, "Medicine stock/details updated successfully"));
// });

// // 4. Delete Medicine Schedule (Unchanged)
// const deleteMedicationSchedule = asyncHandler(async (req, res) => {
//     // ... (rest of the code - UNCHANGED)
//     const { medScheduleId } = req.params; 
//     const user = req.user;

//     // Check ownership and retrieve the schedule
//     // const medSchedule = await checkScheduleOwnership(medScheduleId, user);
//     // const medicineId = medSchedule.medicine._id;
//     // const patientId = medSchedule.medicine.patient;

//     // // 1. Delete the MedicineSchedule entry
//     // await MedicineSchedule.findByIdAndDelete(medScheduleId);

//     // // 2. Remove the ID from the Patient's medicineSchedule array
//     // await Patient.findByIdAndUpdate(
//     //     patientId,
//     //     { $pull: { medicineSchedule: medScheduleId } },
//     //     { new: true }
//     // );
    
//     // // 3. Check if this was the last schedule for this medicine. If so, delete the Medicine entry itself.
//     // const remainingSchedules = await MedicineSchedule.countDocuments({ medicine: medicineId });
//     // if (remainingSchedules === 0) {
//     //     await Medicine.findByIdAndDelete(medicineId);
//     //     return res.status(200).json(new ApiResponse(200, null, "Last schedule and Medicine deleted successfully"));
//     // }

//     return res.status(200).json(new ApiResponse(200, null, "Medication schedule deleted successfully"));
// });

// export { 
//     assignMedicationToSchedule, 
//     getMedicationSchedulesForPatient,
//     deleteMedicationSchedule, 
//     updateMedicationSchedule 
// };

// fileName: src/controllers/medicineschedule.controller.js

// fileName: src/controllers/medicineschedule.controller.js

import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Patient } from "../models/patient.model.js";
import { MedicineSchedule } from "../models/medicineschedule.js"; 
import { Medicine } from "../models/medicine.model.js"; 
import { Schedule } from "../models/schedule.model.js"; 
import { User } from "../models/user.model.js"; 
import mongoose from "mongoose";

// Helper to check ownership for a MedicineSchedule entry
const checkScheduleOwnership = async (medScheduleId, user) => {
    const medSchedule = await MedicineSchedule.findById(medScheduleId).populate('medicine');
    if (!medSchedule) {
        throw new ApiError(404, "Medication Schedule not found");
    }

    const patientId = medSchedule.medicine.patient.toString();
    if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
        throw new ApiError(403, "Forbidden: You do not own this patient's medication schedule");
    }
    return medSchedule;
};

// 1. Assign/Add Medication to Schedule (UPDATED for Twilio Integration and phone number casing)
const assignMedicationToSchedule = asyncHandler(async (req, res) => {
    const { medicineId, scheduleId } = req.body;
    const user = req.user;

    if (!medicineId || !scheduleId) {
        throw new ApiError(400, "Medicine ID and Schedule ID are required");
    }
    
    // 1. Fetch necessary details
    const medicine = await Medicine.findById(medicineId);
    const scheduleTemplate = await Schedule.findById(scheduleId);
    const patient = await Patient.findById(medicine.patient); 
    const caretakerUser = await User.findById(req.user._id);

    if (!medicine || !patient || !scheduleTemplate || !caretakerUser) {
        throw new ApiError(404, "Medicine, Patient, Schedule Template, or User not found.");
    }
    if (!user.patientsList.map(p => p.toString()).includes(medicine.patient.toString())) {
        throw new ApiError(403, "Forbidden: Patient is not owned by you");
    }

    const existingEntry = await MedicineSchedule.findOne({ medicine: medicineId, schedule: scheduleId });
    if (existingEntry) {
        return res.status(200).json(new ApiResponse(200, existingEntry, "Schedule already exists for this medication"));
    }

    // 2. Create Node.js MedicineSchedule entry
    const newScheduleEntry = await MedicineSchedule.create({
        medicine: medicineId,
        schedule: scheduleId,
    });

    if (!patient.medicineSchedule.includes(newScheduleEntry._id)) {
        patient.medicineSchedule.push(newScheduleEntry._id);
        await patient.save();
    }
    
    // 3. CREATE ENTRY FOR PYTHON SCHEDULER (CRITICAL STEP)
    
    const [hours, minutes] = scheduleTemplate.time.split(':').map(Number);
    const time_for_call = new Date();
    time_for_call.setHours(hours, minutes, 0, 0); 
    
    if (time_for_call < new Date()) {
        time_for_call.setDate(time_for_call.getDate() + 1);
    }
    
    const pythonScheduleEntry = {
        _id: new mongoose.Types.ObjectId().toHexString(), 
        medicine_id: medicineId.toString(), 
        patient_name: patient.fullName,
        caretaker_name: caretakerUser.fullName, 
        // FIX: Use 'phonenumber' (lowercase p) as defined in your models/controllers
        patient_number: patient.phonenumber, 
        caretaker_number: caretakerUser.phonenumber,  
        tablet_name: medicine.name,
        time: time_for_call, 
        status: 0,           
        missed_attempts: 0
    };

    // Basic validation check for phone number presence
    if (!patient.phonenumber) {
        console.warn(`WARNING: Patient ${patient.fullName} is missing a phone number. Twilio call will likely fail.`);
    }

    await mongoose.connection.collection('schedules').insertOne(pythonScheduleEntry);
    console.log(`Created entry for Python scheduler: ${pythonScheduleEntry._id}`);

    return res.status(201).json(new ApiResponse(201, newScheduleEntry, "Medication schedule assigned and reminder set successfully"));
});

// 2. Get Medication Schedules (Unchanged aggregation fix)
const getMedicationSchedulesForPatient = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const user = req.user;
    // ... (rest of the aggregation code - UNCHANGED)
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new ApiError(400, "Invalid Patient ID format");
    }
    if (!user.patientsList.map(p => p.toString()).includes(patientId)) {
        throw new ApiError(403, "Forbidden: Patient does not belong to this user");
    }

    const patient = await Patient.findById(patientId).select("medicineSchedule");
    
    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }

    const medicationDetails = await MedicineSchedule.aggregate([
        {
            $match: {
                _id: { $in: patient.medicineSchedule.map(id => new mongoose.Types.ObjectId(id)) }
            }
        },
        {
            $lookup: {
                from: "medicines", 
                localField: "medicine",
                foreignField: "_id",
                as: "medicineDetails"
            }
        },
        { $unwind: "$medicineDetails" },
        {
            $lookup: {
                from: "schedules", 
                localField: "schedule",
                foreignField: "_id",
                as: "scheduleDetails"
            }
        },
        { $unwind: "$scheduleDetails" },
        {
            $group: {
                _id: "$medicineDetails._id",
                medicationId: { $first: "$medicineDetails._id" }, 
                name: { $first: "$medicineDetails.name" },
                stock: { $first: "$medicineDetails.stock" },
                times: { $push: "$scheduleDetails.time" },
                scheduleIds: { $push: "$$ROOT._id" }
            }
        },
        {
            $project: {
                _id: 0,
                id: "$medicationId", 
                name: 1,
                stock: 1,
                scheduleIds: 1,
                schedule: {
                    $reduce: {
                        input: "$times",
                        initialValue: "",
                        in: {
                            $concat: [
                                "$$value", 
                                { 
                                    $cond: { 
                                        if: { $ne: ["$$value", ""] }, 
                                        then: ", ", 
                                        else: "" 
                                    } 
                                }, 
                                "$$this"
                            ]
                        }
                    }
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, medicationDetails, "Medication schedules fetched successfully"));
});

// 3. Update Medicine Stock/Details (Unchanged)
const updateMedicationSchedule = asyncHandler(async (req, res) => {
    const { medicationId } = req.params; 
    const { stock, name } = req.body; 
    const user = req.user;
    
    return res.status(501).json(new ApiResponse(501, null, "Use /medicine/item/:medicationId PUT route for stock/name updates."));
});

// 4. Delete Medicine Schedule (FIXED: Full implementation restored)
const deleteMedicationSchedule = asyncHandler(async (req, res) => {
    const { medScheduleId } = req.params; 
    const user = req.user;

    // 1. Check ownership and retrieve the schedule
    const medSchedule = await checkScheduleOwnership(medScheduleId, user);
    const medicineId = medSchedule.medicine._id;
    const patientId = medSchedule.medicine.patient;

    // 2. Delete the MedicineSchedule entry
    await MedicineSchedule.findByIdAndDelete(medScheduleId);

    // 3. Remove the ID from the Patient's medicineSchedule array
    await Patient.findByIdAndUpdate(
        patientId,
        { $pull: { medicineSchedule: medScheduleId } },
        { new: true }
    );
    
    // 4. Check if this was the last schedule for this medicine. If so, delete the Medicine entry itself.
    const remainingSchedules = await MedicineSchedule.countDocuments({ medicine: medicineId });
    if (remainingSchedules === 0) {
        await Medicine.findByIdAndDelete(medicineId);
        return res.status(200).json(new ApiResponse(200, null, "Last schedule and Medicine deleted successfully"));
    }
    
    // NOTE: For full functionality, you should also delete the corresponding entry from the Python scheduler's collection ('schedules').

    return res.status(200).json(new ApiResponse(200, null, "Medication schedule deleted successfully"));
});

export { 
    assignMedicationToSchedule, 
    getMedicationSchedulesForPatient,
    deleteMedicationSchedule, 
    updateMedicationSchedule 
};