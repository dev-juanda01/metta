import dotenv from "dotenv";

class EnvironmentVariables {
    constructor() {
        // init environment
        this.activate();

        // variables
        this.SERVER_PORT = process.env.SERVER_PORT;
        this.DB_CONNECTION = process.env.DB_CONNECTION;

        this.WA_PHONE_NUMBER_EN = process.env.WA_PHONE_NUMBER_EN;
        this.WA_ACCOUNT_ID = process.env.WA_ACCOUNT_ID;
        this.CLOUD_API_ACCESS_TOKEN = process.env.CLOUD_API_ACCESS_TOKEN;
        this.CLOUD_API_VERSION = process.env.CLOUD_API_VERSION;
        this.WEBHOOK_ENDPOINT = process.env.WEBHOOK_ENDPOINT;
        this.WEBHOOK_VERIFICATION_TOKEN = process.env.WEBHOOK_VERIFICATION_TOKEN;
        this.WS_LISTENER_PORT = process.env.WS_LISTENER_PORT;
    }

    activate() {
        dotenv.config();
    }
}

export { EnvironmentVariables };
