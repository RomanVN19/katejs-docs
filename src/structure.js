import Fields from 'katejs/lib/fields';

const Task = {
  fields: [
    {
      name: 'title',
      type: Fields.STRING,
    },
  ],
  tables: [
    {
      name: 'users',
      fields: [
        {
          name: 'title',
          type: Fields.STRING,
        },
      ],
    },
  ],
};

export const title = 'Katejs testing';
export const packageName = 'katejs-testing';
export const structures = {
  Task,
};
