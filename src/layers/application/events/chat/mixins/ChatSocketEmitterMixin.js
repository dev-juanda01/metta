import { AppConstants } from "#app";

const ChatSocketEmitterMixin = (object) => class extends object {

    /**
     * Emit all list clients to user
     * @param { Socket } socket object socket instance connection server
     */
    async _emitListClients(socket) {

        const list_clients = await this.client_service.getClientsByUserRole(
            socket.uuid
        );

        socket.emit(
            AppConstants.socket.events.list_clients,
            list_clients
        );
    }

    /**
     * Emit list all conversations messages
     * @param { Socket } socket object socket instance connection server
     * @param { object } data all conversations messages associate to user
     */
    async _emitListMessagesConversations(socket, data) {
        let conversations = null;

        if (data) {

            conversations = await this.conversation_service.getConversationClient(
                socket.uuid,
                data.uuid
            );

            if (conversations.ok) {
                const client_chat = await this.client_service.getById(data.uuid);

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
                status: AppConstants.generals.code_status.STATUS_400,
                msg: AppConstants.generals.messages.data_not_provider,
            };
        }

        socket.emit(
            AppConstants.socket.events.list_messages,
            conversations
        );
    }

    /**
     * Emit new message in conversation
     * @param { Socket } socket object socket instance connection server
     * @param { object } message data message to emit user created
     */
    async _emitNewMessage(socket, message) {
        message.from = socket.uuid;

        let new_message = await this.conversation_service.create(
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
};

export { ChatSocketEmitterMixin };
