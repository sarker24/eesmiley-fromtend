import FoodwasteTargetService from './foodwaste';
import FrequencyTargetService from './frequency';
import * as foodwasteTargetHooks from './foodwaste/hooks';
import * as frequencyTargetHooks from './frequency/hooks';

export default function () {
  const app: any = this;
  app.use('/targets/foodwaste', new FoodwasteTargetService());
  app.service('/targets/foodwaste').hooks(frequencyTargetHooks);

  app.use('/targets/frequency', new FrequencyTargetService());
  app.service('/targets/frequency').hooks(foodwasteTargetHooks);
}
