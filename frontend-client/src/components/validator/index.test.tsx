import { validate } from './index';
import { ErrorObject } from 'ajv';

/*
  not a fan of this, but a few issues:

 DataValidation leaks impl detail & doesnt have proper api (revealing library prop),
 which seems to be next to impossible to test with changing values. Especially because it seems we cant mock implementation at describe/test level, only global,
 not sure why (mocking should work at describe level)
 */

const DataValidationMock = {
  library: { errors: [] },
  validate: jest.fn(),
  reset: () => {
    DataValidationMock.library = { errors: [] };
    DataValidationMock.validate.mockClear();
  },
  setErrors: (errors: Partial<ErrorObject>[]) => (DataValidationMock.library = { errors })
};

jest.mock('frontend-core', () => ({
  DataValidation: jest.fn(() => DataValidationMock)
}));

describe('Validator component', () => {
  beforeEach(() => {
    DataValidationMock.reset();
  });

  it('should return nothing when given a valid data', () => {
    const fakeIngredient = {
      cost: 0,
      name: 'Jalapeno'
    };

    const validation = validate('schema-id-here', fakeIngredient);
    expect(DataValidationMock.validate).toHaveBeenCalledTimes(1);
    expect(validation).toEqual({});
  });

  it('should return required errors when given invalid data without allErrors flag', () => {
    DataValidationMock.setErrors([{ dataPath: 'cost' }, { dataPath: 'name', keyword: 'required' }]);
    const failIngredient = {
      cost: -10,
      name: 'A'
    };

    const validation = validate('schema-id-here', failIngredient, null, false);

    expect(DataValidationMock.validate).toHaveBeenCalledTimes(1);
    expect(validation).toEqual({ name: true });
  });

  it('should return all errors when given invalid data and allErrors flag', () => {
    DataValidationMock.setErrors([{ dataPath: 'cost' }, { dataPath: 'name', keyword: 'required' }]);
    const failIngredient = {
      cost: -10,
      name: 'A'
    };

    const validation = validate('schema-id-here', failIngredient);

    expect(DataValidationMock.validate).toHaveBeenCalledTimes(1);
    expect(validation).toEqual({ cost: true, name: true });
  });

  it('should return error for given key', () => {
    DataValidationMock.setErrors([{ dataPath: 'cost' }, { dataPath: 'name', keyword: 'required' }]);
    const failIngredient = {
      cost: -10,
      name: 'A'
    };

    const validation = validate('schema-id-here', failIngredient, 'cost');

    expect(DataValidationMock.validate).toHaveBeenCalledTimes(1);
    expect(validation).toEqual(false);
  });
});
