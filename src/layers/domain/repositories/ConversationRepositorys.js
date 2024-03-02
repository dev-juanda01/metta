import { v4 as uuid } from "uuid";
import * as constants from "../../../app/constants.js";
import Conversation from "../models/Conversation.js";
import { BaseRepository } from "./BaseRepository.js";
import { WhatsAppManager } from "../../../whatsapp/WhatsappManager.js";
import { ClientRepository } from "./ClientRepository.js";

class ConversationRepository extends BaseRepository {
    constructor() {
        super(Conversation);

        this.ws_manager = new WhatsAppManager();
    }

    async create(data) {
        try {
            const conversation = {
                uuid: uuid(),
                messages: [
                    {
                        uuid: uuid(),
                        is_send_user: true,
                        ...data,
                        date: new Date(),
                    },
                ],
            };

            // find phone client and validate exists
            const client_respository = new ClientRepository();
            const client = await client_respository.getById(data.client);

            if (!client.ok) {
                return client;
            }

            // save in databse
            const conversation_created = super.create(conversation);

            // send message to whatsapp

            if (conversation_created.ok) {
                await this.ws_manager.sendTextMessage(
                    client.result.phone,
                    data.content
                );
            }

            return conversation_created;
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
