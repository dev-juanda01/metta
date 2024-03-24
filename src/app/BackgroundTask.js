import celery from "celery-node";
import * as constants from "./constants.js";

class BackgroundTask {
    constructor(io, socket_service) {
        this.client = celery.createClient(
            constants.celery.broker,
            constants.celery.backend
        );

        this.worker = celery.createWorker(
            constants.celery.broker,
            constants.celery.backend
        );

        this.io = io;
        this.socket_service = socket_service;

        // declare a singleton
        if (typeof BackgroundTask.instance === "object") {
            return BackgroundTask.instance;
        }

        BackgroundTask.instance = this;
        return this;
    }

    /**
     *
     * @param {string} task send the task to the task queue
     * @param {object} data the data that is sent to the worker to execute and process the task
     * @returns
     */
    async sendBackgroundTask(task, data) {
        console.log("Running ->", task, data);

        const exect_task = this.client.createTask(task);
        const data_result = exect_task.applyAsync(data);
        const result = await data_result.get();

        console.log("Processed", result);

        return result;
    }

    sendMessageWhatsAppToUser() {
        this.worker.register(constants.celery.tasks.send_message, (message) => {
            console.log(message);

            const user_socket = this.socket_service.users[message.to];

            this.io
                .of(constants.socket.namespaces.chats)
                .to(user_socket.socket_id)
                .emit(constants.socket.events.received_message, {
                    ok: true,
                    status: constants.generals.code_status.STATUS_200,
                    result: message,
                });
        });

        this.worker.start();
    }
}

export { BackgroundTask };
