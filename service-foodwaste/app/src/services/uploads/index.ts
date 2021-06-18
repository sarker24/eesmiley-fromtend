import ingredientsUploadFileMappings from './ingredients-upload-file-mappings';
import * as hooks from './hooks/index';
import * as ingredientsUploadFileMappingsHooks from './hooks/ingredients-upload-file-mappings-hooks';

const multer = require('multer');
const upload = multer({ dest: __dirname + '/files' });

class Service {
  app: any;

  constructor(options: { app: any }) {
    this.app = options.app;
  }

  create(data, params) {
    return Promise.resolve({ fileId: data.file.filename });
  }
}

export default function () {
  const app: any = this;

  app.use('/uploads',
    upload.single('file'),
    function (req, res, next) {
      req.body.file = req.file;
      next();
    },
    new Service({ app })
  );

  app.service('/uploads').hooks(hooks);

  app.use('/uploads/:fileId/mappings', ingredientsUploadFileMappings(app));
  app.service('/uploads/:fileId/mappings').hooks(ingredientsUploadFileMappingsHooks);
}

