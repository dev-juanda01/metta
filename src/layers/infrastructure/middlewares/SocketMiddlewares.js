import { AppConstants } from "#app";
import { UserRepository } from "../../domain/repositories/UserRepository.js";

class SocketMiddlewares {
    constructor(manager_encoded) {
        this.manager_encoded = manager_encoded;
    }

    authenticate = async (socket, next) => {
        const token = socket.handshake.auth.token;

        const is_valid_token = this.manager_encoded.validateToken(
            token,
            AppConstants.jwt.secret_jwt
        );

        if (!is_valid_token.ok) {
            const error = new Error(is_valid_token.msg);
            error.data = {
                type: AppConstants.generals.messages.unauthorized,
                status: AppConstants.generals.code_status.STATUS_401
            }
            return next(error);
        }

        const user_repository = new UserRepository();
        const user_auth = await user_repository.getById(is_valid_token.payload);

        if (!user_auth.ok) {
            const error = new Error(user_auth.msg);
            return next(error);
        }

        socket.uuid = is_valid_token.payload;
        socket.user = user_auth.result._doc;

        delete socket.user.__v;
        delete socket.user.password;
        delete socket.user._id;

        next();
    };
}

export { SocketMiddlewares };
