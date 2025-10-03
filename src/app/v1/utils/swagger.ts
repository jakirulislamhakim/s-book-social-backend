import YAML from 'yamljs';
import path from 'path';
import config from '../config';

const swaggerPath = path.resolve(
  process.cwd(),
  `${config.BASE_DIR}/docs/v1/swagger.yaml`,
);
export const swaggerV1Doc = YAML.load(swaggerPath);
