import fs from "fs";
import Conversation from "../models/Conversation.js";
import { v4 as uuid } from "uuid";
import { AppConstants } from "#app";
import { BaseRepository } from "./BaseRepository.js";
import { ClientRepository } from "./ClientRepository.js";
import { BackgroundTask } from "../../../app/BackgroundTask.js";
import { ManagerFile } from "../../../utils/ManagerFile.js";
import { __dirname } from "../../../system.variables.js";
import { ScheduledTask } from "../../../app/ScheduledTask.js";
import { SettingRepository } from "./SettingRepository.js";
import { UserRepository } from "./UserRepository.js";

class ConversationRepository extends BaseRepository {
    constructor(ws_manager) {
        super(Conversation);

        this.ws_manager = ws_manager;
    }

    async create(data) {
        try {
            // if data include "id" this message provider WhatsApp
            if (data.id) {
                await this.registerMessageWhatsApp(data);
            } else {
                return await this.registerMessageApplication(data);
            }
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }

    async registerMessageWhatsApp(data) {
        const client_respository = new ClientRepository();
        const background_manager = new BackgroundTask();

        // find client send message to WhatsApp
        const client_sender = await client_respository.getOneByField({
            field: "phone",
            value: data.from,
        });

        if (client_sender.ok || data.client) {
            const current_client = client_sender.ok
                ? client_sender.result
                : data.client;

            const conversation_activate = await this.model.findOne({
                client: current_client.uuid,
                is_activate: true,
            });

            data = {
                ...data,
                uuid: uuid(),
                from: current_client.uuid,
                body: data.text
                    ? {
                          text: data.text.body,
                      }
                    : data[data.type],
                ws_id: data.id,
                date: new Date(),
            };

            if (conversation_activate) {
                // find conversation associate this sender user message
                const conversation_associate = conversation_activate;

                data.to = conversation_associate.user;

                // download file if type is other than text
                data = await this.download(data, conversation_associate.uuid);

                // add message to conversation
                await this.addMessage({
                    uuid: conversation_associate.uuid,
                    message: data,
                });

                // init celery task - send message
                await background_manager.sendBackgroundTask(
                    AppConstants.celery.tasks.send_message,
                    [data]
                );

                /*
                    const new_conversation = {
                        messages: [data],
                        client: data.from,
                    };
    
                    const conversation_created = await super.create(
                        new_conversation
                    );
    
                    // download file if type is other than text
                    const data_download = await this.download(
                        data,
                        conversation_created.result.uuid
                    );
    
                    // update conversation
    
                    // init celery task
                    await background_manager.sendBackgroundTask(
                        AppConstants.celery.tasks.send_message,
                        [data]
                    );
                    */
            } else {
                // TODO: assigment client to user
                await background_manager.sendBackgroundTask(
                    AppConstants.celery.tasks.send_assigment_conversation,
                    [{ ...data, client: client_sender.result._doc }]
                );
            }
        } else {
            // TODO: register client in database
            const new_client = await client_respository.create({
                name: `+${data.from.slice(0, 2)} ${data.from.slice(2)}`,
                phone: data.from,
            });

            if (new_client.ok) {
                data = {
                    ...data,
                    uuid: uuid(),
                    from: new_client.result.uuid,
                    body: data.text
                        ? {
                              text: data.text.body,
                          }
                        : data[data.type],
                    ws_id: data.id,
                    date: new Date(),
                    client: new_client.result._doc,
                };

                // TODO: assigment client to user
                await background_manager.sendBackgroundTask(
                    AppConstants.celery.tasks.send_assigment_conversation,
                    [data]
                );
            }
        }
    }

    async registerMessageApplication(data) {
        const client_respository = new ClientRepository();
        data = { ...data, ...data.content };

        // find conversation associate this sender user message
        const conversation_associate = await this.model.findOne({
            client: data.to,
            is_activate: true,
        });

        // process validation active conversation (verify date conversation)
        if (conversation_associate) {
            const setting_repository = new SettingRepository();
            const setting_admin = await setting_repository.model
                .findOne()
                .exec();

            const active_conversation = this.checkConversationActive(
                conversation_associate.date,
                setting_admin.expired_time
            );

            if (!active_conversation) {
                conversation_associate.is_activate = false;
                await conversation_associate.save();

                const background_manager = new BackgroundTask();
                await background_manager.sendBackgroundTask(
                    AppConstants.celery.tasks.send_expired_conversation,
                    [
                        {
                            from: data.from,
                            text: `${
                                AppConstants.conversation.expired_conversation
                            } ${conversation_associate.date.toLocaleString()}`,
                        },
                    ]
                );

                return {
                    ok: false,
                    status: AppConstants.generals.code_status.STATUS_400,
                    msg: AppConstants.generals.messages.forbiden,
                };
            }
        }

        // find phone client and validate exists
        const client = await client_respository.getById(data.to);
        if (!client.ok) return client;

        // send message to whatsapp
        const response_message = await this.ws_manager.sendMessage({
            to: client.result.phone,
            type: data.type,
            content: data.content,
        });

        // bind ws id
        data = {
            ...data,
            ws_id: response_message.ok ? response_message.result.id : "",
        };

        if (!conversation_associate) {
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
            const conversation_created = await super.create(conversation);

            return conversation_created;
        }

        data.uuid = uuid();
        data.date = new Date();
        data.is_read = false;

        const conversation_modified = await this.addMessage({
            uuid: conversation_associate.uuid,
            message: data,
        });

        if (conversation_modified.ok) {
            delete data.content;
            conversation_modified.result = data;
        }

        return conversation_modified;
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
                status: AppConstants.generals.code_status.STATUS_200,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }

    async upload({ props, files }) {
        try {
            // TODO: find conversation
            let conversation = await this.model.findOne({
                client: props.to,
                is_activate: true,
            });

            // TODO: create conversation
            if (!conversation.ok) {
                conversation = await super.create({
                    user: props.from,
                    client: props.to,
                    messages: [],
                });
            }

            // TODO: upload file in server
            const manager_file = new ManagerFile();
            const files_upload = await manager_file.uploaded(
                files,
                conversation.result.uuid
            );

            if (!files_upload.ok) files_upload;

            // TODO: format data message
            const message = {
                ...props,
                body: {
                    ...files_upload.files.attach,
                    caption: props.caption,
                    url: `${AppConstants.server_config.server_host_dir_attach}/${conversation.result.uuid}/${files_upload.files.attach.file}`,
                },
                content: {
                    link: `${AppConstants.server_config.server_host_dir_attach}/${conversation.result.uuid}/${files_upload.files.attach.file}`,
                    caption: props.caption,
                    filename: files_upload.files.attach.name,
                },
            };

            // TODO: use create class method and send whatsapp
            const response_message = await this.create(message);

            return response_message;
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }

    async download(payload, conversation) {
        if (payload.type !== AppConstants.whatsapp.messages.types.text) {
            const data_file = payload[payload.type];
            const extension_file = data_file.filename.split(".")[1];

            const filename_load = `${uuid()}.${extension_file}`;

            payload.body = {
                file: filename_load,
                extension: extension_file,
                name: data_file.filename,
                id: data_file.id,
                url: `${AppConstants.server_config.server_host_dir_attach}/${conversation}/${filename_load}`,
            };

            const saved_file = await this.saveMediaFileConversation({
                media_id: payload.body.id,
                conversation_folder: conversation,
                filename: payload.body.file,
            });

            if (!saved_file.ok) {
                const scheduled_task = new ScheduledTask();
                scheduled_task.sendScheduledTask({
                    callback: this.saveMediaFileConversation,
                    id: Math.random * 1000,
                    data: {
                        media_id: payload.body.id,
                        conversation_folder: conversation,
                        filename: payload.body.file,
                    },
                    type: AppConstants.celery.scheduler.types.FIVE_SECONDS,
                });
            }
        }
        return payload;
    }

    saveMediaFileConversation = async ({
        media_id,
        filename,
        conversation_folder,
    }) => {
        try {
            // get url media
            const file_id = await this.ws_manager.ws_client.getMedia(media_id);

            // verify exists conversation folder and create in case not exists
            let path_file = `${__dirname}/public/attach/${conversation_folder}`;
            fs.mkdirSync(path_file, { recursive: true });

            // download file whatsapp
            path_file = `${path_file}/${filename}`;

            await this.ws_manager.ws_client.downloadMedia(
                file_id.url,
                path_file
            );

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
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

    checkConversationActive(conversation_date, expired_time) {
        const date_expired = conversation_date;
        date_expired.setHours(date_expired.getHours() + expired_time);

        const current_date = new Date();

        return current_date < date_expired;
    }

    async getClientsConversationActiveWithUser(uuid_user) {
        try {
            let clients_associate = await this.model.distinct("client", {
                user: uuid_user,
                is_activate: true,
            });

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
                result: clients_associate,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }

    async getConversationActiveClient(uuid_client) {
        try {
            let conversation_client = await this.model.findOne({
                client: uuid_client,
                is_activate: true,
            });

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
                result: conversation_client._doc,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }

    async getConversationClient(user_uuid, client_uuid) {
        try {
            const user_repository = new UserRepository();
            const user_role = await user_repository.getById(user_uuid);

            if (!user_role.ok) return user_role;

            if (user_role.result.role === AppConstants.users.roles.AGENT) {
                return this.getConversationActiveClient(client_uuid);
            }

            const historical_conversation = await this.model
                .find({ client: client_uuid }, { date: 1, messages: 1, _id: 0 })
                .sort({ date: 1 });

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
                result: historical_conversation,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_500,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }
}

export { ConversationRepository };
