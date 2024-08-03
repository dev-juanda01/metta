import { AppConstants } from "#app";
import Client from "../models/Client.js";
import { BaseRepository } from "./BaseRepository.js";
import { UserRepository } from "./UserRepository.js";
import { ConversationRepository } from "./ConversationRepositorys.js";

class ClientRepository extends BaseRepository {
    constructor() {
        super(Client);
    }

    async getClientsByUserRole(user) {
        try {
            const user_repository = new UserRepository();
            const user_role = await user_repository.getById(user);

            if (!user_role.ok) return user_role;

            let clients = await this.model.find({}, { phone: 1, name: 1, uuid: 1, _id: 0 });

            if (user_role.result.role === AppConstants.users.roles.AGENT) {
                const conversation_repository = new ConversationRepository();
                const uuid_clients =
                    await conversation_repository.getClientsConversationActiveWithUser(
                        user
                    );

                if (!uuid_clients.ok) return uuid_clients;
                if (uuid_clients.result.length === 0) return uuid_clients;

                clients = await this.model.find({
                    uuid: { $in: uuid_clients.result },
                });
            }

            return {
                ok: true,
                status: AppConstants.generals.code_status.STATUS_200,
                result: clients,
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

export { ClientRepository };
