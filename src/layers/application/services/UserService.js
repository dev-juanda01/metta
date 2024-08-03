import { BaseService } from "./BaseService.js";


class UserService extends BaseService {
    
    constructor(repository) {
        super(repository);
    }

    async create(data) {
        return await super.create(data);
    }
}

export { UserService }