import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import config from '../config';

type TCompilePath = {
  templateName: string;
  emailData: Record<string, unknown>;
};

export const compileTemplate = ({ templateName, emailData }: TCompilePath) => {
  try {
    const filePath = path.join(
      process.cwd(),
      `${config.BASE_DIR}/app/v1/views/${templateName}.hbs`,
    );
    const emailTemplate = fs.readFileSync(filePath, 'utf-8');
    const template = handlebars.compile(emailTemplate);

    return template(emailData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Error loading template: ${templateName} - ${error.message}`,
      );
    }

    throw new Error(`Error loading template: ${templateName} !!`);
  }
};
