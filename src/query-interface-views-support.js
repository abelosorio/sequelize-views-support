export default function addViewsSupportToQueryInterface(queryInterface) {
  queryInterface.dropView = function(viewName, options = {}) {
    const sql = `
      DROP VIEW IF EXISTS "${viewName}"${options.cascade ? ' CASCADE' : ''}
    `;

    return this.sequelize.query(sql);
  };

  queryInterface.createView = function(viewName, viewDefinition, options = {}) {
    return this.sequelize.query(viewDefinition);
  };

  return queryInterface;
}
