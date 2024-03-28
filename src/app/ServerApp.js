import cors from "cors";
import http from "http";
import path from "path";
import morgan from "morgan";
import express from "express";
import fileUpload from "express-fileupload";
import * as server_contants from "./constants.js";
import { Server } from "socket.io";
import { __dirname } from "../system.variables.js";
import { DatabaseConnection } from "../database/DatabaseConnection.js";
import { UserRoutes } from "../layers/infrastructure/routes/UserRoutes.js";
import { UserController } from "../layers/infrastructure/controllers/UserController.js";
import { UserService } from "../layers/application/UserService.js";
import { UserRepository } from "../layers/domain/repositories/UserRepository.js";
import { ClientRoutes } from "../layers/infrastructure/routes/ClientRoutes.js";
import { ClientController } from "../layers/infrastructure/controllers/ClientController.js";
import { ClientService } from "../layers/application/ClientService.js";
import { ClientRepository } from "../layers/domain/repositories/ClientRepository.js";
import { ConversationRoutes } from "../layers/infrastructure/routes/ConversationRoutes.js";
import { ConversationController } from "../layers/infrastructure/controllers/ConversationController.js";
import { ConversationService } from "../layers/application/ConversationService.js";
import { ConversationRepository } from "../layers/domain/repositories/ConversationRepositorys.js";
import { WhatsAppManager } from "../whatsapp/WhatsappManager.js";
import { WhatsAppRoutes } from "../layers/infrastructure/routes/WhatsappRoutes.js";
import { WhatsAppController } from "../layers/infrastructure/controllers/WhatsappController.js";
import { AuthenticationRoutes } from "../layers/infrastructure/routes/AuthenticationRoutes.js";
import { AuthenticationController } from "../layers/infrastructure/controllers/AuthenticationController.js";
import { AuthenticationService } from "../layers/application/AuthenticationService.js";
import { AuthenticationRepository } from "../layers/domain/repositories/AuthenticationRepository.js";
import { JsonWebTokenMiddleware } from "../layers/infrastructure/middlewares/JsonWebTokenMiddleware.js";
import { SocketServer } from "./SocketServer.js";
import { SocketMiddlewares } from "../layers/infrastructure/middlewares/SocketMiddlewares.js";
import { BackgroundTask } from "./BackgroundTask.js";
import { SocketService } from "../layers/application/SocketService.js";

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

        this.app.use(morgan(server_contants.server_config.morgan_mode));

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
            server_contants.server_config.routes.auth,
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
            server_contants.server_config.routes.users,
            new UserRoutes(
                new UserController(new UserService(new UserRepository()))
            ).routes()
        );

        // clients routes
        this.app.use(
            server_contants.server_config.routes.clients,
            new ClientRoutes(
                new ClientController(new ClientService(new ClientRepository()))
            ).routes()
        );

        // conversations routes
        this.app.use(
            server_contants.server_config.routes.conversation,
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
            server_contants.server_config.routes.whatsapp,
            new WhatsAppRoutes(new WhatsAppController()).routes()
        );
    }

    socket() {
        const socket_server = new SocketServer(
            this.io,
            this.ws_manager,
            new SocketMiddlewares(new JsonWebTokenMiddleware()),
            new SocketService()
        );

        socket_server.chatEvents();
    }

    celery() {
        const background_manager = new BackgroundTask(
            this.io,
            new SocketService()
        );

        // listeners
        background_manager.sendMessageWhatsAppToUser();
    }

    listen() {
        // init listen server
        this.http_server.listen(server_contants.server_config.port, () => {
            console.log(
                `${server_contants.server_config.message_running} ${server_contants.server_config.host_running}:${server_contants.server_config.port}`
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
