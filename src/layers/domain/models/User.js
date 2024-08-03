import mongoose from "mongoose";
import { AppConstants } from "#app";

const User = mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    name: String,
    is_admin: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: AppConstants.users.roles.all,
    },
    current_active_conversation: { // current active conversations (agent)
        type: Number,
        default: 0
    },
});

export default mongoose.model("User", User);
