import { ClientService } from "../layers/application/ClientService.js";
import { ConversationService } from "../layers/application/ConversationService.js";
import { ClientRepository } from "../layers/domain/repositories/ClientRepository.js";
import { ConversationRepository } from "../layers/domain/repositories/ConversationRepositorys.js";
import * as constants from "./constants.js";

class SocketServer {
    constructor(io, ws_manager, middlewares, socket_service) {
        this.io = io;
        this.middlewares = middlewares;
        this.socket_service = socket_service;
        this.ws_manager = ws_manager;

        // namespace of chat
        this.chat_namespace = this.io
            .of(constants.socket.namespaces.chats)
            .use(this.middlewares.authenticate);
    }

    chatEvents() {
        this.chat_namespace.on(
            constants.socket.events.connection,
            async (socket) => {
                console.log(constants.socket.logs.connected);

                // add user connected
                this.socket_service.addUser({
                    uuid: socket.uuid,
                    data: {
                        socket_id: socket.id,
                        ...socket.user,
                    },
                });

                console.log(this.socket_service.getUsers());

                // disconnect
                socket.on(constants.socket.events.disconnect, () => {
                    console.log(constants.socket.logs.disconnected);
                });

                // list clients
                const client_service = new ClientService(
                    new ClientRepository()
                );

                const list_clients = await client_service.getAll();

                if (list_clients.ok) {
                    list_clients.result = list_clients.result.map((client) => {
                        const { phone, name, uuid, ...rest } = client;

                        return { phone, name, uuid };
                    });
                }

                socket.emit(constants.socket.events.list_clients, list_clients);

                // list conversations by user
                const conversation_service = new ConversationService(
                    new ConversationRepository(this.ws_manager)
                );

                socket.on(
                    constants.socket.events.get_messages,
                    async (data) => {
                        if (data) {
                            let conversations =
                                await conversation_service.getOneByField({
                                    field: "client",
                                    value: data.uuid,
                                });

                            if (conversations.ok) {
                                const client_chat =
                                    await client_service.getById(
                                        conversations.result.client
                                    );

                                if (client_chat.ok) {
                                    conversations.result = {
                                        ...conversations.result,
                                        client: {
                                            uuid: client_chat.result.uuid,
                                            name: client_chat.result.name,
                                            phone: client_chat.result.phone,
                                        },
                                    };
                                }
                            }

                            socket.emit(
                                constants.socket.events.list_messages,
                                conversations
                            );
                        }
                    }
                );

                // received new message
                socket.on(
                    constants.socket.events.send_message,
                    async (message) => {
                        message.from = socket.uuid;

                        const new_message = await conversation_service.create(
                            message
                        );

                        socket.emit(
                            constants.socket.events.received_message,
                            new_message
                        );
                    }
                );
            }
        );
    }
}

export { SocketServer };
