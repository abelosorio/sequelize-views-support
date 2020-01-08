/* eslint-disable @typescript-eslint/no-var-requires */
const Sequelize = require('./index');

const conf = {
  dialect: 'postgres',
  host: 'example.com',
  port: 5444,
};

const sequelizeViewsSupport = new Sequelize('mydb', 'me', 'password', conf);

describe('SequelizeViewsSupport', () => {
  it('is an instance of SequelizeViewsSupport', () => {
    expect(sequelizeViewsSupport).toBeInstanceOf(Sequelize.Sequelize);
  });
  it('is gets exported at module level', () => {
    expect(new Sequelize('mydb', 'me', 'password', conf)).toBeInstanceOf(
      Sequelize
    );
  });
  it('is gets exported as default', () => {
    expect(
      new Sequelize.default('mydb', 'me', 'password', conf)
    ).toBeInstanceOf(Sequelize);
  });
  it('is gets exported as Sequelize', () => {
    expect(
      new Sequelize.Sequelize('mydb', 'me', 'password', conf)
    ).toBeInstanceOf(Sequelize);
  });
});
