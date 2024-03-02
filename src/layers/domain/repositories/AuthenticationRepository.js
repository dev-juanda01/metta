import * as constants from "../../../app/constants.js";
import { UserRepository } from "./UserRepository.js";

class AuthenticationRepository {
    constructor(manager_encoded) {
        this.manager_encoded = manager_encoded;
        this.white_list_refresh_tokens = {};

        if (
            typeof AuthenticationRepository.instance ===
            constants.generals.types.DATA_TYPE_OBJECT
        ) {
            return AuthenticationRepository.instance;
        }

        AuthenticationRepository.instance = this;

        return this;
    }

    async authenticate({ email, password }) {
        try {
            const user_repository = new UserRepository()
            const current_user = await user_repository.getById()
    
          // TODO: check valid user
          const isValidUser = this.validationsToUser(userDB);
          if (!isValidUser.ok) {
            return isValidUser;
          }
    
          // TODO: user active
          const isActive = this.isActiveUser(userDB);
          if (!isActive.ok) {
            return isActive;
          }
    
          // TODO: verify password
          const validPassword = this.verifyPassword(password, userDB.password);
          if (!validPassword.ok) {
            return validPassword;
          }
    
          // TODO: generate token access (JWT)
          const token_access = await this.jwt.generateJWT(userDB.uuid);
          if (!token_access.ok) {
            return token;
          }
    
          // TODO: generate refresh token (JWT)
          const refresh_token = await this.jwt.generateJWT(
            userDB.uuid,
            envs.SECRET_KEY_REFRESH,
            envs.TIME_EXPIRES_REFRESH_TOKEN
          );
    
          if (!refresh_token.ok) {
            return token;
          }
    
          // insert new tokens in white list
          this.white_list_refresh_tokens[refresh_token.token] = {
            refresh_token: refresh_token.token,
          };
    
          renderLog(constants.WHITE_LIST_TOKENS, this.white_list_refresh_tokens);
    
          return {
            ok: true,
            token: token_access.token,
            refresh_token: refresh_token.token,
            status: refresh_token.status,
          };
        } catch (error) {
          renderLog(error);
    
          return {
            ok: false,
            status: messagesRequest.STATUS_500,
            msg: messagesRequest.ERROR_SERVER,
          };
        }
    }
}

export { AuthenticationRepository };
