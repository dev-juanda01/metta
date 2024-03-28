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
}

export { ConversationService };