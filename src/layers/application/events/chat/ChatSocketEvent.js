import { MixinBuilder } from "mixin-support";
import { ClientService } from "#layers/application/services";
import { AppConstants } from "#app"
import { ChatSocketEmitter } from "./mixins/ChatSocketEmitter.js";

/**
 * Chat socket event class for manage all events to chat
 */
class ChatSocketEvent extends MixinBuilder.with(ChatSocketEmitter) {
    /**
     * Build a socket events chat
     * @param {object} io reference to io socket instance domain
     */
    constructor(io) {
        this.io = io
            .of(AppConstants.socket.namespaces.chats)
            .use(this.middlewares.authenticate);
    }

    /**
     * Initialize all socket events
     */
    initialize() {
        this.chat_namespace.on(
            AppConstants.socket.events.connection,
            async (socket) => {
                console.log(AppConstants.socket.logs.connected);

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
                socket.on(AppConstants.socket.events.disconnect, () => {
                    console.log(AppConstants.socket.logs.disconnected);
                });

                // list clients
                const client_service = new ClientService(
                    new ClientRepository()
                );

                const list_clients = await client_service.getClientsByUserRole(
                    socket.uuid
                );

                socket.emit(
                    AppConstants.socket.events.list_clients,
                    list_clients
                );

                // list conversations by user
                const conversation_service = new ConversationService(
                    new ConversationRepository(this.ws_manager)
                );

                socket.on(
                    AppConstants.socket.events.get_messages,
                    async (data) => {
                        let conversations = null;

                        if (data) {
                            conversations =
                                await conversation_service.getConversationClient(
                                    socket.uuid,
                                    data.uuid
                                );

                            if (conversations.ok) {
                                const client_chat =
                                    await client_service.getById(data.uuid);

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
                                status: AppConstants.generals.code_status
                                    .STATUS_400,
                                msg: AppConstants.generals.messages
                                    .data_not_provider,
                            };
                        }

                        socket.emit(
                            AppConstants.socket.events.list_messages,
                            conversations
                        );
                    }
                );

                // received new message
                socket.on(
                    AppConstants.socket.events.send_message,
                    async (message) => {
                        message.from = socket.uuid;

                        let new_message = await conversation_service.create(
                            message
                        );

                        if (new_message.result && new_message.result.messages) {
                            new_message.result = new_message.result.messages[0];
                        }

                        socket.emit(
                            AppConstants.socket.events.received_message,
                            new_message
                        );
                    }
                );
            }
        );
    }
}

export { ChatSocketEvent };
