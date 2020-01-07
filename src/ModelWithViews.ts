import {
  DropOptions,
  Model,
  ModelOptions,
  Sequelize,
  SyncOptions,
} from 'sequelize';

import { QueryInterfaceWithViews } from './SequelizeWithViews';

/**
 * Interface describing the options property on a model
 *
 * @export
 * @interface ModelOptionsWithViews
 * @extends {ModelOptions}
 */
export interface ModelOptionsWithViews extends ModelOptions {
  treatAsView?: boolean;
}

export type DropOptionsType = DropOptions & {
  treatAsView?: boolean;
  viewDefinition?: string;
};

export type OptionsType = ModelOptions<Model> & {
  treatAsView?: boolean;
  viewDefinition?: string;
  sequelize: Sequelize;
};

/**
 * Model abstract class with view support
 *
 * @export
 * @class ModelWithViews
 * @extends {Model}
 */
export class ModelWithViews extends Model {
  /** @inheritdoc */
  public static readonly options: OptionsType;

  /** @inheritdoc */
  public static QueryInterface: QueryInterfaceWithViews;

  /** @inheritdoc */
  public static drop(options: DropOptionsType = {}): any {
    const method = this.options.treatAsView ? 'dropView' : 'dropTable';

    return this.QueryInterface[method](this.getTableName(), options);
  }

  /** @inheritdoc */
  public static sync(options: SyncOptions): any {
    if (this.options.treatAsView) return Promise.resolve();

    return super.sync(options);
  }

  /**
   * Executes the query to create a view
   *
   * @static
   * @returns {Promise<[unknown[], unknown]>} Result of the create view request
   * @memberof ModelWithViews
   */
  public static syncView(): Promise<[unknown[], unknown]> {
    return this.QueryInterface.createView(
      this.getTableName(),
      this.getViewDefinition()
    );
  }

  /**
   * Gets the sql definition for this view
   *
   * @static
   * @returns {string} SQL query string to create a view
   * @memberof ModelWithViews
   */
  public static getViewDefinition(): string {
    return this.options.viewDefinition;
  }
}

export default ModelWithViews;
