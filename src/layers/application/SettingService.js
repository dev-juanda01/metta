import { BaseService } from "./BaseService.js";

class SettingService extends BaseService {
    constructor(repository) {
        super(repository);
    }

    async getDefaultSetting() {
        return await this.repository.getDefaultSetting();
    }
}

export { SettingService };
