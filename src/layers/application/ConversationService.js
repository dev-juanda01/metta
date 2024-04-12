import { BaseService } from "./BaseService.js";


class ConversationService extends BaseService {
    
    constructor(repository) {
        super(repository);
    }

    async create(data) {
        return await super.create(data);
    }

    async upload(data) {
        return await this.repository.upload(data);
    }

    async getConversationClient(user_uuid, client_uuid) {
        return await this.repository.getConversationClient(user_uuid, client_uuid);
    }
}

export { ConversationService };