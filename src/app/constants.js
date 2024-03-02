import { EnvironmentVariables } from "./EnvironmentVariables.js";

const env_server = new EnvironmentVariables();

const generals = {
    code_status: {
        STATUS_200: 200,
        STATUS_201: 201,
        STATUS_400: 400,
        STATUS_401: 401,
        STATUS_404: 404,
        STATUS_500: 500,
    },
    messages: {
        error_server: "Internal server error",
        created: "Created, Ok!!",
        updated: "Updated, Ok!!",
        deleted: "Deleted, Ok!!",
        not_exists: "Register not exist",
        success_process: "Success process!!",
    },
    types: {
        DATA_TYPE_OBJECT: "object"
    }
};

const server_config = {
    port: env_server.SERVER_PORT,
    message_running: "Server running",
    host_running: "http://localhost",
    routes: {
        users: "/api/users",
        clients: "/api/clients",
        conversation: "/api/conversations",
        whatsapp: "/api/whatsapp/config"
    },
    morgan_mode: "dev",
};

const db_config = {
    message_error_connect: "Error connect database",
    message_connect: "Connect to database success",
    string_connection: env_server.DB_CONNECTION,
};

const users = {
    email_already_exists: "The user with this email already exists",
};

const whatsapp = {
    phone_number_id: env_server.WA_PHONE_NUMBER_EN,
    account_id: env_server.WA_ACCOUNT_ID,
    api_access_token: env_server.CLOUD_API_ACCESS_TOKEN,
    api_version: env_server.CLOUD_API_VERSION,
    webhook_endpoint: env_server.WEBHOOK_ENDPOINT,
    webhook_verification_token: env_server.WEBHOOK_VERIFICATION_TOKEN,
    listener_port: env_server.WS_LISTENER_PORT
};

export { server_config, db_config, generals, users, whatsapp };
