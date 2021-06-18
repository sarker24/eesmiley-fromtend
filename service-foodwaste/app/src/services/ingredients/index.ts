import ingredientModel from './ingredient-model';
import * as hooks from './hooks';

const { Service } = require('feathers-sequelize');

export default function () {
  const app: any = this;

  app.use('/ingredients', new Service({
    Model: ingredientModel(app.get('sequelize'), app.get('Sequelize')),
    raw: false
  }));

  const ingredientsService: any = app.service('/ingredients');

  ingredientsService.hooks(hooks);
}
