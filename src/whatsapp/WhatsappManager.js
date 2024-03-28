import * as constants from "../app/constants.js";
import WhatsApp from "whatsapp-business";
import { __dirname } from "../system.variables.js";
import { ConversationRepository } from "../layers/domain/repositories/ConversationRepositorys.js";

const { WABAClient, WebhookClient } = WhatsApp;

class WhatsAppManager {
    constructor(expressApp) {
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

    async sendTextMessage({ recipient_number, message }) {
        try {
            const ws_response = await this.ws_client.sendMessage({
                to: recipient_number,
                type: constants.whatsapp.messages.types.text,
                text: {
                    body: message,
                },
            });

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result: {
                    id: ws_response.messages[0].id,
                },
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

    async sendDocumentMessage(document_message) {
        try {
            const { to, ...data } = document_message;

            const ws_response = await this.ws_client.sendMessage({
                to: to,
                type: "document",
                document: data,
            });

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result: {
                    id: ws_response.messages[0].id,
                },
            };
        } catch (error) {
            console.error(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }

    sendMessage = async ({ to, type, content }) => {
        let message_process = null;

        switch (type) {
            case constants.whatsapp.messages.types.text:
                message_process = await this.sendTextMessage({
                    recipient_number: to,
                    message: content.body.text,
                });
                break;
            case constants.whatsapp.messages.types.document:
                message_process = await this.sendDocumentMessage({
                    to: to,
                    ...content,
                });
                break;
            default:
                message_process = {
                    ok: false,
                    status: constants.generals.code_status.STATUS_400,
                    msg: constants.whatsapp.messages.type_not_valid,
                };
                break;
        }

        return message_process;
    };

    receivedMessage = async (payload, contact) => {
        try {
            let payload_message = null;

            switch (payload.type) {
                case constants.whatsapp.messages.types.text:
                    payload_message = payload;
                    break;
                case constants.whatsapp.messages.types.document:
                    // get url media
                    const file_id = await this.ws_client.getMedia(payload.document.id);

                    // download file whatsapp
                    const path_file = `${__dirname}/public/attach/${payload.document.filename}`
                    const media_process = await this.ws_client.downloadMedia(file_id.url, path_file);

                    payload_message = {};
                    break;
                default:
                    break;
            }

            // save message in database
            await this.conversation_repository.create(payload_message);


            /*
            const messageId = payload.id.toString();
            const contactNumber = contact.wa_id;

            // mark message as read
            await this.ws_client.markMessageAsRead(messageId);
            */
        } catch (error) {
            console.log("ERROR REQUEST ->", error);
        }
    };

    startedServer() {
        console.log(
            `${constants.whatsapp.messages.run_server}:${constants.whatsapp.listener_port}`
        );
    }

    runningWebhooks() {
        this.ws_webhook.initWebhook({
            onStartListening: this.startedServer,
            onMessageReceived: this.receivedMessage,
            onError: (payload) => {
                console.log("WEBHOOK ERROR ->", payload);
            }
        });
    }
}

export { WhatsAppManager };
