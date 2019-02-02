/* eslint-disable no-param-reassign */

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

export const model = Symbol('model');
export const modelGetOptions = Symbol('modelGetOptions');
export const modelUpdateFields = Symbol('modelUpdateFields');
export const tables = Symbol('tables');

export const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

const noItemErr = { message: 'Can\'t find entity item', status: 404 };

const replaceOps = (obj, S) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    let newKey = key;
    if (key[0] === '$') {
      newKey = S.Op[key.substr(1)];
    }
    if (typeof obj[key] === 'object' && obj[key]) {
      result[newKey] = replaceOps(obj[key], S);
    } else {
      result[newKey] = obj[key];
    }
  });
  return result;
};

export default class Entity {
  constructor(params) {
    Object.assign(this, params);
  }
  transaction() {
    return this[model].db.sequelize.transaction();
  }
  async get({ data, transaction }) {
    const item = await this[model].findByPk(data.uuid, { ...this[modelGetOptions], transaction });
    if (!item) {
      return { error: noItemErr };
    }
    return { response: item.toJSON() };
  }
  async put({ data, ctx, transaction: t }) {
    let transaction;
    try {
      transaction = t || await this[model].db.sequelize.transaction();
      let item;
      if (data.uuid) {
        item = await this[model].findByPk(data.uuid, { ...this[modelGetOptions], transaction });
        if (!item) {
          return { error: noItemErr };
        }
        if (ctx) { // can be called from another entity without ctx
          ctx.state.savedEntity = item.toJSON();
        }
        await item.update(data.body, { fields: this[modelUpdateFields], transaction });
      } else {
        item = await this[model].create(data.body, { transaction });
      }

      if (this.tables) {
        await Promise.all(this.tables.map(async (table) => {
          if (data.uuid) {
            await table[model].destroy({
              where: { [`${this[model].Name}Uuid`]: item.uuid },
              transaction,
            });
          }
          const rows = await table[model].bulkCreate(data.body[table.name] || [], { transaction });
          await item[`set${capitalize(table.name)}`](rows, { transaction });
        }));
      }
      if (!t) {
        await transaction.commit();
      }
      return { response: item.toJSON() };
    } catch (error) {
      this.logger.error(error);
      if (transaction) {
        await transaction.rollback();
      }
      return { error };
    }
  }
  async delete({ data, transaction: t }) {
    let transaction;
    try {
      transaction = t || await this[model].db.sequelize.transaction();
      const item = await this[model].findByPk(data.uuid, { ...this[modelGetOptions], transaction });
      if (!item) {
        return { error: noItemErr };
      }
      await item.destroy({ transaction });
      if (!t) {
        await transaction.commit();
      }
      return { response: { ok: true } };
    } catch (error) {
      this.logger.error(error);
      if (transaction) {
        await transaction.rollback();
      }
      return { error };
    }
  }
  async query({ data = {}, transaction } = { data: {} }) {
    if (this.app.paginationLimit) {
      const { page = 1 } = data || {};
      data.offset = (page - 1) * this.app.paginationLimit;
      data.limit = this.app.paginationLimit;
    }
    if (data && data.where) {
      data.where = replaceOps(data.where, this[model].db.Sequelize);
    }
    const result = await this[model].findAll({ ...this[modelGetOptions], ...data, transaction });
    return { response: result.map(item => item.toJSON()) };
  }
}
