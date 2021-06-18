import { DataValidation } from 'frontend-core';
import { Ajv } from 'ajv';

export interface IValidationObject {
  [key: string]: boolean;
}

/**
 * Validate function return ths validation of either specific key or a whole data value set
 * @param schema Schema string to pass to AJV
 * @param data Data to pass to AJV
 * @param key Key to check for validation (optional)
 * @param allErrors Boolean to check all keys or just required... (optional)
 * @returns {boolean|IValidationObject}
 */
export function validate(
  schema: string,
  data: any,
  key?: string,
  allErrors = true
): boolean | IValidationObject {
  const validation = new DataValidation({ allErrors: true });
  validation.validate(schema, data);
  const validationErrors = (validation.library as Ajv).errors;
  const validationErrorObject = {};
  validationErrors
    ? validationErrors.map((error) => {
        const dataPathKey = error.dataPath.split('.');
        const dataKey =
          dataPathKey[dataPathKey.length ? dataPathKey.length - 1 : dataPathKey.length];
        if (!allErrors && error.keyword === 'required') {
          validationErrorObject[dataKey] = true;
        } else {
          if (allErrors) {
            validationErrorObject[dataKey] = true;
          }
        }
      })
    : null;
  if (key) {
    return !validationErrorObject[key];
  }

  return validationErrorObject as IValidationObject;
}
