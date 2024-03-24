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
        DATA_TYPE_OBJECT: "object",
    },
};

const server_config = {
    port: env_server.SERVER_PORT,
    message_running: "Server running",
    host_running: "http://localhost",
    routes: {
        users: "/api/users",
        clients: "/api/clients",
        conversation: "/api/conversations",
        whatsapp: "/api/whatsapp/config",
        auth: "/api/auth/"
    },
    morgan_mode: "dev",
};

const jwt = {
    secret_jwt: env_server.SECRET_KEY_JWT,
    expires_time_jwt: env_server.EXPIRES_TIME_JWT,
    secret_refresh_jwt: env_server.SECRET_KEY_REFRESH,
    expires_time_refresh_jwt: env_server.EXPIRES_TIME_REFRESH_TOKEN,
    failed_generate_jwt: "failed to generate token",
    token_not_provider: "token not provider",
    invalid_token: "invalid token provider",
    invalid_refresh_token: "invalid refresh token provider",
    user_not_decoded_token: "user not decoded token"
};

const db_config = {
    message_error_connect: "Error connect database",
    message_connect: "Connect to database success",
    string_connection: env_server.DB_CONNECTION,
};

const users = {
    email_already_exists: "The user with this email already exists",
    user_not_exists: "User not exists in database",
    password_incorrect: "Correo o contraseña son incorrectos",
};

const whatsapp = {
    phone_number_id: env_server.WA_PHONE_NUMBER_EN,
    account_id: env_server.WA_ACCOUNT_ID,
    api_access_token: env_server.CLOUD_API_ACCESS_TOKEN,
    api_version: env_server.CLOUD_API_VERSION,
    webhook_endpoint: env_server.WEBHOOK_ENDPOINT,
    webhook_verification_token: env_server.WEBHOOK_VERIFICATION_TOKEN,
    listener_port: env_server.WS_LISTENER_PORT,
};

const celery = {
    broker: env_server.BROKER_CELERY,
    backend: env_server.BACKEND_CELERY,
    tasks: {
        send_message: "send.message.user"
    }
}

const socket = {
    events: {
        connection: "connection",
        disconnect: "disconnect",
        list_clients: "list:clients",
        get_messages: "get:messages:user",
        list_messages: "list:messages:user",
        send_message: "send:message",
        received_message: "received:message"
    },
    logs: {
        connected: "Socket connected",
        disconnected: "Socket disconnected"
    },
    namespaces: {
        chats: "/chats"
    }
}

export { server_config, db_config, generals, users, whatsapp, jwt, celery, socket };
