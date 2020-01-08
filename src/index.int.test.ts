require('pg').defaults.parseInt8 = true;
import Pool from 'pg-pool';
import Sequelize from './index';
import { Client, PoolClient } from 'pg';
jest.setTimeout(20e3);

const dbname = `views_${Date.now()}`;

const c = {
  drone: {
    user: 'integration',
    readHost: 'database-drone',
    host: 'database-drone',
    password: '',
    port: 5432,
    dbname,
    createViews: true,
    testEnv: true,
  },
  local: {
    user: 'postgres',
    readHost: '127.0.0.1',
    host: '127.0.0.1',
    password: 'changeme',
    port: 5432,
    dbname,
    createViews: true,
    testEnv: true,
  },
};

const config = process.env.CI ? c.drone : c.local;
const { user, host, password, port } = config;

let pool: Pool<Client>, client: Client & PoolClient, sequelize;

const testItems = [
  {
    name: 'foo',
  },
  {
    name: 'bar',
  },
  {
    name: 'baz',
  },
];

describe('SequelizeWithViews', () => {
  beforeEach(async () => {
    pool = new Pool({
      user,
      host,
      database: 'postgres',
      password,
      port,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 60000,
    });
    client = await pool.connect();
    pool.on('error', err => console.warn('pool', err));
    client.on('error', err => console.warn('client', err));
    await client.query(`CREATE DATABASE ${dbname}`);
    sequelize = new Sequelize(dbname, user, password, {
      dialect: 'postgres',
      host,
      port,
      define: {
        timestamps: false,
      },
    });
    await sequelize.authenticate();
  });
  afterEach(async () => {
    if (sequelize) await sequelize.close();
    if (client) {
      await client.query(`REVOKE CONNECT ON DATABASE ${dbname} FROM public;`);
      await client.query(
        `SELECT pg_terminate_backend(pg_stat_activity.pid)
                  FROM pg_stat_activity
                  WHERE pg_stat_activity.datname = '${dbname}';`
      );
      await client.query(`DROP DATABASE ${dbname}`);
    }
    if (client) await client.release();
    if (pool) await pool.end();
  });
  describe('view support', () => {
    it('creates views', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_view';
      sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsView: true,
          viewDefinition: `CREATE OR REPLACE VIEW "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      const [views] = await sequelize.query(`
      select table_schema as schema_name,
        table_name as view_name
      from information_schema.views
      where table_schema not in ('information_schema', 'pg_catalog')`);
      expect(views[0]['view_name']).toEqual(viewName);
    });
    it('reads from views', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_view';
      const itemsView = sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsView: true,
          viewDefinition: `CREATE OR REPLACE VIEW "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      const itemsFromView = await itemsView.findAll();
      testItems.forEach((it, ix) => {
        expect(itemsFromView[ix].name).toEqual(it.name);
      });
    });
    it('updates after source table update', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_view';
      const itemsView = sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsView: true,
          viewDefinition: `CREATE OR REPLACE VIEW "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      await item.create({
        name: 'bill',
      });
      const testItemFromView = await itemsView.findOne({
        where: { name: 'bill' },
      });
      expect(testItemFromView.name).toEqual('bill');
    });
  });
  describe('materialized view support', () => {
    it('creates materialized views', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_mat_view';
      sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsMaterializedView: true,
          materializedViewDefinition: `CREATE MATERIALIZED VIEW IF NOT EXISTS "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      const [views] = await sequelize.query(
        "SELECT oid::regclass::text FROM pg_class WHERE relkind = 'm';"
      );
      console.log({ views });
      expect(views[0].oid).toEqual(viewName);
    });
    it('reads from materialized views', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_mat_view';
      const itemsView = sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsMaterializedView: true,
          materializedViewDefinition: `CREATE MATERIALIZED VIEW IF NOT EXISTS "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      const itemsFromView = await itemsView.findAll();
      testItems.forEach((it, ix) => {
        expect(itemsFromView[ix].name).toEqual(it.name);
      });
    });
    it('refreshes materialized views', async () => {
      const item = sequelize.define('item', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING,
      });
      await sequelize.sync({ force: true });
      await Promise.all(testItems.map(i => item.create(i)));
      const viewName = 'items_mat_view';
      const itemsView = sequelize.define(
        viewName,
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
          },
          name: Sequelize.STRING,
        },
        {
          freezeTableName: true,
          treatAsMaterializedView: true,
          materializedViewDefinition: `CREATE MATERIALIZED VIEW IF NOT EXISTS "${viewName}" AS SELECT id, name from items`,
        }
      );
      await sequelize.sync();
      let itemsFromView = await itemsView.findAll();
      expect(itemsFromView).toHaveLength(3);
      await item.create({
        name: 'bill',
      });
      await itemsView.refreshMaterializedView();
      itemsFromView = await itemsView.findAll();
      expect(itemsFromView).toHaveLength(4);
      const testItemFromView = await itemsView.findOne({
        where: { name: 'bill' },
      });
      expect(testItemFromView.name).toEqual('bill');
    });
  });
});
