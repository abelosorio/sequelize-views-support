import {
  DropOptions,
  Model as ModelOrig,
  ModelOptions,
  SyncOptions,
} from 'sequelize';

import { Sequelize, QueryInterfaceWithViews } from './SequelizeWithViews';

/**
 * Interface describing the options property on a model
 *
 * @export
 * @interface ModelOptionsWithViews
 * @extends {ModelOptions}
 */
export interface ModelOptionsWithViews<M extends ModelOrig>
  extends ModelOptions<M> {
  treatAsView?: boolean;
  treatAsMaterializedView?: boolean;
  viewDefinition?: string;
  materializedViewDefinition?: string;
}

export type DropOptionsType = DropOptions & {
  treatAsView?: boolean;
  treatAsMaterializedView?: boolean;
  viewDefinition?: string;
};

export type OptionsType = ModelOptionsWithViews<ModelOrig> & {
  sequelize: Sequelize;
};

/**
 * Model abstract class with view support
 *
 * @export
 * @class Model
 * @extends {Model}
 */
export class Model extends ModelOrig {
  /** @inheritdoc */
  public static readonly options: OptionsType;

  /** @inheritdoc */
  public static QueryInterface: QueryInterfaceWithViews;

  /** @inheritdoc */
  public static drop(options: DropOptionsType = {}): any {
    const method = this.options.treatAsView
      ? 'dropView'
      : this.options.treatAsMaterializedView
      ? 'dropMaterializedView'
      : 'dropTable';

    return this.QueryInterface[method](this.getTableName(), options);
  }

  /** @inheritdoc */
  public static sync(options: SyncOptions): any {
    if (this.options.treatAsView || this.options.treatAsMaterializedView)
      return Promise.resolve();

    return super.sync(options);
  }

  /**
   * Executes the query to create a view
   *
   * @static
   * @returns {Promise<[unknown[], unknown]>} Result of the create view request
   * @memberof Model
   */
  public static syncView(): Promise<[unknown[], unknown]> {
    return this.QueryInterface.createView(
      this.getTableName(),
      this.getViewDefinition()
    );
  }

  /**
   * Executes the query to create a materialized view
   *
   * @static
   * @returns {Promise<[unknown[], unknown]>} Result of the create materialized view request
   * @memberof Model
   */
  public static syncMaterializedView(): Promise<[unknown[], unknown]> {
    return this.QueryInterface.createMaterializedView(
      this.getTableName(),
      this.getMaterializedViewDefinition()
    );
  }

  /**
   * Gets the sql definition for this view
   *
   * @static
   * @returns {string} SQL query string to create a view
   * @memberof Model
   */
  public static getViewDefinition(): string {
    return this.options.viewDefinition;
  }

  /**
   * Gets the sql definition for this materialized view
   *
   * @static
   * @returns {string} SQL query string to create the materialized view
   * @memberof Model
   */
  public static getMaterializedViewDefinition(): string {
    return this.options.materializedViewDefinition;
  }

  /**
   * Refreshes the materialized view in the database
   *
   * @static
   * @returns {Promise<[unknown[], unknown]>}
   * @memberof Model
   */
  public static refreshMaterializedView(): Promise<[unknown[], unknown]> {
    return this.QueryInterface.refreshMaterializedView(this.getTableName());
  }
}

export default Model;
