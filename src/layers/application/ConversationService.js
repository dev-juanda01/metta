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

    async getConversationActiveClient(user) {
        return await this.repository.getConversationActiveClient(user);
    }
}

export { ConversationService };