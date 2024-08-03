import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { __dirname } from "#core";
import { AppConstants } from "#app";

class ManagerFile {
    uploaded(files, folder = "") {
        return new Promise((resolve, reject) => {
            let newFiles = {};

            Object.entries(files).map((file) => {
                const [key, value] = file;

                const cutName = value.name.split(".");
                const extension = cutName[cutName.length - 1];

                const nameTemp = uuid() + "." + extension;
                const uploadPath = path.join(
                    __dirname,
                    "/public/attach/",
                    folder,
                    nameTemp
                );

                value.mv(uploadPath, (error) => {
                    return reject({
                        ok: false,
                        status: AppConstants.generals.code_status.STATUS_400,
                        msg: AppConstants.files.error_upload,
                    });
                });

                newFiles = {
                    ...newFiles,
                    [key]: {
                        file: nameTemp,
                        extension,
                        name: value.name
                    },
                };
            });

            return resolve({ ok: true, files: newFiles });
        });
    }

    deleteExistsFile(document, filesToUpdate = [], folder = "mapsettings") {
        Object.entries(document).map((file) => {
            const [key, value] = file;

            if (value && filesToUpdate.includes(key)) {
                const pathFile = path.join(
                    __dirname,
                    "src/public",
                    folder,
                    value.toString()
                );

                if (fs.existsSync(pathFile)) {
                    fs.unlinkSync(pathFile); // Este metodo permite eliminar un archivo
                }
            }
        });
    }

    getFile(folder, img) {
        const pathFile = path.join(__dirname, "src/public", folder, img);
        return fs.existsSync(pathFile);
    }
}

export { ManagerFile };
