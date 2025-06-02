/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyZodObject, z, ZodEffects } from 'zod';

const Ignored_Keys = ['password', 'oldPassword', 'newPassword'];

// input sanitize for prevent xss
const inputSanitize = (input: unknown): unknown => {
  if (typeof input === 'string') {
    return (
      input
        .replace(/</g, '&lt;') // Replace < with &lt;
        .replace(/>/g, '&gt;') // Replace > with &gt;
        .replace(/&/g, '&amp;') // Replace & with &amp;
        // .replace(/"/g, '&quot;') // Replace " with &quot; // optional but recommended
        // .replace(/'/g, '&#39;') // Replace ' with &#39; // optional but recommended
        .trim() // Remove leading/trailing spaces
    );
  }

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(inputSanitize);
    }

    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => {
        if (Ignored_Keys.includes(key)) {
          return [key, value]; // skip sanitizing sensitive fields
        }
        return [key, inputSanitize(value)];
      }),
    );
  }

  return input;
};

export const zodWithInputSanitize = <
  T extends AnyZodObject | ZodEffects<AnyZodObject, any, any>,
>(
  zodSchema: T,
): T => {
  let baseSchema = zodSchema as any;
  while (baseSchema instanceof z.ZodEffects) {
    baseSchema = baseSchema._def.schema;
  }

  if (!(baseSchema instanceof z.ZodObject)) {
    throw new Error('zodWithInputSanitize only works with ZodObject schemas');
  }

  const strictBase = baseSchema.strict();

  const transformed =
    zodSchema instanceof z.ZodEffects
      ? new z.ZodEffects({ ...zodSchema._def, schema: strictBase })
      : strictBase;

  return transformed.transform(
    (data) => inputSanitize(data) as z.infer<T>,
  ) as T;
};
