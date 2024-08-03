import mongoose from "mongoose";
import { AppConstants } from "#app";

class DatabaseConnection {

    async connect() {
        try {
            await mongoose.connect(AppConstants.db_config.string_connection);

            console.log(AppConstants.db_config.message_connect);
        } catch (error) {
            console.log(error);

            throw new Error(AppConstants.db_config.message_error_connect);
        }
    }
}

export { DatabaseConnection };
