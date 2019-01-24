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
  async get({ data }) {
    const item = await this[model].findByPk(data.uuid, this[modelGetOptions]);
    if (!item) {
      return { error: noItemErr };
    }
    return { response: item.toJSON() };
  }
  async put({ data, ctx }) {
    let item;
    if (data.uuid) {
      item = await this[model].findByPk(data.uuid, this[modelGetOptions]);
      if (!item) {
        return { error: noItemErr };
      }
      if (ctx) { // can be called from another entity without ctx
        ctx.state.savedEntity = item.toJSON();
      }
      await item.update(data.body, { fields: this[modelUpdateFields] });
    } else {
      item = await this[model].create(data.body);
    }

    if (this.tables) {
      this.tables.forEach(async (table) => {
        if (data.uuid) {
          await table[model].destroy({ where: { [`${this[model].Name}Uuid`]: item.uuid } });
        }
        const rows = await table[model].bulkCreate(data.body[table.name] || []);
        await item[`set${capitalize(table.name)}`](rows);
      });
    }
    return { response: item.toJSON() };
  }
  async delete({ data }) {
    const item = await this[model].findByPk(data.uuid, this[modelGetOptions]);
    if (!item) {
      return { error: noItemErr };
    }
    await item.destroy();
    return { response: { ok: true } };
  }
  async query({ data = {} } = { data: {} }) {
    if (this.app.paginationLimit) {
      const { page = 1 } = data || {};
      data.offset = (page - 1) * this.app.paginationLimit;
      data.limit = this.app.paginationLimit;
    }
    if (data && data.where) {
      data.where = replaceOps(data.where, this[model].Sequelize);
    }
    const result = await this[model].findAll({ ...this[modelGetOptions], ...data });
    return { response: result.map(item => item.toJSON()) };
  }
}
