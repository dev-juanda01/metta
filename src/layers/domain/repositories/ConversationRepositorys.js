import { v4 as uuid } from "uuid";
import * as constants from "../../../app/constants.js";
import Conversation from "../models/Conversation.js";
import { BaseRepository } from "./BaseRepository.js";
import { ClientRepository } from "./ClientRepository.js";
import { BackgroundTask } from "../../../app/BackgroundTask.js";

class ConversationRepository extends BaseRepository {
    constructor(ws_manager) {
        super(Conversation);

        this.ws_manager = ws_manager;
    }

    async create(data) {
        try {
            const client_respository = new ClientRepository();

            // if data include "id" this message provider WhatsApp
            if (data.id) {
                // find client send message to WhatsApp
                const client_sender = await client_respository.getOneByField({
                    field: "phone",
                    value: data.from,
                });

                console.log(client_sender);

                const is_valid_sender =
                    client_sender.ok &&
                    client_sender.status !==
                        constants.generals.code_status.STATUS_500;

                if (is_valid_sender) {
                    data = {
                        ...data,
                        uuid: uuid(),
                        from: client_sender.result.uuid,
                        ...data.text,
                        ws_id: data.id,
                    };

                    // find conversation associate this sender user message
                    const conversation_associate = await this.getOneByField({
                        field: "client",
                        value: client_sender.result.uuid,
                    });

                    const background_manager = new BackgroundTask();

                    const is_valid_conversation =
                        conversation_associate.ok &&
                        conversation_associate.status !==
                            constants.generals.code_status.STATUS_500;

                    if (is_valid_conversation) {
                        data.to = conversation_associate.result.user;

                        await this.addMessage({
                            uuid: conversation_associate.result.uuid,
                            message: data,
                        });

                        // init celery task
                        await background_manager.sendBackgroundTask(
                            constants.celery.tasks.send_message,
                            [data]
                        );

                    } else {
                        const new_conversation = {
                            messages: [data],
                            client: data.from,
                        };

                        const conversation_created = super.create(
                            new_conversation
                        );

                        // init celery task
                    }
                }
            } else {
                data = { ...data, ...data.content };
                delete data.content;

                // find phone client and validate exists
                const client = await client_respository.getById(data.to);
                if (!client.ok) return client;

                // send message to whatsapp
                const response_message = await this.ws_manager.sendMessage(
                    client.result.phone,
                    data.body
                );

                if (!response_message.ok) return response_message;

                // bind ws id
                data = {
                    ...data,
                    ws_id: response_message.response.messages[0].id,
                };

                // find conversation associate this sender user message
                const conversation_associate = await this.getOneByField({
                    field: "client",
                    value: data.to,
                });

                const is_valid_conversation =
                    conversation_associate.ok &&
                    conversation_associate.status !==
                        constants.generals.code_status.STATUS_500;

                if (!is_valid_conversation) {
                    const conversation = {
                        messages: [
                            {
                                uuid: uuid(),
                                ...data,
                            },
                        ],
                        client: data.to,
                        user: data.from,
                    };

                    // save in databse
                    const conversation_created = await super.create(
                        conversation
                    );

                    return conversation_created;
                } else {
                    const conversation_modified = await this.addMessage({
                        uuid: conversation_associate.result.uuid,
                        message: data,
                    });

                    if (conversation_modified.ok) {
                        conversation_modified.result = data;
                    }

                    return conversation_modified;
                }
            }
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }

    async addMessage({ uuid, message }) {
        try {
            const conversation_updated = await this.model.updateOne(
                { uuid },
                {
                    $push: { messages: message },
                }
            );

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }
}

export { ConversationRepository };
