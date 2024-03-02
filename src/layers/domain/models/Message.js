import mongoose from "mongoose";

export const Message = mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date(),
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    ws_id: {
        type: String,
        required: true
    },
    timestamp: String,
    is_read: {
        type: Boolean,
        default: false
    }
});