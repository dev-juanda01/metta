import { AppConstants } from "#app";
import { UserRepository } from "./UserRepository.js";

class AuthenticationRepository {
    constructor(manager_encoded) {
        this.manager_encoded = manager_encoded;
        this.white_list_refresh_tokens = {};

        if (
            typeof AuthenticationRepository.instance ===
            AppConstants.generals.types.DATA_TYPE_OBJECT
        ) {
            return AuthenticationRepository.instance;
        }

        AuthenticationRepository.instance = this;

        return this;
    }

    async authenticate(email, password ) {
        try {
            const user_repository = new UserRepository();

            // TODO: check valid user
            const current_user = await user_repository.getOneUserByField(
                "email",
                email
            );
            if (!current_user.ok) return current_user;

            // TODO: verify password
            const is_valid_password = user_repository.verifyPassword(
                password,
                current_user.user.password
            );
            if (!is_valid_password.ok) return is_valid_password;

            // TODO: generate token access (JWT)
            const token_response = await this.manager_encoded.generateToken(
                current_user.user.uuid,
                AppConstants.jwt.secret_jwt,
                AppConstants.jwt.expires_time_jwt
            );
            if (!token_response.ok) return token_response;

            // TODO: generate refresh token (JWT)
            const refresh_token_response =
                await this.manager_encoded.generateToken(
                    current_user.user.uuid,
                    AppConstants.jwt.secret_refresh_jwt,
                    AppConstants.jwt.expires_time_refresh_jwt
                );

            if (!refresh_token_response.ok) return refresh_token_response;

            // insert new tokens in white list
            this.white_list_refresh_tokens[refresh_token_response.token] = {
                refresh_token: refresh_token_response.token,
            };

            return {
                ok: true,
                token: token_response.token,
                refresh_token: refresh_token_response.token,
                status: AppConstants.generals.code_status.STATUS_200,
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

    async refresh(refresh_token) {
        try {
            const is_exists_refresh_token = this.white_list_refresh_tokens[refresh_token];

            if (!is_exists_refresh_token) {
                return {
                    ok: false,
                    msg: AppConstants.jwt.invalid_refresh_token,
                    status: AppConstants.generals.code_status.STATUS_400,
                };
            }

            // delete refresh token to white list
            delete this.white_list_refresh_tokens[is_exists_refresh_token];

            // verify token decoded
            const decoded = this.manager_encoded.validateToken(
                refresh_token,
                AppConstants.jwt.secret_refresh_jwt
            );

            if (!decoded.ok) return decoded;

            const user_repository = new UserRepository();
            const user_db = await user_repository.getById(decoded.payload);

            if (!user_db.ok) {
                return {
                    ok: false,
                    status: AppConstants.generals.code_status.STATUS_400,
                    msg: AppConstants.jwt.user_not_decoded_token,
                };
            }

            const new_access_token = await this.manager_encoded.generateToken(
                user_db.result.uuid,
                AppConstants.jwt.secret_jwt,
                AppConstants.jwt.expires_time_jwt
            );
            if (!new_access_token.ok) return token_response;

            const new_refresh_token = await this.manager_encoded.generateToken(
                user_db.result.uuid,
                AppConstants.jwt.secret_refresh_jwt,
                AppConstants.jwt.expires_time_refresh_jwt
            );
            if (!new_refresh_token.ok) return new_refresh_token;

            // insert new tokens in white list
            this.white_list_refresh_tokens[new_refresh_token.token] = {
                refresh_token: new_refresh_token.token,
            };

            return {
                ok: true,
                token: new_access_token.token,
                refresh_token: new_refresh_token.token,
                status: AppConstants.generals.code_status.STATUS_200,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: AppConstants.generals.code_status.STATUS_200,
                msg: AppConstants.generals.messages.error_server,
            };
        }
    }
}

export { AuthenticationRepository };
