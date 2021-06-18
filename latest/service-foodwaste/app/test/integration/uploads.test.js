const app = require('../../src/app').default;
const fs = require('fs');
const commons = require('feathers-commons-esmiley');
const sinon = require('sinon');

const longLiveAccessToken = app.get('testLongLivedAccessToken');
const testFilesFolder = `${process.cwd()}/test/fixtures/files`;
const uploadedFilesFolder = `${process.cwd()}/src/services/uploads/files`;

describe('Uploads Service', () => {

  const sandbox = sinon.createSandbox();
  let legacyResponse;

  beforeEach(() => {

    legacyResponse = {
      current: { dealId: '1', company: 'Customer 1' },
      children: [
        { dealId: '10558', company: '(1139)  Novo Nordisk JC' },
        { dealId: '10712', company: '(1195) Novo Nordisk DD' },
        { dealId: '10795', company: '(1379) KLP 5G' },
        { dealId: '11163', company: '(1337) Havneholmen Atrium ' },
        { dealId: '11167', company: '(1381) Bonnier Publications' },
        { dealId: '11179', company: '(1155) Novo Nordisk  Fritidscenter' },
        { dealId: '10240', company: "(1339) KLP Ørestad 5H " },
        { dealId: '10244', company: "(1122) Dong Asnæsværket" },
        { dealId: '10479', company: "(1190) Novo Nordisk EG" },
        { dealId: '10507', company: "(1191) Novo Nordisk DF" },
        { dealId: '10525', company: "(1194) Novo Nordisk HC" },
        { dealId: '10544', company: "(1189) Novo Nordisk AE" }
      ]
    };

    global.makeHttpRequestMock.resolves(legacyResponse);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should upload a CSV file', () => {
    return chakram.request('POST', '/uploads', {
      formData: {
        file: fs.createReadStream(`${testFilesFolder}/ingredients.csv`)
      },
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      }
    }).then((res) => {
      const body = res.body;

      expectChakram(body).to.have.property('fileId');
      expectChakram(body).to.have.property('missingRequiredAttributes');
      expectChakram(body).to.have.property('requiredAttributes');
      expectChakram(body).to.have.property('providedAttributes');
      expectChakram(body).to.have.property('data');

      expectChakram(body.fileId).to.be.a('string');
      expectChakram(body.missingRequiredAttributes).to.deep.equal(['cost', 'amount']);
      expectChakram(body.requiredAttributes).to.deep.equal(['name', 'cost', 'unit', 'currency', 'amount']);
      expectChakram(body.providedAttributes).to.deep.equal(['customerId',
        'name',
        'price',
        'unit',
        'currency',
        'source',
        'bootstrapKey']
      );
      expectChakram(body.data).to.deep.equal({
          customerId: ['1', '1', '1'],
          name: ['avocado', 'aushf', 'dshgss'],
          price: ['123', '123', '123'],
          unit: ['kg', 'kg', 'kg'],
          currency: ['DKK', 'DKK', 'DKK'],
          source: ['compass', 'compass', 'compass'],
          bootstrapKey: ['null', 'null', 'null'],
          cost: [],
          amount: []
        }
      );

      /*
       * Check that the folder where the files are uploaded is actually empty,
       * which means that the file has been deleted after its parsed
       */
      const result = fs.readdirSync(uploadedFilesFolder);
      expectChakram(result.length).to.equal(0);

      return Promise.resolve(body);
    }).then((body) => {
      /*
       * Now check that the parsed data is in Redis
       */
      const organizedData = [
        {
          customerId: '1',
          name: 'avocado',
          price: '123',
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: '1',
          name: 'aushf',
          price: '123',
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: '1',
          name: 'dshgss',
          price: '123',
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        }];
      const redisKeyPrefix = app.get('redisKeyPrefix').ingredientsFileUpload;

      return app.get('redisClient').getAsync(`${redisKeyPrefix}:${body.fileId}`)
        .then((result) => {
          const data = JSON.parse(result);

          expectChakram(data.length).to.equal(3);
          expectChakram(data).to.deep.equal(organizedData);

          return Promise.resolve(body.fileId);
        });
    }).then((fileId) => {
      /*
       * Now post to /uploads/:fileId/mappings to finish the ingredients upload
       */
      return chakram.request('POST', `/uploads/${fileId}/mappings`, {
        body: {
          mappings: {
            cost: 'price',
            name: 'name'
          }
        },
        headers: {
          Authorization: `Bearer ${longLiveAccessToken}`
        }
      }).then((res) => {
        expectChakram(res.body.length).to.equal(3);
        /*
         * We don't check for the integrity of the data, because the records are returned
         * in a different ordered every time, so the test will fail because the IDs won't match
         */
      });
    });
  });

  it('should upload an XLSX file', () => {
    return chakram.request('POST', '/uploads', {
      formData: {
        file: fs.createReadStream(`${testFilesFolder}/ingredients.xlsx`)
      },
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      }
    }).then((res) => {
      const body = res.body;

      expectChakram(body).to.have.property('fileId');
      expectChakram(body).to.have.property('missingRequiredAttributes');
      expectChakram(body).to.have.property('requiredAttributes');
      expectChakram(body).to.have.property('providedAttributes');
      expectChakram(body).to.have.property('data');

      expectChakram(body.fileId).to.be.a('string');
      expectChakram(body.missingRequiredAttributes).to.deep.equal(['cost', 'amount']);
      expectChakram(body.requiredAttributes).to.deep.equal(['name', 'cost', 'unit', 'currency', 'amount']);
      expectChakram(body.providedAttributes).to.deep.equal(['customerId',
        'name',
        'price',
        'unit',
        'currency',
        'source',
        'bootstrapKey']
      );
      expectChakram(body.data).to.deep.equal({
          customerId: [1, 1, 1],
          name: ['avocado', 'aushf', 'dshgss'],
          price: [123, 123, 123],
          unit: ['kg', 'kg', 'kg'],
          currency: ['DKK', 'DKK', 'DKK'],
          source: ['compass', 'compass', 'compass'],
          bootstrapKey: ['null', 'null', 'null'],
          cost: [],
          amount: []
        }
      );

      /*
       * Check that the folder where the files are uploaded is actually empty,
       * which means that the file has been deleted after its parsed
       */
      const result = fs.readdirSync(uploadedFilesFolder);
      expectChakram(result.length).to.equal(0);

      return Promise.resolve(body);
    }).then((body) => {
      /*
       * Now check that the parsed data is in Redis
       */
      const organizedData = [
        {
          customerId: 1,
          name: 'avocado',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: 1,
          name: 'aushf',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: 1,
          name: 'dshgss',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        }];
      const redisKeyPrefix = app.get('redisKeyPrefix').ingredientsFileUpload;

      return app.get('redisClient').getAsync(`${redisKeyPrefix}:${body.fileId}`)
        .then((result) => {
          const data = JSON.parse(result);

          expectChakram(data.length).to.equal(3);
          expectChakram(data).to.deep.equal(organizedData);

          return Promise.resolve(body.fileId);
        });
    }).then((fileId) => {
      /*
       * Now post to /uploads/:fileId/mappings to finish the ingredients upload
       */
      return chakram.request('POST', `/uploads/${fileId}/mappings`, {
        body: {
          mappings: {
            cost: 'price',
            name: 'name'
          }
        },
        headers: {
          Authorization: `Bearer ${longLiveAccessToken}`
        }
      }).then((res) => {
        expectChakram(res.body.length).to.equal(3);
        /*
         * We don't check for the integrity of the data, because the records are returned
         * in a different ordered every time, so the test will fail because the IDs won't match
         */
      });
    });
  });

  it('should return an error when an XLS is badly formatter', () => {
    return chakram.request('POST', '/uploads', {
      formData: {
        file: fs.createReadStream(`${testFilesFolder}/ingredientsError.xls`)
      },
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      }
    }).then((res) => {
      const body = res.body;

      expectChakram(body.message).to.equal('Something is wrong with the uploaded file rows, compared to the headline attributes.');
      expectChakram(body.errorCode).to.equal('E101');
    });
  });

  it('should upload an XLS file', () => {
    return chakram.request('POST', '/uploads', {
      formData: {
        file: fs.createReadStream(`${testFilesFolder}/ingredients.xls`)
      },
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      }
    }).then((res) => {
      const body = res.body;

      expectChakram(body).to.have.property('fileId');
      expectChakram(body).to.have.property('missingRequiredAttributes');
      expectChakram(body).to.have.property('requiredAttributes');
      expectChakram(body).to.have.property('providedAttributes');
      expectChakram(body).to.have.property('data');

      expectChakram(body.fileId).to.be.a('string');
      expectChakram(body.missingRequiredAttributes).to.deep.equal(['cost', 'amount']);
      expectChakram(body.requiredAttributes).to.deep.equal(['name', 'cost', 'unit', 'currency', 'amount']);
      expectChakram(body.providedAttributes).to.deep.equal(['customerId',
        'name',
        'price',
        'unit',
        'currency',
        'source',
        'bootstrapKey']
      );
      expectChakram(body.data).to.deep.equal({
          customerId: [1, 1, 1],
          name: ['avocado', 'aushf', 'dshgss'],
          price: [123, 123, 123],
          unit: ['kg', 'kg', 'kg'],
          currency: ['DKK', 'DKK', 'DKK'],
          source: ['compass', 'compass', 'compass'],
          bootstrapKey: ['null', 'null', 'null'],
          cost: [],
          amount: []
        }
      );

      /*
       * Check that the folder where the files are uploaded is actually empty,
       * which means that the file has been deleted after its parsed
       */
      const result = fs.readdirSync(uploadedFilesFolder);
      expectChakram(result.length).to.equal(0);

      return Promise.resolve(body);
    }).then((body) => {
      /*
       * Now check that the parsed data is in Redis
       */
      const organizedData = [
        {
          customerId: 1,
          name: 'avocado',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: 1,
          name: 'aushf',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        },
        {
          customerId: 1,
          name: 'dshgss',
          price: 123,
          unit: 'kg',
          currency: 'DKK',
          source: 'compass',
          bootstrapKey: 'null'
        }];
      const redisKeyPrefix = app.get('redisKeyPrefix').ingredientsFileUpload;

      return app.get('redisClient').getAsync(`${redisKeyPrefix}:${body.fileId}`)
        .then((result) => {
          const data = JSON.parse(result);

          expectChakram(data.length).to.equal(3);
          expectChakram(data).to.deep.equal(organizedData);

          return Promise.resolve(body.fileId);
        });
    }).then((fileId) => {
      /*
       * Now post to /uploads/:fileId/mappings to finish the ingredients upload
       */
      return chakram.request('POST', `/uploads/${fileId}/mappings`, {
        body: {
          mappings: {
            cost: 'price',
            name: 'name'
          }
        },
        headers: {
          Authorization: `Bearer ${longLiveAccessToken}`
        }
      }).then((res) => {
        expectChakram(res.body.length).to.equal(3);
        /*
         * We don't check for the integrity of the data, because the records are returned
         * in a different ordered every time, so the test will fail because the IDs won't match
         */
      });
    });
  });

  it('should return an error when a file with not allowed mimetype is being uploaded', () => {
    return chakram.request('POST', '/uploads', {
      formData: {
        file: fs.createReadStream(`${testFilesFolder}/disallowed_mimetype_file.xls`)
      },
      headers: {
        Authorization: `Bearer ${longLiveAccessToken}`
      }
    }).catch(err => {
      const body = err.body;

      expectChakram(body.message).to.equal('Mimetype of provided file is not allowed');
      expectChakram(body.errorCode).to.equal('E143');
    });
  });

});
