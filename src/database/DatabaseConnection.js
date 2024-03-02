import mongoose from "mongoose";
import { db_config } from "../app/constants.js";

class DatabaseConnection {

    async connect() {
        try {
            await mongoose.connect(db_config.string_connection);

            console.log(db_config.message_connect);
        } catch (error) {
            console.log(error);

            throw new Error(db_config.message_error_connect);
        }
    }
}

export { DatabaseConnection };
