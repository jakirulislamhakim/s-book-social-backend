import YAML from 'yamljs';
import path from 'path';
declare const __dirname: string;

const swaggerPath = path.resolve(__dirname, '../../../docs/v1/swagger.yaml');
export const swaggerV1Doc = YAML.load(swaggerPath);
