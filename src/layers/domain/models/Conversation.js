import mongoose from "mongoose";
import { Message } from "./Message.js";

const Conversation = mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date(),
    },
    user: String,
    client: String,
    messages: [Message],
    is_activate: {
        type: Boolean,
        default: true,
    }
});

export default mongoose.model("Conversation", Conversation);
