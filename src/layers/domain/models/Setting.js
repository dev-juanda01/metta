import mongoose from "mongoose";
import * as constants from "../../../app/constants.js";

const Setting = mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    // user: { type: String, required: true, },
    maximum_active_conversation: { // maximum active conversations (agent) 
        type: Number,
        default: 1,
    },
    expired_time: {
        type: Number,
        default: 4,
        min: 4,
        max: 24,
    },
});

export default mongoose.model("Setting", Setting);
