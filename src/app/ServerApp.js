import cors from "cors";
import http from "http";
import path from "path";
import morgan from "morgan";
import express from "express";
import fileUpload from "express-fileupload";
import { Server } from "socket.io";
import { AppConstants } from "#app";
import { __dirname } from "#core";
import { SocketServer, BackgroundTask, ScheduledTask } from "#app";
import { DatabaseConnection } from "#database";
import { WhatsAppManager } from "#whatsapp";
import {
    UserRoutes,
    ClientRoutes,
    ConversationRoutes,
    WhatsAppRoutes,
    AuthenticationRoutes,
    SettingRoutes,
} from "#layers/infrastructure/routes";
import {
    UserController,
    ClientController,
    ConversationController,
    WhatsAppController,
    AuthenticationController,
    SettingController,
} from "#layers/infrastructure/controllers";
import {
    UserService,
    ClientService,
    ConversationService,
    AuthenticationService,
    SocketService,
    SettingService,
} from "#layers/application/services";
import {
    UserRepository,
    ClientRepository,
    ConversationRepository,
    AuthenticationRepository,
    SettingRepository,
} from "#layers/domain/repositories";
import {
    JsonWebTokenMiddleware,
    SocketMiddlewares,
} from "#layers/infrastructure/middlewares";

class ServerApp {
    constructor() {
        this.app = express();
        this.http_server = http.createServer(this.app);
        this.database_connection = new DatabaseConnection();
        this.ws_manager = new WhatsAppManager(this.app);
        this.io = new Server(this.http_server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["my-custom-header"],
                credentials: false,
            },
        });
    }

    middlewares() {
        this.app.use(cors());

        this.app.use(morgan(AppConstants.server_config.morgan_mode));

        this.app.use(express.static(path.join(__dirname, "/public")));

        this.app.use(express.json());

        this.app.use(
            express.urlencoded({
                extended: false,
            })
        );

        this.app.use(
            fileUpload({
                useTempFiles: true,
                tempFileDir: "/tmp/",
                createParentPath: true,
            })
        );
    }

    routes() {
        // authenticate routes
        this.app.use(
            AppConstants.server_config.routes.auth,
            new AuthenticationRoutes(
                new AuthenticationController(
                    new AuthenticationService(
                        new AuthenticationRepository(
                            new JsonWebTokenMiddleware()
                        )
                    )
                )
            ).routes()
        );

        // users routes
        this.app.use(
            AppConstants.server_config.routes.users,
            new UserRoutes(
                new UserController(new UserService(new UserRepository()))
            ).routes()
        );

        // clients routes
        this.app.use(
            AppConstants.server_config.routes.clients,
            new ClientRoutes(
                new ClientController(new ClientService(new ClientRepository()))
            ).routes()
        );

        // conversations routes
        this.app.use(
            AppConstants.server_config.routes.conversation,
            new ConversationRoutes(
                new ConversationController(
                    new ConversationService(
                        new ConversationRepository(this.ws_manager)
                    )
                )
            ).routes()
        );

        // whatsapp routes
        this.app.use(
            AppConstants.server_config.routes.whatsapp,
            new WhatsAppRoutes(new WhatsAppController()).routes()
        );

        // settings routes
        this.app.use(
            AppConstants.server_config.routes.setting,
            new SettingRoutes(
                new SettingController(
                    new SettingService(new SettingRepository())
                )
            ).routes()
        );
    }

    /**
     * Socket management events
     */
    socket() {

        SocketServer.createSocket({
            io: this.io,
            ws_manager: this.ws_manager,
            middlewares: new SocketMiddlewares(new JsonWebTokenMiddleware()),
            socket_service: new SocketService(),
        });

    }

    celery() {
        const background_manager = new BackgroundTask(
            this.io,
            new SocketService(),
            new ScheduledTask()
        );

        // listeners
        background_manager.sendMessageWhatsAppToUser();
        background_manager.sendExpiredConversation();
        background_manager.conversationAssignmentToAgent();
    }

    listen() {
        // init listen server
        this.http_server.listen(AppConstants.server_config.port, () => {
            console.log(
                `${AppConstants.server_config.message_running} ${AppConstants.server_config.host_running}:${AppConstants.server_config.port}`
            );
        });
    }

    running() {
        this.listen();
        this.celery();
        this.middlewares();
        this.routes();
        this.socket();
        this.database_connection.connect();
        this.ws_manager.runningWebhooks();
    }
}

export { ServerApp };
