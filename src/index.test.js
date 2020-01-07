import SequelizeViewsSupport from './index';

const sequelizeViewsSupport = new SequelizeViewsSupport(
  'mydb',
  'me',
  'password',
  {
    dialect: 'postgres',
    host: 'example.com',
    port: 5444,
    pool: 8,
  }
);

describe('SequelizeViewsSupport', () => {
  it('is an instance of SequelizeViewsSupport', () => {
    expect(sequelizeViewsSupport).toBeInstanceOf(SequelizeViewsSupport);
  });
});
