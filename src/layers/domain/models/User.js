import mongoose from "mongoose";

const User = mongoose.Schema({
    uuid: {
        type: String,
        required: true
    },
    name: String,
    is_admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

export default mongoose.model("User", User)