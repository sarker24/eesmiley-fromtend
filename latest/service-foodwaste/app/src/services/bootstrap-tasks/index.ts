import * as hooks from './hooks';
import BootstrapTemplateService  from './bootstrap-task-service';

export default function () {
  const app: any = this;
  app.use('/bootstrap-tasks', new BootstrapTemplateService());
  app.service('/bootstrap-tasks').hooks(hooks);
}

