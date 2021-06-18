'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');
const parserXls = require('node-xlsx');
const fs = require('fs');
const stream = require('stream').PassThrough;

const parseUploadedFile = require('../../../../../src/services/uploads/hooks/parse-uploaded-file');

describe('Uploads Service - parse-uploaded-file', () => {
  const sequelize = app.get('sequelize');
  const sandbox = sinon.createSandbox();
  let hookInput;
  let headLineAttributes;


  beforeEach(() => {
    hookInput = {
      type: 'after',
      method: 'create',
      app: app,
      data: {
        file: {
          mimetype: 'text/csv',
          filename: 'hello-world'
        }
      },
      result: {
        fileId: 'hello-world'
      },
      params: {}
    };

    headLineAttributes = [[
      'customerId',
      'name',
      'cost',
      'unit',
      'currency',
      'amount',
      'bootstrapKey'
    ]];

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass all verification when given all required attributes', () => {

    const attributesMock = {
      name: { allowNull: false },
      cost: { allowNull: false },
      unit: { allowNull: false },
      currency: { allowNull: false },
      amount: { allowNull: false },
      description: { allowNull: true }
    };

    sandbox.stub(sequelize.models.ingredient, 'rawAttributes').returns({
      attributesMock
    });

    const attr = parseUploadedFile.verifyRequiredAttributes(headLineAttributes, hookInput);

    expect(attr.missingRequiredAttributes).to.deep.equals([]);
    expect(attr.requiredAttributes).to.deep.equals(['name', 'cost', 'unit', 'currency', 'amount']);
    expect(attr.providedAttributes).to.deep.equals(headLineAttributes[0]);
  });

  it('should pass all verification when given all required attributes and model has timestamps', () => {

    const attributesMock = {
      name: { allowNull: false },
      cost: { allowNull: false },
      unit: { allowNull: false },
      currency: { allowNull: false },
      amount: { allowNull: false },
      description: { allowNull: true },
      createdAt: { allowNull: false, fieldName: 'createdAt' },
      updatedAt: { allowNull: false, fieldName: 'updatedAt' },
      deletedAt: { allowNull: false, fieldName: 'deletedAt' }
    };

    sandbox.stub(sequelize.models.ingredient, 'rawAttributes').returns({
      attributesMock
    });

    const attr = parseUploadedFile.verifyRequiredAttributes(headLineAttributes, hookInput);

    expect(attr.missingRequiredAttributes).to.deep.equals([]);
    expect(attr.requiredAttributes).to.deep.equals(['name', 'cost', 'unit', 'currency', 'amount']);
    expect(attr.providedAttributes).to.deep.equals(headLineAttributes[0]);
  });

  it('should verify missing required attributes', () => {

    const incompleteHeadLineAttributes = [['name', 'unit', 'currency']];
    const attributesMock = {
      name: { allowNull: false },
      cost: { allowNull: false },
      unit: { allowNull: false },
      currency: { allowNull: false },
      amount: { allowNull: false },
      description: { allowNull: true }
    };

    sandbox.stub(sequelize.models.ingredient, 'rawAttributes').returns({
      attributesMock
    });

    const attr = parseUploadedFile.verifyRequiredAttributes(incompleteHeadLineAttributes, hookInput);

    expect(attr.missingRequiredAttributes).to.deep.equals(['cost', 'amount']);
    expect(attr.requiredAttributes).to.deep.equals(['name', 'cost', 'unit', 'currency', 'amount']);
    expect(attr.providedAttributes).to.deep.equals(incompleteHeadLineAttributes[0]);
  });

  it('should throw an error when the parsed data contains badly formatted data', () => {
    const badParsedData = [
      [],
      [],
      [, 'sdgd'],
      ['gdf', , , 'sdg'],
      [, 'asd'],
      [],
      [, 'gf'],
      [],
      ['asf'],
      [],
      [],
      [, 'sdgd'],
      ['gdf', , , 'sdg'],
      [, 'asd'],
      [],
      [, 'gf'],
      [],
      ['asf']
    ];
    const missingAttr = ['name', 'cost', 'unit', 'currency', 'amount'];

    try {
      parseUploadedFile.constructDataObjectToStore(badParsedData, missingAttr)
    } catch (err) {
      expect(err.message).to.equal('Something is wrong with the uploaded file rows, compared to the headline attributes.');
      expect(err.data.errorCode).to.equal('E101');
    }
  });

  it('should construct attribute object correctly', () => {
    const missingAttr = ['cost', 'amount'];
    const parsedData = [[1, 'avocado', 123, 'kg', 'DKK', 'compass', 'null'],
      [1, 'aushf', 123, 'kg', 'DKK', 'compass', 'null'],
      [1, 'dshgss', 123, 'kg', 'DKK', 'compass', 'null']];


    const attr = parseUploadedFile.constructDataObjectToStore(parsedData, missingAttr);

    expect(attr).to.have.property('responseData');
    expect(attr).to.have.property('heapData');

    expect(attr.responseData).to.deep.equals({
      '1': [1, 1],
      '123': [123, 123],
      avocado: ['aushf', 'dshgss'],
      kg: ['kg', 'kg'],
      DKK: ['DKK', 'DKK'],
      compass: ['compass', 'compass'],
      null: ['null', 'null'],
      cost: [],
      amount: []
    });
    expect(attr.heapData).to.deep.equals([{
      '1': 1,
      '123': 123,
      avocado: 'aushf',
      kg: 'kg',
      DKK: 'DKK',
      compass: 'compass',
      null: 'null'
    },
      {
        '1': 1,
        '123': 123,
        avocado: 'dshgss',
        kg: 'kg',
        DKK: 'DKK',
        compass: 'compass',
        null: 'null'
      }]);
  });

  it('should return an error when parseXls returns an error', () => {
    sandbox.stub(parserXls, 'parse').returns(new Error('some error'));

    return parseUploadedFile.parseXls({}, '', '')
      .catch(err => {
        expect(err.message).to.equal('Could not parse XLS file.');
        expect(err.data.errorCode).to.equal('E144');
      });
  });

  it('should throw correct error if caching fails', async () => {
    sandbox.stub(app.get('redisClient'), 'setexAsync').rejects({readMe: 'oopsie whoopsidity'});
    try {
      await parseUploadedFile.cacheAttributeObject(null, hookInput);
    } catch (err) {
      expect(err.data.errorCode).to.equal('E145')
    }
  });

  it('should use cvs parser when given mimetype is text or cvs ', async () => {

    const mockStream = new stream();
    mockStream.push(headLineAttributes.toString());
    mockStream.end();

    sandbox.stub(mockStream, 'pipe').returns(mockStream);
    sandbox.stub(process, 'cwd').returns('parser');

    const fsStub = sandbox.stub(fs, 'createReadStream').callsFake(filename => mockStream);


    try {
      const result = await parseUploadedFile.parseFile(hookInput);
      expect(fsStub.calledOnce).to.equal(true);
      expect(fsStub.args[0][0]).to.equal(`parser/src/services/uploads/files/${hookInput.result.fileId}`);
    } catch (err) {
      assert.fail('unexpected error ', err);
    }
  });

  it('should use xls parser as fallback', async () => {
    hookInput.data.file.mimetype = 'application/json';
    const xlsStub = sandbox.stub(parserXls, 'parse').returns([{data: headLineAttributes}]);
    sandbox.stub(process, 'cwd').returns('parser');

    const result = await parseUploadedFile.parseFile(hookInput);

    expect(xlsStub.calledOnce).to.equal(true);
    expect(xlsStub.args[0][0]).to.equal(`parser/src/services/uploads/files/${hookInput.result.fileId}`);
    expect(result).to.deep.equal(headLineAttributes);

  });

});
