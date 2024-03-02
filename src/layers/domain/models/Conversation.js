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
    messages: [Message],
});

export default mongoose.model("Conversation", Conversation);
