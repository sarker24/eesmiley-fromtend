import * as fs from 'fs';
import { Hook, HookContext } from '@feathersjs/feathers';

export default function (): Hook {
  /**
   * Deletes the uploaded ingredients file after it has been parsed.
   *
   * After-hook for: post
   *
   * @param {any} hook  Contains the request object
   * @returns {Promise} Promise   The hook request object
   */
  return function (hook: HookContext) {
    const filePath = (hook.type === 'error' && hook.data.file && hook.data.file.path) ? hook.data.file.path :
      `${process.cwd()}/src/services/uploads/files/${hook.result.fileId}`;

    fs.unlink(filePath, (err) => {
      if (err) {
        log.error({
          subModule: 'delete-uploaded-file',
          errorCode: 'E102',
          filePath,
          err,
          requestId: hook.params.requestId,
          sessionId: hook.params.sessionId
        }, 'Could not delete uploaded file.');
      } else {
        log.info({
          subModule: 'delete-uploaded-file',
          filePath,
          requestId: hook.params.requestId,
          sessionId: hook.params.sessionId
        }, 'Uploaded file has been deleted.');
      }
    });

    return Promise.resolve(hook);
  };
}
