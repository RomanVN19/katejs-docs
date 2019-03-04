
/*
Copyright © 2018 Roman Nep <neproman@gmail.com>

This file is part of KateJS.

KateJS is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

KateJS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with KateJS.  If not, see <https://www.gnu.org/licenses/>.
*/

import Sequelize from 'sequelize';
import Fields from './fields';
import { model, modelGetOptions, modelUpdateFields, capitalize, tables } from './Entity';

export const SequelizeFields = {
  [Fields.STRING]: Sequelize.STRING,
  [Fields.INTEGER]: Sequelize.INTEGER,
  [Fields.REFERENCE]: Sequelize.VIRTUAL,
  [Fields.DECIMAL]: Sequelize.DECIMAL,
  [Fields.BOOLEAN]: Sequelize.BOOLEAN,
  [Fields.TEXT]: Sequelize.TEXT,
  [Fields.DATE]: Sequelize.DATE,
  [Fields.DATEONLY]: Sequelize.DATEONLY,
};

const getModelParams = (entity, structure) => {
  const modelParams = {
    uuid: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
  };
  const modelOptions = {
    getterMethods: {
    },
    setterMethods: {
    },
  };

  // eslint-disable-next-line no-param-reassign
  entity[modelGetOptions] = { include: [], attributes: ['uuid', 'createdAt', 'updatedAt'] };
  // eslint-disable-next-line no-param-reassign
  entity[modelUpdateFields] = [];

  structure.fields.forEach((field) => {
    switch (field.type) {
      case Fields.REFERENCE:
        entity[modelUpdateFields].push(`${field.name}Uuid`);
        // need include ref field, because with LIMIT condition
        // reference join fails without it
        entity[modelGetOptions].attributes.push(`${field.name}Uuid`);
        modelOptions.setterMethods[field.name] = function setter(value) {
          // if (value && !this.getDataValue(field.name)) {
          if (value) {
            this.setDataValue(`${field.name}Uuid`, value.uuid);
          } else {
            this.setDataValue(`${field.name}Uuid`, null);
          }
        };
        break;
      case Fields.DECIMAL:
        entity[modelUpdateFields].push(field.name);
        entity[modelGetOptions].attributes.push(field.name);
        modelParams[field.name] = {
          type: SequelizeFields[field.type](field.length || 15, field.precision || 2),
        };
        break;
      case Fields.BOOLEAN:
        entity[modelUpdateFields].push(field.name);
        entity[modelGetOptions].attributes.push(field.name);
        modelParams[field.name] = {
          type: SequelizeFields[field.type],
          defaultValue: false,
        };
        break;
      default:
        entity[modelUpdateFields].push(field.name);
        entity[modelGetOptions].attributes.push(field.name);
        modelParams[field.name] = {
          type: SequelizeFields[field.type],
        };
    }
  });
  return { params: modelParams, options: modelOptions };
};

const makeAssociations = (entities, logger) => {
  Object.values(entities).forEach((entity) => {
    if (entity.structure && entity.structure.fields) {
      entity.structure.fields.forEach((field) => {
        if (field.type === Fields.REFERENCE) {
          entity[model].belongsTo(entities[field.entity][model], { as: field.name });
          entity[modelGetOptions].include.push({ model: entities[field.entity][model], as: field.name, attributes: field.attributes || ['title', 'uuid'] });
          if (logger) logger.info('Defined association:', entity[model].Name, field.name, ' - ', entities[field.entity][model].Name);
        }
      });
    }
    if (entity.structure && entity.structure.tables) {
      entity.structure.tables.forEach((tableStructure) => {
        const table = entity[tables][tableStructure.name];
        tableStructure.fields.forEach((field) => {
          if (field.type === Fields.REFERENCE) {
            table[model].belongsTo(entities[field.entity][model], { as: field.name });
            table[modelGetOptions].include.push({ model: entities[field.entity][model], as: field.name, attributes: field.attributes || ['title', 'uuid'] });
            if (logger) logger.info('Defined association:', table[model].Name, field.name, ' - ', entities[field.entity][model].Name);
          }
        });
        entity[model].hasMany(table[model], { as: tableStructure.name });
        if (logger) logger.info('Defined association:', entity[model].Name, tableStructure.name, ' ->>', table[model].Name);
        entity[modelGetOptions].include.push({
          model: table[model],
          as: tableStructure.name,
          include: table[modelGetOptions].include,
          attributes: table[modelGetOptions].attributes,
        });
      });
    }
  });
};

export default class Database {
  constructor({ databaseParams, entities, logger }) {
    this.logger = logger;
    this.sequelize = new Sequelize({
      ...databaseParams,
      dialect: 'mysql',
      operatorsAliases: false,
      dialectOptions: { decimalNumbers: true },
    });
    this.Sequelize = Sequelize;
    this.entities = entities;
    this.createModels();
  }
  async init() {
    try {
      await this.sequelize.authenticate();
      this.logger.info('...connected to database');
    } catch (e) {
      this.logger.error('...can not connect to database!', e);
      process.exit(e);
    }
  }
  createModels() {
    Object.keys(this.entities).forEach((entityName) => {
      const entity = this.entities[entityName];
      if (entity.structure && entity.structure.fields) {
        const { params, options } = getModelParams(entity, entity.structure);
        entity[model] = this.sequelize.define(entityName.toLowerCase(), params, options);
        entity[model].db = this;
        entity[model].Name = entityName;
        this.logger.info('Defined model:', entityName.toLowerCase());
      }
      if (entity.structure && entity.structure.tables) {
        entity[tables] = {};
        entity.structure.tables.forEach((tableStructure) => {
          const table = {};
          entity[tables][tableStructure.name] = table;
          const { params: tableParams, options: tableOptions }
            = getModelParams(table, tableStructure);
          // eslint-disable-next-line no-param-reassign
          table[model] = this.sequelize.define(`${entityName.toLowerCase()}${capitalize(tableStructure.name)}`, tableParams, tableOptions);
          table[model].Name = `${entityName.toLowerCase()}${capitalize(tableStructure.name)}`;
          this.logger.info('Defined model:', table[model].Name);
        });
      }
    });
    makeAssociations(this.entities, this.logger);
  }
  async sync() {
    await this.sequelize.sync({ alter: true });
  }
}
