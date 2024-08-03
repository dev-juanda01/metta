import WhatsApp from "whatsapp-business";
import { __dirname } from "#core";
import { AppConstants, ScheduledTask } from "#app";
import { ConversationRepository } from "#layers/domain/repositories";

const { WABAClient, WebhookClient } = WhatsApp;

class WhatsAppManager {
    /**
     * Build a whatsApp manager class
     * @param {object} expressApp instance app express
     * @returns context WhatsAppManager class
     */
    constructor(expressApp) {
        this.ws_client = new WABAClient({
            accountId: AppConstants.whatsapp.account_id,
            apiToken: AppConstants.whatsapp.api_access_token,
            phoneId: AppConstants.whatsapp.phone_number_id,
        });

        this.ws_webhook = new WebhookClient({
            token: AppConstants.whatsapp.webhook_verification_token,
            path: AppConstants.whatsapp.webhook_endpoint,
            port: AppConstants.whatsapp.listener_port,
        });

        this.conversation_repository = new ConversationRepository(this);

        // declare a singleton
        if (typeof WhatsAppManager.instance === "object") {
            return WhatsAppManager.instance;
        }

        WhatsAppManager.instance = this;
        return this;
    }

    /**
     * Send text message to whatsapp
     * @param {{ recipient_number: string, message: string }} param0 params to send message
     * @returns response with process send message
     */
    sendTextMessage = async ({ recipient_number, message }) => {
        try {
            const ws_response = await this.ws_client.sendMessage({
                to: recipient_number,
                type: AppConstants.whatsapp.messages.types.text,
                text: {
                    body: message,
                },
            });

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
                result: {
                    id: ws_response.messages[0].id,
                },
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    };

    /**
     * Send document message to whatsapp
     * @param {{ to: string, data: object }} document_message object with data to send document
     * @returns response with process send message
     */
    sendDocumentMessage = async (document_message) => {
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

    /**
     * Send message to whatsapp
     * @param {{ to: string, type: string, content: object }} param0 content to send message whatsapp
     * @returns response with process send message
     */
    sendMessage = async ({ to, type, content }) => {
        let message_process = null;
        const scheduled_task = new ScheduledTask();

        switch (type) {
            case constants.whatsapp.messages.types.text:
                message_process = await this.sendTextMessage({
                    recipient_number: to,
                    message: content.body.text,
                });

                if (!message_process.ok) {
                    scheduled_task.sendScheduledTask({
                        callback: this.sendTextMessage,
                        id: Math.random() * 1000,
                        data: {
                            recipient_number: to,
                            message: content.body.text,
                        },
                        type: constants.celery.scheduler.types.FIVE_SECONDS
                    });
                }

                break;
            case constants.whatsapp.messages.types.document:
                message_process = await this.sendDocumentMessage({
                    to: to,
                    ...content,
                });

                console.log("message process", message_process);

                if (!message_process.ok) {
                    scheduled_task.sendScheduledTask({
                        callback: this.sendDocumentMessage,
                        id: Math.random() * 1000,
                        data: {
                            to: to,
                            ...content,
                        },
                        type: constants.celery.scheduler.types.FIVE_SECONDS
                    });
                }
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

    /**
     * Received whatsapp message
     * @param {object} payload data to received whatsapp
     * @param {string} contact number contact received message
     */
    receivedMessage = async (payload, contact) => {
        try {
            // save message in database
            await this.conversation_repository.create(payload);

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

    /**
     * Initialize whatsapp server
     */
    startedServer() {
        console.log(
            `${AppConstants.whatsapp.messages.run_server}:${AppConstants.whatsapp.listener_port}`
        );
    }

    /**
     * Running or listener webhooks response API WhatsApp
     */
    runningWebhooks() {
        this.ws_webhook.initWebhook({
            onStartListening: this.startedServer,
            onMessageReceived: this.receivedMessage,
            onError: (payload) => {
                console.log("WEBHOOK ERROR ->", payload);
            },
        });
    }
}

export { WhatsAppManager };
