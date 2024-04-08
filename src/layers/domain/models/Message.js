import mongoose, { Schema } from "mongoose";

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
    to: String,
    type: {
        type: String,
        required: true
    },
    body: Schema.Types.Mixed,
    ws_id: {
        type: String,
        required: false
    },
    timestamp: String,
    is_read: {
        type: Boolean,
        default: false
    }
});