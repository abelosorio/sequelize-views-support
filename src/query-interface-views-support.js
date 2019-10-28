export default function addViewsSupportToQueryInterface(queryInterface) {
  queryInterface.dropView = function(viewName, options = {}) {
    const sql = `DROP MATERIALIZED VIEW IF EXISTS ${viewName}`;
    return this.sequelize.query(sql);
  };

  queryInterface.createView = function(viewName, viewDefinition, options = {}) {
    return this.sequelize.query(viewDefinition);
  };

  return queryInterface;
}
