export * from 'sequelize';
import SequelizeOrig, { DataTypes } from 'sequelize';
import ModelManager from 'sequelize/types/lib/model-manager';

import Model, { ModelOptionsWithViews } from './ModelWithViews';

type ModelIterator = (model: typeof Model, name: string) => void;

interface ForEachModelOptions {
  reverse?: boolean;
}

interface ModelManagerWithViews extends ModelManager {
  forEachModel: (
    iterator: ModelIterator,
    options?: ForEachModelOptions
  ) => void;
}

const isModelWithView = (model: any): model is typeof Model =>
  model && model.options && model.options.treatAsView;

const isModelWithMaterializedView = (model: any): model is typeof Model =>
  model && model.options && model.options.treatAsMaterializedView;

export interface DropViewOptions {
  cascade?: boolean;
}

/**
 * Extended query interface including support for creating and dropping views
 *
 * @export
 * @interface QueryInterfaceWithViews
 * @extends {QueryInterface}
 */
export interface QueryInterfaceWithViews extends SequelizeOrig.QueryInterface {
  dropView: (
    viewName: any,
    options?: DropViewOptions
  ) => Promise<[unknown[], unknown]>;
  createView: (
    viewName: any,
    viewDefinition: string
  ) => Promise<[unknown[], unknown]>;
  dropMaterializedView: (
    viewName: any,
    options: any
  ) => Promise<[unknown[], unknown]>;
  createMaterializedView: (
    viewName: any,
    viewDefinition: string
  ) => Promise<[unknown[], unknown]>;
  refreshMaterializedView: (viewName: any) => Promise<[unknown[], unknown]>;
}

/**
 * Sequelize class with view support
 *
 * @class SequelizeWithViews
 * @extends {Sequelize.Sequelize}
 */
export class Sequelize extends SequelizeOrig.Sequelize {
  private queryInterface: QueryInterfaceWithViews;
  public modelManager: ModelManagerWithViews;

  public static DECIMAL: typeof SequelizeOrig.DECIMAL;
  public static BLOB: typeof DataTypes.BLOB;
  public static STRING: typeof DataTypes.STRING;
  public static CHAR: typeof DataTypes.CHAR;
  public static TEXT: typeof DataTypes.TEXT;
  public static CITEXT: typeof DataTypes.CITEXT;
  public static TINYINT: typeof DataTypes.TINYINT;
  public static SMALLINT: typeof DataTypes.SMALLINT;
  public static INTEGER: typeof DataTypes.INTEGER;
  public static BIGINT: typeof DataTypes.BIGINT;
  public static BOOLEAN: typeof DataTypes.BOOLEAN;
  public static DATE: typeof DataTypes.DATE;
  public static DATEONLY: typeof DataTypes.DATEONLY;
  public static REAL: typeof DataTypes.REAL;
  public static FLOAT: typeof DataTypes.FLOAT;
  public static GEOMETRY: typeof DataTypes.GEOMETRY;
  public static GEOGRAPHY: typeof DataTypes.GEOGRAPHY;
  public static HSTORE: typeof DataTypes.HSTORE;
  public static RANGE: typeof DataTypes.RANGE;
  public static ENUM: typeof DataTypes.ENUM;

  /** @inheritdoc */
  getQueryInterface(): QueryInterfaceWithViews {
    super.getQueryInterface();

    if (typeof this.queryInterface.dropMaterializedView !== 'function') {
      this.queryInterface.dropMaterializedView = function(
        viewName: any
      ): Promise<[unknown[], unknown]> {
        const sql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
        return this.sequelize.query(sql);
      };
    }

    if (typeof this.queryInterface.createMaterializedView != 'function') {
      this.queryInterface.createMaterializedView = function(
        viewName: any,
        viewDefinition: string
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(
          `CREATE MATERIALIZED VIEW IF NOT EXISTS "${viewName}" AS ${viewDefinition}`
        );
      };
    }

    if (typeof this.queryInterface.refreshMaterializedView != 'function') {
      this.queryInterface.refreshMaterializedView = function(
        viewName: any
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(`REFRESH MATERIALIZED VIEW ${viewName};`);
      };
    }

    if (typeof this.queryInterface.dropView !== 'function') {
      this.queryInterface.dropView = function(
        viewName: any,
        options: DropViewOptions = {}
      ): Promise<[unknown[], unknown]> {
        const sql = `DROP VIEW IF EXISTS "${viewName}"${
          options.cascade ? ' CASCADE' : ''
        }`;
        return this.sequelize.query(sql);
      };
    }

    if (typeof this.queryInterface.createView != 'function') {
      this.queryInterface.createView = function(
        viewName: any,
        viewDefinition: string
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(
          `CREATE OR REPLACE VIEW "${viewName}" AS ${viewDefinition}`
        );
      };
    }

    return this.queryInterface;
  }

  /** @inheritdoc */
  public define(
    modelName: string,
    attributes: SequelizeOrig.ModelAttributes,
    options?: ModelOptionsWithViews<Model>
  ): typeof Model {
    options = options || {};

    const ModelClone = class extends Model {};

    ModelClone.init(attributes, { ...options, modelName, sequelize: this });

    return ModelClone;
  }

  /** @inheritdoc */
  public sync(options?: SequelizeOrig.SyncOptions): any {
    return super
      .sync(options)
      .then(() =>
        Promise.all([this.syncViews(), this.syncMaterializedViews()])
      );
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
   * @returns {typeof Model[]} An array containing all view models
   * @memberof SequelizeWithViews
   */
  getViews(): typeof Model[] {
    const models: typeof Model[] = [];
    this.modelManager.forEachModel(function(model) {
      if (isModelWithView(model)) models.push(model);
    });
    return models;
  }

  /**
   * Executes the create materialized view query for each of the definitions
   *
   * @returns {Promise<any[]>} The results of the create view queries
   * @memberof SequelizeWithViews
   */
  syncMaterializedViews(): Promise<any[]> {
    const materializedViews = this.getMaterializedViews();

    return Promise.all(
      materializedViews.map(view => view.syncMaterializedView())
    );
  }

  /**
   * Gets all the defined models which represent materialized views
   *
   * @returns {typeof Model[]} An array containing all materialized view models
   * @memberof SequelizeWithViews
   */
  getMaterializedViews(): typeof Model[] {
    const models: typeof Model[] = [];
    this.modelManager.forEachModel(function(model) {
      if (isModelWithMaterializedView(model)) models.push(model);
    });
    return models;
  }
}

export default Sequelize;
