import Setting from "../models/Setting.js"
import { BaseRepository } from "./BaseRepository.js";

class SettingRepository extends BaseRepository {
    constructor() {
        super(Setting);
    }
}

export { SettingRepository };