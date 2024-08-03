import { BaseService } from "./BaseService.js";


class ClientService extends BaseService {
    
    constructor(repository) {
        super(repository);
    }

    async getClientsByUserRole(uuid) {
        return await this.repository.getClientsByUserRole(uuid);
    }
}

export { ClientService };