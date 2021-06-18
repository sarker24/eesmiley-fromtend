import { authVerifyToken, populateUserAndCostumer } from 'feathers-hooks-esmiley';
import storeLatestUpload from './store-latest-upload';

export const before = {
  all: [
    authVerifyToken(),
    populateUserAndCostumer()
  ],
  create: []
};

export const after = {
  all: [],
  create: [
    storeLatestUpload()
  ]
};

export const error = {
  all: []
};

