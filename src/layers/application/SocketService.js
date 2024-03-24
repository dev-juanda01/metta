class SocketService {
    constructor() {
        this.users = {};

        // declare a singleton
        if (typeof SocketService.instance === "object") {
            return SocketService.instance;
        }

        SocketService.instance = this;
        return this;
    }

    addUser({ uuid, data }) {
        this.users[uuid] = data;
    }

    updateUser({ uuid, data }) {
        this.users[uuid] = { uuid, ...data };
    }

    getUsers() {
        return this.users;
    }

    getUserById(uuid) {
        return this.users[uuid];
    }

    deleteUser(uuid) {
        delete this.users[uuid];
    }
}

export { SocketService };
