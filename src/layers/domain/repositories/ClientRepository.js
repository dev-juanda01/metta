import Client from "../models/Client.js";
import { BaseRepository } from "./BaseRepository.js";

class ClientRepository extends BaseRepository {
    constructor() {
        super(Client);
    }
}

export { ClientRepository }