import Sequelize from 'sequelize';

import ModelViewsSupport from './model-views-support';
import addViewsSupportToQueryInterface from './query-interface-views-support';

class SequelizeViewsSupport extends Sequelize {
  /** @inheritdoc */
  getQueryInterface() {
    super.getQueryInterface();

    if (typeof this.queryInterface.dropView !== 'function') {
      this.queryInterface = addViewsSupportToQueryInterface(this.queryInterface);
    }

    return this.queryInterface;
  }

  /** @inheritdoc */
  define(modelName, attributes, options) {
    options = options || {};

    options.modelName = modelName;
    options.sequelize = this;

    const model = class extends ModelViewsSupport {};

    model.init(attributes, options);

    return model;
  }

  /** @inheritdoc */
  sync(options) {
    return super.sync(options).then(() => this.syncViews());
  }

  syncViews() {
    const views = this.getViews();

    return Promise.all(views.map((view) => view.syncView()));
  }

  getViews() {
    const views = [];

    this.modelManager.forEachModel((model) => {
      if (model && model.options && model.options.treatAsView) {
        views.push(model);
      }
    });

    return views;
  }
};

export default SequelizeViewsSupport;
