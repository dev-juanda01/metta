import { EnvironmentVariables } from "./EnvironmentVariables.js";

const env_server = new EnvironmentVariables();

class AppConstants {

    // general variables constants
    static generals = {
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
            unauthorized: "unauthorized",
            forbiden: "forbiden error",
            data_not_provider: "data not provider",
        },
        types: {
            DATA_TYPE_OBJECT: "object",
        },
    };

    // server config all constants
    static server_config = {
        port: env_server.SERVER_PORT,
        server_host: env_server.SERVER_HOST,
        server_host_dir_attach: `${env_server.SERVER_HOST}/attach`,
        message_running: "Server running",
        host_running: "http://localhost",
        routes: {
            users: "/api/users",
            clients: "/api/clients",
            conversation: "/api/conversations",
            whatsapp: "/api/whatsapp/config",
            auth: "/api/auth/",
            setting: "/api/settings",
        },
        morgan_mode: "dev",
    };

    // jwt all constants
    static jwt = {
        secret_jwt: env_server.SECRET_KEY_JWT,
        expires_time_jwt: env_server.EXPIRES_TIME_JWT,
        secret_refresh_jwt: env_server.SECRET_KEY_REFRESH,
        expires_time_refresh_jwt: env_server.EXPIRES_TIME_REFRESH_TOKEN,
        failed_generate_jwt: "failed to generate token",
        token_not_provider: "token not provider",
        invalid_token: "invalid token provider",
        invalid_refresh_token: "invalid refresh token provider",
        user_not_decoded_token: "user not decoded token",
    };

    // database config constants
    static db_config = {
        message_error_connect: "Error connect database",
        message_connect: "Connect to database success",
        string_connection: env_server.DB_CONNECTION,
    };

    // users constants
    static users = {
        email_already_exists: "The user with this email already exists",
        user_not_exists: "User not exists in database",
        password_incorrect: "Correo o contraseña son incorrectos",
        roles: {
            AGENT: "AGENT",
            ADMIN: "ADMIN",
            SUPER_ADMIN: "SUPER_ADMIN",
            all: ["AGENT", "ADMIN", "SUPER_ADMIN"],
        },
    };

    // conversations all constants
    static conversation = {
        expired_conversation: "Esta conversación ha expirado",
    };

    // files all constants
    static files = {
        error_upload: "Error upload files process",
    };

    // whatsapp all constants
    static whatsapp = {
        phone_number_id: env_server.WA_PHONE_NUMBER_EN,
        account_id: env_server.WA_ACCOUNT_ID,
        api_access_token: env_server.CLOUD_API_ACCESS_TOKEN,
        api_version: env_server.CLOUD_API_VERSION,
        webhook_endpoint: env_server.WEBHOOK_ENDPOINT,
        webhook_verification_token: env_server.WEBHOOK_VERIFICATION_TOKEN,
        listener_port: env_server.WS_LISTENER_PORT,
        messages: {
            types: {
                document: "document",
                text: "text",
            },
            type_not_valid: "Este tipo no esta permitido",
            run_server: "Server started listening whatsapp http://localhost",
        },
    };

    // celert all constansts
    static celery = {
        broker: env_server.BROKER_CELERY,
        backend: env_server.BACKEND_CELERY,
        tasks: {
            send_message: "send.message.user",
            send_expired_conversation: "send.expired.conversation",
            send_assigment_conversation: "assigment.conversation",
        },
        scheduler: {
            task_scheduled: "task.scheduled.every.five.seconds",
            task_scheduled_one_minute: "task.scheduled.every.one.minute",
            types: {
                FIVE_SECONDS: "FIVE_SECONDS",
                ONE_MINUTE: "ONE_MINUTE",
            },
        },
    };

    // socket all constants
    static socket = {
        events: {
            connection: "connection",
            disconnect: "disconnect",
            list_clients: "list:clients",
            get_messages: "get:messages:user",
            list_messages: "list:messages:user",
            send_message: "send:message",
            received_message: "received:message",
            expired_conversation: "expired:conversation",
            assigment_client: "assigment:client",
        },
        logs: {
            connected: "Socket connected",
            disconnected: "Socket disconnected",
        },
        namespaces: {
            chats: "/chats",
        },
    };

}

export { AppConstants };