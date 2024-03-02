import mongoose from "mongoose";

const Client = mongoose.Schema({
    uuid: {
        type: String,
        required: true
    },
    name: String,
    phone: {
        type: String,
        required: true
    }
})

export default mongoose.model("Client", Client)