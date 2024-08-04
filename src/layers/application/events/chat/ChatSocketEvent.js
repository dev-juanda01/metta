import { MixinBuilder } from "mixin-support";
import { AppConstants } from "#app";
import { ClientRepository, ConversationRepository } from "#layers/domain/repositories";
import { ClientService, ConversationService } from "#layers/application/services";
import { ChatSocketEmitterMixin } from "./mixins/ChatSocketEmitterMixin.js";

/**
 * Chat socket event class for manage all events to chat
 */
class ChatSocketEvent extends MixinBuilder.with(ChatSocketEmitterMixin) {
    /**
     * Build a socket events chat
     * @param {object} io reference to io socket instance domain
     */
    constructor(io, middlewares, socket_service, ws_manager) {
        super();
        this.io = io.of(AppConstants.socket.namespaces.chats).use(middlewares.authenticate);
        this.socket_service = socket_service;
        this.ws_manager = ws_manager;
        
        this.client_service = new ClientService(new ClientRepository());
        this.conversation_service = new ConversationService(
            new ConversationRepository(this.ws_manager)
        );
    }

    /**
     * Initialize all socket events
     */
    initialize() {
        this.io.on(AppConstants.socket.events.connection, async (socket) => {
            console.log(AppConstants.socket.logs.connected);

            // TODO: add user connected
            this.socket_service.addUser({
                uuid: socket.uuid,
                data: {
                    socket_id: socket.id,
                    ...socket.user,
                },
            });

            console.log(this.socket_service.getUsers());

            // TODO: disconnect
            socket.on(AppConstants.socket.events.disconnect, () => {
                console.log(AppConstants.socket.logs.disconnected);
            });

            // TODO: list clients to user
            this._emitListClients(socket);

            // TODO: list conversations by user
            socket.on(AppConstants.socket.events.get_messages, async (data) => {
                await this._emitListMessagesConversations(socket, data);
            });

            // TODO: received new message
            socket.on(AppConstants.socket.events.send_message, async (message) => {
                await this._emitNewMessage(socket, message);
            });
        });
    }
}

export { ChatSocketEvent };
