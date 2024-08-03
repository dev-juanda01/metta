import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __rootDir = path.dirname(__filename);

const __dirname = __rootDir;

const generateExports = (directoryPath) => {
    fs.readdir(directoryPath, (err, items) => {
        if (err) {
            return console.log("Unable to scan directory: " + err);
        }

        const directories = [];
        const jsFiles = [];

        // Clasifica elementos en archivos JS y directorios
        items.forEach((item) => {
            const itemPath = path.join(directoryPath, item);
            if (fs.lstatSync(itemPath).isDirectory()) {
                directories.push(itemPath);
            } else if (item.endsWith(".js") && item !== "index.js") {
                jsFiles.push(item);
            }
        });

        // Genera las exportaciones para el directorio actual
        const exportStatements = jsFiles
            .map((file) => {
                const fileNameWithoutExtension = path.basename(file, ".js");
                return `export * from './${fileNameWithoutExtension}.js';`;
            })
            .join("\n");

        if (exportStatements) {
            // Escribe las exportaciones en el archivo index.js del directorio actual
            fs.writeFile(
                path.join(directoryPath, "index.js"),
                exportStatements,
                (err) => {
                    if (err) {
                        return console.log("Error writing file: " + err);
                    }
                    console.log(
                        `index.js has been updated in ${directoryPath} with the following exports:\n${exportStatements}`
                    );
                }
            );
        }

        // Recurre en los subdirectorios
        directories.forEach((subDir) => {
            generateExports(subDir);
        });
    });
};

// Llama a la función con el directorio 'src'
generateExports(__dirname);
