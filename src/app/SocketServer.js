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

                const list_clients = await client_service.getClientsByUserRole(socket.uuid);
                socket.emit(constants.socket.events.list_clients, list_clients);

                // list conversations by user
                const conversation_service = new ConversationService(
                    new ConversationRepository(this.ws_manager)
                );

                socket.on(
                    constants.socket.events.get_messages,
                    async (data) => {
                        let conversations = null;

                        if (data) {

                            conversations = await conversation_service.getConversationClient(socket.uuid, data.uuid);

                            if (conversations.ok) {
                                const client_chat = await client_service.getById(data.uuid);

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
                        } else {
                            conversations = {
                                ok: false,
                                status: constants.generals.code_status.STATUS_400,
                                msg: constants.generals.messages.data_not_provider,
                            };
                        }

                        socket.emit(
                            constants.socket.events.list_messages,
                            conversations
                        );
                    }
                );

                // received new message
                socket.on(
                    constants.socket.events.send_message,
                    async (message) => {
                        message.from = socket.uuid;

                        let new_message = await conversation_service.create(
                            message
                        );

                        if(new_message.result && new_message.result.messages) {
                            new_message.result = new_message.result.messages[0]
                        }

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
