import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';

export const before = {
  all: [authVerifyToken(), populateUserAndCostumer()],
  find: [],
  get: [],
  remove: []
};

export const after = {
  all: [],
  find: [],
  get: [],
  remove: []
};

export const error = {
  all: [],
  find: [],
  get: [],
  remove: []
};

