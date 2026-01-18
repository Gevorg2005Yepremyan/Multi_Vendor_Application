import yaml from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = yaml.load(
  path.join(__dirname, "../docs/swagger.yaml")
);

export { swaggerDocument };
