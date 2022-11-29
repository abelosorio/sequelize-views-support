export * from 'sequelize';
import {
  Sequelize as SequelizeOrig,
  Options,
  QueryInterface,
  ABSTRACT,
  ARRAY,
  BIGINT,
  BLOB,
  BOOLEAN,
  CHAR,
  CIDR,
  CITEXT,
  DATE,
  DATEONLY,
  DECIMAL,
  DOUBLE,
  ENUM,
  FLOAT,
  GEOGRAPHY,
  GEOMETRY,
  HSTORE,
  INET,
  INTEGER,
  JSONB,
  MACADDR,
  MEDIUMINT,
  NOW,
  NUMBER,
  RANGE,
  REAL,
  SMALLINT,
  STRING,
  TEXT,
  TIME,
  TINYINT,
  UUID,
  UUIDV1,
  UUIDV4,
  VIRTUAL,
  ModelAttributes,
  SyncOptions,
  Attributes,
} from 'sequelize';
import type ModelManager from 'sequelize/types/model-manager';

import Model, { ModelOptionsWithViews } from './ModelWithViews';

export type ModelCtor<M extends Model> = (new () => M) & typeof Model;

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
 * @extends {SequelizeOrig.QueryInterface}
 */
export interface QueryInterfaceWithViews extends QueryInterface {
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
 * @class Sequelize
 * @extends {SequelizeOrig.Sequelize}
 */
export class Sequelize extends SequelizeOrig {
  private queryInterface!: QueryInterfaceWithViews;
  public declare modelManager: ModelManagerWithViews;
  public options!: Options;

  public static ABSTRACT: typeof ABSTRACT;
  public static ARRAY: typeof ARRAY;
  public static BIGINT: typeof BIGINT;
  public static BLOB: typeof BLOB;
  public static BOOLEAN: typeof BOOLEAN;
  public static CHAR: typeof CHAR;
  public static CIDR: typeof CIDR;
  public static CITEXT: typeof CITEXT;
  public static DATE: typeof DATE;
  public static DATEONLY: typeof DATEONLY;
  public static DECIMAL: typeof DECIMAL;
  public static DOUBLE: typeof DOUBLE;
  public static ENUM: typeof ENUM;
  public static FLOAT: typeof FLOAT;
  public static GEOGRAPHY: typeof GEOGRAPHY;
  public static GEOMETRY: typeof GEOMETRY;
  public static HSTORE: typeof HSTORE;
  public static INET: typeof INET;
  public static INTEGER: typeof INTEGER;
  public static JSON: typeof JSON;
  public static JSONB: typeof JSONB;
  public static MACADDR: typeof MACADDR;
  public static MEDIUMINT: typeof MEDIUMINT;
  public static NOW: typeof NOW;
  public static NUMBER: typeof NUMBER;
  public static RANGE: typeof RANGE;
  public static REAL: typeof REAL;
  public static SMALLINT: typeof SMALLINT;
  public static STRING: typeof STRING;
  public static TEXT: typeof TEXT;
  public static TIME: typeof TIME;
  public static TINYINT: typeof TINYINT;
  public static UUID: typeof UUID;
  public static UUIDV1: typeof UUIDV1;
  public static UUIDV4: typeof UUIDV4;
  public static VIRTUAL: typeof VIRTUAL;

  /** @inheritdoc */
  override getQueryInterface(): QueryInterfaceWithViews {
    super.getQueryInterface();

    if (typeof this.queryInterface.dropMaterializedView !== 'function') {
      this.queryInterface.dropMaterializedView = function (
        viewName: any
      ): Promise<[unknown[], unknown]> {
        const sql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
        return this.sequelize.query(sql);
      };
    }

    if (typeof this.queryInterface.createMaterializedView != 'function') {
      this.queryInterface.createMaterializedView = function (
        viewName: any,
        viewDefinition: string
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(
          `CREATE MATERIALIZED VIEW IF NOT EXISTS ${viewName} AS ${viewDefinition}`
        );
      };
    }

    if (typeof this.queryInterface.refreshMaterializedView != 'function') {
      this.queryInterface.refreshMaterializedView = function (
        viewName: any
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(`REFRESH MATERIALIZED VIEW ${viewName}`);
      };
    }

    if (typeof this.queryInterface.dropView !== 'function') {
      this.queryInterface.dropView = function (
        viewName: any,
        options: DropViewOptions = {}
      ): Promise<[unknown[], unknown]> {
        const sql = `DROP VIEW IF EXISTS ${viewName}${
          options.cascade ? ' CASCADE' : ''
        }`;
        return this.sequelize.query(sql);
      };
    }

    if (typeof this.queryInterface.createView != 'function') {
      this.queryInterface.createView = function (
        viewName: any,
        viewDefinition: string
      ): Promise<[unknown[], unknown]> {
        return this.sequelize.query(
          `CREATE OR REPLACE VIEW ${viewName} AS ${viewDefinition}`
        );
      };
    }

    return this.queryInterface;
  }

  /**
   * Define a new model, representing a table in the database.
   *
   * The table columns are defined by the object that is given as the second argument. Each key of the object represents a column
   *
   * @param {string} modelName The name of the model. The model will be stored in `sequelize.models` under this name
   * @param {Object}                  attributes An object, where each attribute is a column of the table. Each column can be either a DataType, a string or a type-description object, with the properties described below:
   * @param {string|DataTypes|Object} attributes.column The description of a database column
   * @param {string|DataTypes}        attributes.column.type A string or a data type
   * @param {boolean}                 [attributes.column.allowNull=true] If false, the column will have a NOT NULL constraint, and a not null validation will be run before an instance is saved.
   * @param {any}                     [attributes.column.defaultValue=null] A literal default value, a JavaScript function, or an SQL function (see `sequelize.fn`)
   * @param {string|boolean}          [attributes.column.unique=false] If true, the column will get a unique constraint. If a string is provided, the column will be part of a composite unique index. If multiple columns have the same string, they will be part of the same unique index
   * @param {boolean}                 [attributes.column.primaryKey=false] If true, this attribute will be marked as primary key
   * @param {string}                  [attributes.column.field=null] If set, sequelize will map the attribute name to a different name in the database
   * @param {boolean}                 [attributes.column.autoIncrement=false] If true, this column will be set to auto increment
   * @param {boolean}                 [attributes.column.autoIncrementIdentity=false] If true, combined with autoIncrement=true, will use Postgres `GENERATED BY DEFAULT AS IDENTITY` instead of `SERIAL`. Postgres 10+ only.
   * @param {string}                  [attributes.column.comment=null] Comment for this column
   * @param {string|Model}            [attributes.column.references=null] An object with reference configurations
   * @param {string|Model}            [attributes.column.references.model] If this column references another table, provide it here as a Model, or a string
   * @param {string}                  [attributes.column.references.key='id'] The column of the foreign table that this column references
   * @param {string}                  [attributes.column.onUpdate] What should happen when the referenced key is updated. One of CASCADE, RESTRICT, SET DEFAULT, SET NULL or NO ACTION
   * @param {string}                  [attributes.column.onDelete] What should happen when the referenced key is deleted. One of CASCADE, RESTRICT, SET DEFAULT, SET NULL or NO ACTION
   * @param {Function}                [attributes.column.get] Provide a custom getter for this column. Use `this.getDataValue(String)` to manipulate the underlying values.
   * @param {Function}                [attributes.column.set] Provide a custom setter for this column. Use `this.setDataValue(String, Value)` to manipulate the underlying values.
   * @param {Object}                  [attributes.column.validate] An object of validations to execute for this column every time the model is saved. Can be either the name of a validation provided by validator.js, a validation function provided by extending validator.js (see the `DAOValidator` property for more details), or a custom validation function. Custom validation functions are called with the value of the field and the instance itself as the `this` binding, and can possibly take a second callback argument, to signal that they are asynchronous. If the validator is sync, it should throw in the case of a failed validation; if it is async, the callback should be called with the error text.
   * @param {Object}                  options These options are merged with the default define options provided to the Sequelize constructor
   * @param {Object}                  options.sequelize Define the sequelize instance to attach to the new Model. Throw error if none is provided.
   * @param {string}                  [options.modelName] Set name of the model. By default its same as Class name.
   * @param {Object}                  [options.defaultScope={}] Define the default search scope to use for this model. Scopes have the same form as the options passed to find / findAll
   * @param {Object}                  [options.scopes] More scopes, defined in the same way as defaultScope above. See `Model.scope` for more information about how scopes are defined, and what you can do with them
   * @param {boolean}                 [options.omitNull] Don't persist null values. This means that all columns with null values will not be saved
   * @param {boolean}                 [options.timestamps=true] Adds createdAt and updatedAt timestamps to the model.
   * @param {boolean}                 [options.paranoid=false] Calling `destroy` will not delete the model, but instead set a `deletedAt` timestamp if this is true. Needs `timestamps=true` to work
   * @param {boolean}                 [options.underscored=false] Add underscored field to all attributes, this covers user defined attributes, timestamps and foreign keys. Will not affect attributes with explicitly set `field` option
   * @param {boolean}                 [options.freezeTableName=false] If freezeTableName is true, sequelize will not try to alter the model name to get the table name. Otherwise, the model name will be pluralized
   * @param {Object}                  [options.name] An object with two attributes, `singular` and `plural`, which are used when this model is associated to others.
   * @param {string}                  [options.name.singular=Utils.singularize(modelName)] Singular name for model
   * @param {string}                  [options.name.plural=Utils.pluralize(modelName)] Plural name for model
   * @param {Array<Object>}           [options.indexes] indexes definitions
   * @param {string}                  [options.indexes[].name] The name of the index. Defaults to model name + _ + fields concatenated
   * @param {string}                  [options.indexes[].type] Index type. Only used by mysql. One of `UNIQUE`, `FULLTEXT` and `SPATIAL`
   * @param {string}                  [options.indexes[].using] The method to create the index by (`USING` statement in SQL). BTREE and HASH are supported by mysql and postgres, and postgres additionally supports GIST and GIN.
   * @param {string}                  [options.indexes[].operator] Specify index operator.
   * @param {boolean}                 [options.indexes[].unique=false] Should the index by unique? Can also be triggered by setting type to `UNIQUE`
   * @param {boolean}                 [options.indexes[].concurrently=false] PostgresSQL will build the index without taking any write locks. Postgres only
   * @param {Array<string|Object>}    [options.indexes[].fields] An array of the fields to index. Each field can either be a string containing the name of the field, a sequelize object (e.g `sequelize.fn`), or an object with the following attributes: `attribute` (field name), `length` (create a prefix index of length chars), `order` (the direction the column should be sorted in), `collate` (the collation (sort order) for the column)
   * @param {string|boolean}          [options.createdAt] Override the name of the createdAt attribute if a string is provided, or disable it if false. Timestamps must be true. Underscored field will be set with underscored setting.
   * @param {string|boolean}          [options.updatedAt] Override the name of the updatedAt attribute if a string is provided, or disable it if false. Timestamps must be true. Underscored field will be set with underscored setting.
   * @param {string|boolean}          [options.deletedAt] Override the name of the deletedAt attribute if a string is provided, or disable it if false. Timestamps must be true. Underscored field will be set with underscored setting.
   * @param {string}                  [options.tableName] Defaults to pluralized model name, unless freezeTableName is true, in which case it uses model name verbatim
   * @param {string}                  [options.schema='public'] schema
   * @param {string}                  [options.engine] Specify engine for model's table
   * @param {string}                  [options.charset] Specify charset for model's table
   * @param {string}                  [options.comment] Specify comment for model's table
   * @param {string}                  [options.collate] Specify collation for model's table
   * @param {string}                  [options.initialAutoIncrement] Set the initial AUTO_INCREMENT value for the table in MySQL.
   * @param {Object}                  [options.hooks] An object of hook function that are called before and after certain lifecycle events. The possible hooks are: beforeValidate, afterValidate, validationFailed, beforeBulkCreate, beforeBulkDestroy, beforeBulkUpdate, beforeCreate, beforeDestroy, beforeUpdate, afterCreate, beforeSave, afterDestroy, afterUpdate, afterBulkCreate, afterSave, afterBulkDestroy and afterBulkUpdate. See Hooks for more information about hook functions and their signatures. Each property can either be a function, or an array of functions.
   * @param {Object}                  [options.validate] An object of model wide validations. Validations have access to all model values via `this`. If the validator function takes an argument, it is assumed to be async, and is called with a callback that accepts an optional error.
   * @param {boolean}                 [options.treatAsMaterializedView=false] Whether to treat this model as a materialised view
   * @param {boolean}                 [options.treatAsView=false] Whether to treat this model as a view
   * @param {string}                  [options.viewDefinition] The query to be represented by a view
   * @param {string}                  [options.materializedViewDefinition] The query to be represented by a materialized view
   *
   *
   * @returns {Model} Newly defined model
   *
   * @example
   * sequelize.define(
   *    viewName,
   *    {
   *      id: {
   *        type: Sequelize.INTEGER,
   *        primaryKey: true,
   *      },
   *      name: Sequelize.STRING,
   *    },
   *    {
   *      freezeTableName: true,
   *      treatAsView: true,
   *      viewDefinition: 'SELECT id, name from items',
   *    }
   *  );
   *
   * sequelize.models.modelName // The model will now be available in models under the name given to define
   */
  public override define<
    M extends Model,
    // eslint-disable-next-line @typescript-eslint/ban-types
    TAttributes extends {} = Attributes<M>
  >(
    modelName: string,
    attributes: ModelAttributes<M, TAttributes>,
    options?: ModelOptionsWithViews<M>
  ): ModelCtor<M> {
    options = options || {};

    const ModelClone = class extends Model {};

    ModelClone.init(attributes, { ...options, modelName, sequelize: this });

    return ModelClone as unknown as ModelCtor<M>;
  }

  /**
   * Sync all defined models to the DB.
   *
   * @param {Object} [options={}] sync options
   * @param {boolean} [options.force=false] If force is true, each Model will run `DROP TABLE IF EXISTS`, before it tries to create its own table
   * @param {RegExp} [options.match] Match a regex against the database name before syncing, a safety check for cases where force: true is used in tests but not live code
   * @param {boolean|Function} [options.logging=console.log] A function that logs sql queries, or false for no logging
   * @param {string} [options.schema='public'] The schema that the tables should be created in. This can be overridden for each table in sequelize.define
   * @param {string} [options.searchPath=DEFAULT] An optional parameter to specify the schema search_path (Postgres only)
   * @param {boolean} [options.hooks=true] If hooks is true then beforeSync, afterSync, beforeBulkSync, afterBulkSync hooks will be called
   * @param {boolean|Object} [options.alter=false] Alters tables to fit models. Provide an object for additional configuration. Not recommended for production use. If not further configured deletes data in columns that were removed or had their type changed in the model.
   * @param {boolean} [options.alter.drop=true] Prevents any drop statements while altering a table when set to `false`
   *
   * @returns {Promise}
   */
  public override sync(options?: SyncOptions): any {
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
   * @memberof Sequelize
   */
  syncViews(): Promise<any[]> {
    const views = this.getViews();

    return Promise.all(views.map((view) => view.syncView()));
  }

  /**
   * Gets all the defined models which represent views
   *
   * @returns {typeof Model[]} An array containing all view models
   * @memberof Sequelize
   */
  getViews(): typeof Model[] {
    const models: typeof Model[] = [];
    this.modelManager.forEachModel(function (model) {
      if (isModelWithView(model)) models.push(model);
    });
    return models;
  }

  /**
   * Executes the create materialized view query for each of the definitions
   *
   * @returns {Promise<any[]>} The results of the create view queries
   * @memberof Sequelize
   */
  syncMaterializedViews(): Promise<any[]> {
    const materializedViews = this.getMaterializedViews();

    return Promise.all(
      materializedViews.map((view) => view.syncMaterializedView())
    );
  }

  /**
   * Gets all the defined models which represent materialized views
   *
   * @returns {typeof Model[]} An array containing all materialized view models
   * @memberof Sequelize
   */
  getMaterializedViews(): typeof Model[] {
    const models: typeof Model[] = [];
    this.modelManager.forEachModel(function (model) {
      if (isModelWithMaterializedView(model)) models.push(model);
    });
    return models;
  }
}

export default Sequelize;
