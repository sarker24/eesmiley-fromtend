export const before = {
  all: [(hook) => {
    delete hook.app.response.statusCode;
  }],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

export const after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
