// import mongoose,{Schema} from "mongoose"

// const medicineSchema = new Schema({
//     patient : {
//         type : Schema.Types.ObjectId,
//         ref : "Patient",
//         required : true
//     },
//     name : {
//         type : String,
//         required : true,
//         index : true,
//     },
//     stock : {
//         type: Number,
//         required : true
//     }
// },{timestamps : true})

// export const Medicine = mongoose.model("Medicine",medicineSchema)

// fileName: src/models/medicine.model.js (Hypothetical)

import mongoose, { Schema } from "mongoose";

const medicineSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        // REMOVE unique: true here!
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    }
}, { timestamps: true });


// <<< CRITICAL FIX: Add a compound unique index >>>
medicineSchema.index({ name: 1, patient: 1 }, { unique: true });


export const Medicine = mongoose.model("Medicine", medicineSchema);