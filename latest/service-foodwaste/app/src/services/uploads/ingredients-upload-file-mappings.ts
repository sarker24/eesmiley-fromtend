import * as errors from '@feathersjs/errors';

const subModule = 'ingredients-upload-file-mappings';

/**
 * This file provides functionality for the endpoint /uploads/:fileId/mappings
 *
 * @param app
 * @returns Object
 */
export default function (app) {
  const redisKeyPrefix = app.get('redisKeyPrefix').ingredientsFileUpload;

  return {
    /**
     * Takes the mappings of uploaded file attributes (required to provided), constructs the uploaded file data
     * accordingly to that and inserts the new ingredients.
     *
     * @param data:
     *  {
	   *    "cost": "price",
	   *    "name": "name"
     *  }
     * @param params:
     *  {
     *    fileId: {string} The ID of the earlier uploaded ingredients file
     *  }
     * @return {any}
     */
    create: (data, params) => {
      const mappings = data.mappings;
      const fileId = params.route.fileId;
      const customerId = data.customerId;

      return app.get('redisClient').getAsync(`${redisKeyPrefix}:${fileId}`)
        .then((result) => {
          if (!result) {
            throw new errors.NotFound('Could not find uploaded file data record.',
              { errorCode: 'E103', subModule, fileId, requestId: params.requestId, sessionId: params.sessionId });
          }

          const data = JSON.parse(result);
          const defaultNormalizationFactorForCost = app.get('defaultNormalizationFactorForCost');
          const ingredientsPromises = [];

          /*
           * Swap the user input properties in the data objects with the mapped to them actual Ingredient model properties
           */
          data.forEach((ingredient) => {
            Object.keys(mappings).forEach((key) => {
              if (key !== mappings[key]) {
                ingredient[key] = ingredient[mappings[key]];
                delete ingredient[mappings[key]];
              }
            });

            Object.keys(ingredient).forEach((key) => {
              if (!mappings[key]) {
                delete ingredient[key];
              }
            });

            if (!ingredient.customerId) {
              ingredient.customerId = customerId;
            }
            /*
             * Costs are normalized to be in hundredths of the actual currency
             */
            ingredient.cost = ingredient.cost * defaultNormalizationFactorForCost;

            ingredientsPromises.push(app.service('ingredients').create(ingredient));
          });

          const deleteFileDataPromise = app.get('redisClient').delAsync(`${redisKeyPrefix}:${fileId}`);

          return { deletion: deleteFileDataPromise, ingredients: Promise.all(ingredientsPromises) };
        })
        .then((result) => Promise.all([result.ingredients, result.deletion]))
        .then((result) => {
          log.info({
            subModule, requestId: params.requestId, sessionId: params.sessionId
          }, 'New ingredients created from uploaded file with ingredients data.');

          return Promise.resolve(result[0]);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
  };
}
