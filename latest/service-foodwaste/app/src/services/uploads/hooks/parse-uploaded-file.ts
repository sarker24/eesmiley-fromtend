import * as errors from '@feathersjs/errors';
import * as parserXls from 'node-xlsx';
import parserCsv from 'csv-parse';
import * as fs from 'fs';
import { Hook, HookContext } from '@feathersjs/feathers';

const subModule = 'parse-uploaded-file';
let requestId: string;
let sessionId: string;

export default function (): Hook {
  /**
   * Parses the uploaded file with ingredients, manipulates the data and constructs an object to be returned,
   * with all the data, ID of the uploaded file and missing required attributes, if any.
   *
   * After-hook for: post
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object with the constructed data object
   */
  return async (hook: HookContext) => {
    requestId = hook.params.requestId;
    sessionId = hook.params.sessionId;

    const parsedAttributeList = await parseFile(hook);
    const schemaAttributes = verifyRequiredAttributes(parsedAttributeList, hook);
    const attributeObject = constructDataObjectToStore(parsedAttributeList, schemaAttributes.missingRequiredAttributes);

    log.info({
      data: hook.result.data, subModule, requestId, sessionId
    }, 'attribute object constructed successfully');

    await cacheAttributeObject(attributeObject, hook);

    Object.assign(hook.result, schemaAttributes, { data: attributeObject.responseData });

    return hook;
  };
}

export async function parseFile(hook) {
  const { file: { mimetype } } = hook.data;
  const { fileId } = hook.result;
  const filePath = `${process.cwd()}/src/services/uploads/files/${fileId}`;

  if (mimetype.indexOf('text') > 0 || mimetype.indexOf('csv') > 0) {
    return await parseCsv(filePath);
  } else {
    return await parseXls(filePath);
  }
}

export async function parseCsv(filePath: string) {
  const parsedData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parserCsv({ delimiter: ',' }))
      .on('data', (line) => {
        parsedData.push(line);
      })
      .on('end', () => {
        resolve(parsedData);
      })
      .on('error', (err) => {
        reject(new errors.GeneralError('Could not parse CSV data.',
          { errorCode: 'E143', subModule, errors: err, requestId, sessionId }));
      });
  });
}

export async function parseXls(filePath: string) {
  try {
    const raw = parserXls.parse(filePath);
    const parsedData = raw[0].data;

    log.info({
      data: filePath, subModule, requestId, sessionId
    }, 'Uploaded XLS file parsed successfully.');

    return parsedData;
  } catch (err) {
    throw new errors.GeneralError('Could not parse XLS file.',
      { errorCode: 'E144', subModule, errors: err });
  }
}

/**
 * Store temporarily the current result of parsing the uploaded file in Redis, so that when we receive back
 * the confirmed correctness of the file - we can simply fetch the data instead of opening and parsing the
 * file again.
 * It automatically expires and is deleted after 1 hour.
 */
export async function cacheAttributeObject(attributeObject, hook) {
  const { fileId } = hook.result;
  try {
    await hook.app.get('redisClient').setexAsync(
      `${hook.app.get('redisKeyPrefix').ingredientsFileUpload}:${fileId}`,
      3600, // 3600 seconds = 1 hour
      JSON.stringify(attributeObject.heapData)
    );

    log.debug({
      subModule, requestId, sessionId
    }, 'parsed file temporarily stored in Redis for 1 hour.');

    return;

  } catch (err) {
    throw new errors.GeneralError('Could not cache the parsed data.',
      { errorCode: 'E145', subModule, errors: err, requestId, sessionId });
  }
}

/**
 * Construct a list of the required Ingredient model attributes and verify them against the attributes given in the
 * headline of the input file.
 *
 * @param headLine  {array}   A list of the headline attributes as array values
 * @param app       {object}  The app global object
 * @return {object} Contains a list of the required and the corresponding missing attributes
 */
export function verifyRequiredAttributes(parsedData, hook) {
  const headLine = parsedData[0];
  const ingredientModelAttributes = hook.app.get('sequelize').models.ingredient.rawAttributes;
  const requiredAttributes = [];

  Object.keys(ingredientModelAttributes).forEach((key) => {
    const attr = ingredientModelAttributes[key];
    if ((attr.allowNull === false) && (!['createdAt', 'updatedAt', 'deletedAt'].includes(attr.fieldName))) {
      requiredAttributes.push(attr.fieldName);
    }
  });

  const missingRequiredAttributes = [];

  requiredAttributes.forEach((attr) => {
    if (!headLine.includes(attr)) {
      missingRequiredAttributes.push(attr);
    }
  });

  return { missingRequiredAttributes, requiredAttributes, providedAttributes: headLine };
}

/**
 * Map the list of lists of the file data to an object of the file properties, with arrays containing mapped values.
 *
 ** Plain file given (or rows+columns instead of commas):
 * "percentage","name","price"
 *  10,"avocado",111
 *  20,"bananana",222
 *  30,"aguguga",333
 *
 ** Parsed file data list:
 * [
 *   ["percentage", "name", "price"],
 *   [10, "avocado", 111],
 *   [20, "bananana", 222],
 *   [30, "aguguga", 333]
 * ]
 *
 ** Final constructed data object:
 * "data": {
 *     "percentage": [10, 20, 30],
 *     "name": ["avocado", "bananana", "aguguga"],
 *     "price": [111, 222, 333],
 *     "cost": [] // this one is required but not given in the input file, so we add it as empty array
 *   }
 *
 * @param parsedData  {array} The plain array of data parsed from the file
 * @param missingAttr {array} A list of the attributes that are required (non-nullable) in the Ingredient model, but
 *                            were not given in the file headline attributes
 * @return dataObj {object}   The formatted and constructed object, as shown above (Final constructed data object)
 */
export function constructDataObjectToStore(parsedData, missingAttr) {
  const headlineAttr = parsedData[0];
  parsedData.splice(0, 1);

  /*
   * Construct the initial object with the input attr as keys and empty arrays as values, which will be filled with
   * the corresponding file values per row.
   */
  const responseData = {};
  headlineAttr.forEach((attr) => {
    responseData[attr] = [];
  });

  const heapData = [];
  try {
    /*
     * For the index of the current attribute in the current row from the file get the value of the headline attribute
     * (because they match by indexes), and for the corresponding attribute in the dataObj - push the current value
     * of the row.
     * See the JSDoc of this function for more details.
     */
    parsedData.forEach((row) => {
      const currentObj = {};
      for (let i = 0; i < row.length; i++) {
        responseData[headlineAttr[i]].push(row[i]);

        currentObj[headlineAttr[i]] = row[i];
      }
      heapData.push(currentObj);
    });
  } catch (err) {
    throw new errors.GeneralError('Something is wrong with the uploaded file rows, compared to the headline attributes.',
      { errorCode: 'E101', subModule, data: { responseData, heapData }, errors: err, requestId, sessionId });
  }

  /*
   * Add to the dataObj the missing required attr as properties with empty arrays as values
   */
  missingAttr.forEach((attr) => {
    responseData[attr] = [];
  });

  /*
   * `responseData` is the data that will be returned in the HTTP response - contains the missing, required and provided
   * attributes + the actual data.
   * `heapData` is only the actual data that will be stored in Redis and then in the data store.
   */
  return { responseData, heapData };
}


