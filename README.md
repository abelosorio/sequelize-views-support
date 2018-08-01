# Add Views support to Sequelize

[![NPM version](https://img.shields.io/npm/v/sequelize-views-support.svg)](https://www.npmjs.com/package/sequelize-views-support)

This package adds support to **Views** in **Sequelize**.

**NOTE:** Currently it's only supported in **PostgreSQL**.

## Motivation

I've been using PostgreSQL and other RDBMS for a long time, and I can't stress enough about how useful is the View mechanism. For that reason (and others that you'd get bored reading them) an ORM without Views support is incomplete.

This package needs a lot of further work, tests, discussion... but for the moment it works as expected and fulfills its purpose. Feel free of discuss changes, ideas, or whatever you think. Thanks.

**Read**

- https://stackoverflow.com/questions/48407329/cant-able-to-create-views-in-mysql-using-sequelize-orm
- https://github.com/sequelize/sequelize/issues/7197
- https://github.com/sequelize/sequelize/issues/3078

## Install

```
npm install --save sequelize-views-support
```

## How to use

First, when creating the `sequelize` instance, you have to do it using this package and not the Sequelize's:

`sequelize.js`:
```javascript
const Sequelize = require('sequelize-views-support');

const sequelize = new Sequelize(
  // Use the same construction call you've been using so far
);

module.exports = sequelize;
```

Then, when creating your view models you have to set two more options (let's call this view `Foo`):

`models/foo.js`:
```javascript
module.exports = (sequelize, DataTypes) => {
  const Foo = sequelize.define('foo', {
    field1: DataTypes.DATE,
    field2: DataTypes.STRING,
    // etc...
  }, {
    treatAsView: true,
    viewDefinition: `
      CREATE VIEW "foo" AS
        -- Put here your view's definition
        -- DO NOT USE "CREATE OR REPLACE", JUST "CREATE"
        -- You can create complex Views using any of the PostgreSQL DSL's supported features
    `
  });

  return Foo;
};
```

That's it. Now you can sync your models including views. Take into account that views will be created after syncing all your models. This is because your views may depend on models.

## Migrations

The next step is to maintain your views. You're going to need to write migrations to change your views' definition, as well as changing it in the `viewDefinition` option.

*You can ignore the `viewDefinition` option, but you won't be able to sync that view*.

## Mantainers

  * **[Abel M. Osorio](https://github.com/abelosorio)**