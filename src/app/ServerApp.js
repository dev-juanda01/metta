import express from "express";
import cors from "cors";
import morgan from "morgan";
import * as server_contants from "./constants.js";
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

class ServerApp {
    constructor() {
        this.app = express();
        this.database_connection = new DatabaseConnection();
        this.ws_manager = new WhatsAppManager(this.app);
    }

    middlewares() {
        this.app.use(cors());

        this.app.use(morgan(server_contants.server_config.morgan_mode));

        this.app.use(express.json());

        this.app.use(
            express.urlencoded({
                extended: false,
            })
        );
    }

    routes() {
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
                    new ConversationService(new ConversationRepository())
                )
            ).routes()
        );

        // whatsapp routes
        this.app.use(
            server_contants.server_config.routes.whatsapp,
            new WhatsAppRoutes(new WhatsAppController()).routes()
        );
    }

    listen() {
        // init listen server
        this.app.listen(server_contants.server_config.port, () => {
            console.log(
                `${server_contants.server_config.message_running} ${server_contants.server_config.host_running}:${server_contants.server_config.port}`
            );
        });
    }

    running() {
        this.listen();
        this.middlewares();
        this.routes();
        this.database_connection.connect();
        this.ws_manager.runningWebhooks();
    }
}

export { ServerApp };
