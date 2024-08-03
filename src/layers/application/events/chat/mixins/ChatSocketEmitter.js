import { AppConstants } from "#app";

const ChatSocketEmitter = (object) => class extends object {

    /**
     * Emit all list clients to user
     * @param {Socket} socket object socket instance connection server
     * @param {Array<any>} list_clients list of clients to emit user
     */
    _emitListClients(socket, list_clients) {
        socket.emit(
            AppConstants.socket.events.list_clients,
            list_clients
        );
    }
};

export { ChatSocketEmitter };
