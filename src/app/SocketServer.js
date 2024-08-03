/**
 * Socket server for manage all events socket
 */
class SocketServer {
    /**
     *  Build a socket server class
     * @param {{ io: Socket, ws_manager: WhatsAppManager, middlewares: SocketMiddlewares, socket_service: SocketService }} param0
     */
    constructor({ io, ws_manager, middlewares, socket_service }) {
        this.io = io;
        this.middlewares = middlewares;
        this.socket_service = socket_service;
        this.ws_manager = ws_manager;
    }

    /**
     * Initialize socket of all namespaces
     */
    initializeSocket() {}

    /**
     *  Create a socket instance to manage all events
     * @param {{ io: Socket, ws_manager: WhatsAppManager, middlewares: SocketMiddlewares, socket_service: SocketService }} options properties neded to operational socket server
     * @returns socket instance to manage events server
     */
    static createSocket(options) {
        const socketInstance = new SocketServer(options);
        socketInstance.initializeSocket();
    }
}

export { SocketServer };
