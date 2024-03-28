import dotenv from "dotenv";

class EnvironmentVariables {
    constructor() {
        // init environment
        this.activate();

        // variables
        this.SERVER_PORT = process.env.SERVER_PORT;
        this.DB_CONNECTION = process.env.DB_CONNECTION;
        this.SERVER_HOST = process.env.SERVER_HOST;

        this.WA_PHONE_NUMBER_EN = process.env.WA_PHONE_NUMBER_EN;
        this.WA_ACCOUNT_ID = process.env.WA_ACCOUNT_ID;
        this.CLOUD_API_ACCESS_TOKEN = process.env.CLOUD_API_ACCESS_TOKEN;
        this.CLOUD_API_VERSION = process.env.CLOUD_API_VERSION;
        this.WEBHOOK_ENDPOINT = process.env.WEBHOOK_ENDPOINT;
        this.WEBHOOK_VERIFICATION_TOKEN = process.env.WEBHOOK_VERIFICATION_TOKEN;
        this.WS_LISTENER_PORT = process.env.WS_LISTENER_PORT;

        this.SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;
        this.EXPIRES_TIME_JWT = parseInt(process.env.EXPIRES_TIME_JWT);
        this.SECRET_KEY_REFRESH = process.env.SECRET_KEY_REFRESH;
        this.EXPIRES_TIME_REFRESH_TOKEN = parseInt(process.env.EXPIRES_TIME_REFRESH_TOKEN);
        
        this.BACKEND_CELERY = process.env.BACKEND_CELERY;
        this.BROKER_CELERY = process.env.BROKER_CELERY;
    }

    activate() {
        dotenv.config();
    }
}

export { EnvironmentVariables };
