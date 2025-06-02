import { ZodError } from 'zod';
import { TErrorSources } from '../interface/errorInterface';
import httpStatus from 'http-status';

const handleZodError = (err: ZodError) => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Validation failed !';

  const errorSources: TErrorSources = err.issues.map((issue) => {
    const unCategorizedKey = issue.code === 'unrecognized_keys';

    return {
      path:
        (unCategorizedKey
          ? issue.keys.join(', ')
          : issue.path[issue.path.length - 1]) || '',
      message: unCategorizedKey
        ? `Unknown field in req body '${issue.keys.join(', ')}'`
        : issue.message,
    };
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleZodError;
