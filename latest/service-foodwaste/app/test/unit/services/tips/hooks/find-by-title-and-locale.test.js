'use strict';

const app = require('../../../../../src/app').default;
const expect = require('chai').expect;
const sinon = require('sinon');

const findByTitleAndLocale = require('../../../../../src/services/tips/hooks/find-by-title-and-locale').default;

describe('Tips Service - find-by-title-and-locale', () => {
  const sandbox = sinon.createSandbox();
  let mockHook;

  beforeEach(() => {
    mockHook = {
      app,
      params: {
        query: {
          locale: 'en',
          title: 'some title'
        }
      }
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return a BadRequest when "locale" is given but "title" is not', () => {
    delete mockHook.params.query.title;

    return findByTitleAndLocale()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Both locale and title must be present as params, if one of them is given.');
        expect(err.data.errorCode).to.equal('E082');
        expect(err.name).to.equal('BadRequest');
      });
  });

  it('should return a BadRequest when "title" is given but "locale" is not', () => {
    delete mockHook.params.query.locale;

    return findByTitleAndLocale()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Both locale and title must be present as params, if one of them is given.');
        expect(err.data.errorCode).to.equal('E082');
        expect(err.name).to.equal('BadRequest');
      });
  });

  it('should return Tips when the input is valid', () => {
    const result = [{ tip: '1' }, { tip: '2' }];
    sandbox.stub(app.get('sequelize').models.tip, 'findAll').returns(Promise.resolve(result));

    return findByTitleAndLocale()(mockHook)
      .then(hook => {
        expect(hook.result).to.deep.equal(result);
      });
  });

  it('should return an error when sequelize returns an error while getting tips', () => {
    sandbox.stub(app.get('sequelize').models.tip, 'findAll').returns(Promise.reject(new Error('some error')));

    return findByTitleAndLocale()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('Could not get tips');
        expect(err.data.errorCode).to.equal('E083');
        expect(err.name).to.equal('GeneralError');
      });
  });

  it('should return an error when no tips were found', () => {
    sandbox.stub(app.get('sequelize').models.tip, 'findAll').returns(Promise.resolve([]));

    return findByTitleAndLocale()(mockHook)
      .catch(err => {
        expect(err.message).to.equal('No tips found.');
        expect(err.data.errorCode).to.equal('E083');
        expect(err.name).to.equal('NotFound');
      });
  });

});
