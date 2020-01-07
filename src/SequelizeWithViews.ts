import Sequelize, {
  ModelAttributes,
  SyncOptions,
  QueryInterface,
} from 'sequelize';
import ModelManager from 'sequelize/types/lib/model-manager';

import ModelWithViews, { ModelOptionsWithViews } from './ModelWithViews';

type ModelIterator = (model: typeof ModelWithViews, name: string) => void;

interface ForEachModelOptions {
  reverse?: boolean;
}

interface ModelManagerWithViews extends ModelManager {
  forEachModel: (
    iterator: ModelIterator,
    options?: ForEachModelOptions
  ) => void;
}

const isModelWithViewSupport = (model: any): model is typeof ModelWithViews =>
  model && model.options && model.options.treatAsView;

/**
 * Extended query interface including support for creating and dropping views
 *
 * @export
 * @interface QueryInterfaceWithViews
 * @extends {QueryInterface}
 */
export interface QueryInterfaceWithViews extends QueryInterface {
  dropView: (viewName: any, options: any) => Promise<[unknown[], unknown]>;
  createView: (
    viewName: any,
    viewDefinition: string
  ) => Promise<[unknown[], unknown]>;
}

/**
 * Sequelize class with view support
 *
 * @class SequelizeWithViews
 * @extends {Sequelize.Sequelize}
 */
class SequelizeWithViews extends Sequelize.Sequelize {
  queryInterface: QueryInterfaceWithViews;
  modelManager: ModelManagerWithViews;
  /** @inheritdoc */
  getQueryInterface(): QueryInterfaceWithViews {
    super.getQueryInterface();

    if (typeof this.queryInterface.dropView !== 'function') {
      this.queryInterface.dropView = function(
        viewName: any
      ): Promise<[unknown[], unknown]> {
        const sql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
        return this.sequelize.query(sql);
      };
    }

    if (typeof this.queryInterface.createView != 'function') {
      this.queryInterface.createView = function(
        viewName: any,
        viewDefinition: string
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(viewDefinition);
      };
    }

    return this.queryInterface;
  }

  /** @inheritdoc */
  public define(
    modelName: string,
    attributes: ModelAttributes,
    options: ModelOptionsWithViews
  ): typeof ModelWithViews {
    options = options || {};

    const ModelClone = class extends ModelWithViews {};

    ModelClone.init(attributes, { ...options, modelName, sequelize: this });

    return ModelClone;
  }

  /** @inheritdoc */
  sync(options: SyncOptions): any {
    return super.sync(options).then(() => this.syncViews());
  }

  /**
   * Executes the create view query for each of the view definitions
   *
   * @returns {Promise<any[]>} The results of the create view queries
   * @memberof SequelizeWithViews
   */
  syncViews(): Promise<any[]> {
    const views = this.getViews();

    return Promise.all(views.map(view => view.syncView()));
  }

  /**
   * Gets all the defined models which represent views
   *
   * @returns {typeof ModelWithViews[]} An array containing all view models
   * @memberof SequelizeWithViews
   */
  getViews(): typeof ModelWithViews[] {
    const models: typeof ModelWithViews[] = [];
    this.modelManager.forEachModel(function(model) {
      if (isModelWithViewSupport(model)) models.push(model);
    });
    return models;
  }
}

export default SequelizeWithViews;
