import celery from "celery-node";
import * as constants from "./constants.js";
import User from "../layers/domain/models/User.js";
import { v4 as uuid } from "uuid";
import { SettingRepository } from "../layers/domain/repositories/SettingRepository.js";
import { ConversationRepository } from "../layers/domain/repositories/ConversationRepositorys.js";
import { ScheduledTask } from "./ScheduledTask.js";

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
        this.scheduled_task = new ScheduledTask();

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
            const user_socket = this.socket_service.users[message.to];

            if (user_socket) {
                this.io
                    .of(constants.socket.namespaces.chats)
                    .to(user_socket.socket_id)
                    .emit(constants.socket.events.received_message, {
                        ok: true,
                        status: constants.generals.code_status.STATUS_200,
                        result: message,
                    });
            }
        });

        this.worker.start();
    }

    sendExpiredConversation() {
        this.worker.register(
            constants.celery.tasks.send_expired_conversation,
            (message) => {
                const user_socket = this.socket_service.users[message.from];

                if (user_socket) {
                    this.io
                        .of(constants.socket.namespaces.chats)
                        .to(user_socket.socket_id)
                        .emit(constants.socket.events.expired_conversation, {
                            ok: true,
                            status: constants.generals.code_status.STATUS_200,
                            result: message.text,
                        });
                }
            }
        );

        this.worker.start();
    }

    conversationAssignmentToAgent() {
        this.worker.register(
            constants.celery.tasks.send_assigment_conversation,
            async (message_client) => {
                const setting_repository = new SettingRepository();
                const setting_admin = await setting_repository.model
                    .findOne()
                    .exec();

                console.log(setting_admin);

                const agent_assigment = await User.aggregate([
                    {
                        $match: {
                            current_active_conversation: {
                                $lt: setting_admin.maximum_active_conversation,
                            },
                            role: constants.users.roles.AGENT,
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                ]);

                if (agent_assigment.length === 0) {
                    // scheduled task one minute assigment
                    this.scheduled_task.sendScheduledTask({
                        id: message_client.from,
                        data: message_client,
                        type: constants.celery.scheduler.types.ONE_MINUTE,
                        callback: async (data) => {
                            return await this.sendBackgroundTask(
                                constants.celery.tasks
                                    .send_assigment_conversation,
                                [data]
                            );
                        },
                    });
                } else {
                    const agent = agent_assigment[0];

                    // add current active conversation
                    await User.updateOne(
                        { uuid: agent.uuid },
                        {
                            current_active_conversation:
                                agent.current_active_conversation + 1,
                        }
                    );

                    // socket emit data new client assigment
                    const conversation_repository =
                        new ConversationRepository();

                    const conversation_created =
                        new conversation_repository.model({
                            uuid: uuid(),
                            user: agent.uuid,
                            client: message_client.from,
                        });

                    await conversation_created.save();
                    await conversation_repository.create(message_client);

                    const user_socket = this.socket_service.users[agent.uuid];

                    if (user_socket) {
                        // emit socket
                        this.io
                            .of(constants.socket.namespaces.chats)
                            .to(user_socket.socket_id)
                            .emit(constants.socket.events.assigment_client, {
                                ok: true,
                                status: constants.generals.code_status
                                    .STATUS_200,
                                result: message_client.client,
                            });
                    }
                }
            }
        );

        this.worker.start();
    }
}

export { BackgroundTask };
