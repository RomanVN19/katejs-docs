
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

export const capitalize = string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

const noItemErr = { message : 'Can\'t find entity item', status: 404 };


export default class Entity {
  constructor({ logger }) {
    this.logger = logger;
  }
  async get({ data, ctx }) {
    const item = await this[model].findById(data.uuid, this[modelGetOptions]);
    if (!item) {
      return { error: noItemErr };
    }
    return { response: item };
  }
  async put({ data, ctx }) {
    let item;
    if (data.uuid) {
      item = await this[model].findById(data.uuid);
      if (!item) {
        return { error: noItemErr };
      }
      this.logger.debug('item before changes', item.get());
      await item.update(data.body);
    } else {
      item = await this[model].create(data.body);
    }

    if (this.tables) {
      this.tables.forEach(async (table) => {
        if (data.uuid) {
          await table[model].destroy({ where: { [`${this.name}Uuid`]: item.uuid } });
        }
        const rows = await table[model].bulkCreate(data.body[table.name] || []);
        item[`set${capitalize(table.name)}`](rows);
      });
    }
    return { response: item.get() };
  }
  async delete({ data, ctx }) {
    const item = await this[model].findById(data.uuid, this[modelGetOptions]);
    if (!item) {
      return { error: noItemErr };
    }
    await item.destroy();
    return { response: { ok: true } };
  }
  async query({ data, ctx }) {
    return { response: await this[model].findAll({ ...this[modelGetOptions] }) };
  }
}
