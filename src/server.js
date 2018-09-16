
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

import Entity from './Entity';

export const makeEntityFromStructure = structure =>
  class EntityFromStructure extends Entity {
    constructor(params) {
      super(params);
      Object.assign(this, structure);
    }
  };

export const makeEntitiesFromStructures = (structures) => {
  const entities = {};
  Object.keys(structures).forEach((name) => {
    entities[name] = makeEntityFromStructure(structures[name]);
  });
  return entities;
};
