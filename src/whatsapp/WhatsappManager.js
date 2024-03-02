import * as constants from "../app/constants.js";
import WhatsApp from "whatsapp-business";

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
        })
    }

    async sendTextMessage(recipient_number, message, type = "text") {
        try {
            const ws_response = await this.ws_client.sendMessage({
                to: recipient_number,
                type,
                text: {
                    body: message,
                },
            });

            console.log(ws_response);
        } catch (error) {
            console.log(error.message);
        }
    }

    receivedMessage = async (payload, contact) => {
        try {
            console.log(payload);

            const messageId = payload.id.toString();
            const contactNumber = contact.wa_id;

            // mark message as read
            await this.ws_client.markMessageAsRead(messageId);

        } catch (error) {
            console.log(error);
        }
    }

    startedServer() {
        console.log("Server started listening whatsapp");
    }

    runningWebhooks() {
        this.ws_webhook.initWebhook({
            onStartListening: this.startedServer,
            onTextMessageReceived: this.receivedMessage
        })
    }
}

export { WhatsAppManager };
