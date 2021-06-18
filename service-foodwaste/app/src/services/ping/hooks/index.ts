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
  find: [(hook) => {
    hook.app.response.statusCode = 418;
  }],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
