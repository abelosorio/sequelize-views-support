export * from './SequelizeWithViews';
import Sequelize from './SequelizeWithViews';
import { Model } from './ModelWithViews';
export default Sequelize;
export { Model };

module.exports = Sequelize;
module.exports.Sequelize = Sequelize;
module.exports.Model = Model;
module.exports.default = Sequelize;
