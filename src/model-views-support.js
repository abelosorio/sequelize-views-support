import { Model } from 'sequelize';

class ModelViewsSupport extends Model {
  /** @inheritdoc */
  static drop(options) {
    const method = this.options.treatAsView ? 'dropView' : 'dropTable';

    return this.QueryInterface[method](
      this.getTableName(options), options
    );
  }

  /** @inheritdoc */
  static sync(options) {
    if (this.options.treatAsView) return Promise.resolve();

    return super.sync(options);
  }

  /**
   * Sync view.
   */
  static syncView(options) {
    return this.QueryInterface.createView(
      this.getTableName(options),
      this.getViewDefinition(),
      options
    );
  }

  static getViewDefinition() {
    return this.options.viewDefinition;
  }
}

export default ModelViewsSupport;
