/**
 cleans out unneeded timestamps from project responses.
 Needed only because of sequelize doesnt seem to filter out
 timestamps when using include

 After hook: ALL
 */
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return (hook: HookContext) => {
    const projects = Array.isArray(hook.result) ? hook.result : [hook.result];
    projects.forEach(project => {
      project.registrationPoints = project.registrationPoints.map(point => {
        point.id = parseInt(point.id);
        delete point.createdAt;
        delete point.deletedAt;
        delete point.updatedAt;
        return point;
      });
    });

    return hook;
  };
};
