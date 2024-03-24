import * as constants from "../app/constants.js";
import WhatsApp from "whatsapp-business";
import { ConversationRepository } from "../layers/domain/repositories/ConversationRepositorys.js";

const { WABAClient, WebhookClient } = WhatsApp;

class WhatsAppManager {
    constructor(expressApp) {
        this.app = expressApp;

        this.ws_client = new WABAClient({
            accountId: constants.whatsapp.account_id,
            apiToken: constants.whatsapp.api_access_token,
            phoneId: constants.whatsapp.phone_number_id,
        });

        this.ws_webhook = new WebhookClient({
            token: constants.whatsapp.webhook_verification_token,
            path: constants.whatsapp.webhook_endpoint,
            port: constants.whatsapp.listener_port,
        });

        this.conversation_repository = new ConversationRepository(this);

        // declare a singleton
        if (typeof WhatsAppManager.instance === "object") {
            return WhatsAppManager.instance;
        }

        WhatsAppManager.instance = this;
        return this;
    }

    async sendMessage(recipient_number, message, type = "text") {
        try {
            const ws_response = await this.ws_client.sendMessage({
                to: recipient_number,
                type,
                text: {
                    body: message,
                },
            });

            console.log(ws_response);

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                response: ws_response,
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

    receivedMessage = async (payload, contact) => {
        try {
            console.log(payload, contact);

            // save message in database
            await this.conversation_repository.create(payload);

            /*
            const messageId = payload.id.toString();
            const contactNumber = contact.wa_id;

            // mark message as read
            await this.ws_client.markMessageAsRead(messageId);
            */
        } catch (error) {
            console.log(error);
        }
    };

    startedServer() {
        console.log("Server started listening whatsapp");
    }

    runningWebhooks() {
        this.ws_webhook.initWebhook({
            onStartListening: this.startedServer,
            onTextMessageReceived: this.receivedMessage,
        });
    }
}

export { WhatsAppManager };
