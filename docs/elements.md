# Элементы формы

## Общие атрибуты
````
{
  id: 'someId',
  hidden: false || true,
  elements : []
}
````
- `id` - идентификатор для доступа к элементу через поле `content` (пример: `this.content.someId.value = 123`)
- `hidden` - при установке атрибута в значение `true` элемент не отображается
- `elements` - для групп и прочих элементов в этом поле записываются дочерние элементы.

## INPUT - Поле ввода
````
{
  type: Elements.INPUT,
  title: 'Input placeholder',
  success: false || true,
  error: false || true,
  value: 'some value',
  format: (val) => (val),
  onChange: (value, allProps) => (),
  password: false || true,
}
````
- `success` - Подчеркивает зеленым и отображает "галочку" в конце
- `error` - Подчеркивает красным и отображает "крестик" в конце
- `onChange` - Срабатывает при каждом изменении, `value` - текущее значение, `allProps` - все атрибуты элемента формы.
- `format` - Вызывается при каждом изменении и записывает в значение результат
- `password` - режим ввода пароля

## SWITCH - переключатель
````
{
  id: '0',
  type: Elements.SWITCH,
  title: 'Label',
  value: false || true,
},
````

## CHECKBOX - флажок
````
{
  id: '0',
  type: Elements.CHECKBOX,
  title: 'Label',
  value: false || true,
},
````

## BUTTON - Кнопка
````
{
  id: '0',
  type: Elements.BUTTON,
  title: 'OK',
  disabled: false || true,
  fullWidth: false || true
},
````
`fullWidth` - при установке в `true` установит размер кнопки по полной ширине.

## LABEL - Текст
````
{
  type: Elements.LABEL,
  title: 'Label content',
  tag: 'p'(default) || 'quote' || 'h1' || 'h2' || ... || 'h6',
  style: { textAlign: 'center' },
}
````
- `tag` - вариант рендера.
- `style` - возможно установить CSS стиль текстовой метки (в формате Inline CSS).

## GRID - "Сетка"
````
{
  id: '0',
  type: Elements.GRID,
  elements: [{ id: '1', cols: 4 }]
},
````
Элемент используется для визуального расположения других элементов по сетке из 12 колонок.
Каждый дочерний элемент располагается по умолчанию в 3 колонки (4 элемента в строке).
У дочернего элемента можно указать атрибут `cols`
для явного указания количества колонок которые он должен занять.
Для позиционирования нескольких элементов в колонке можно изспользовать в качестве
вложенного - элемент Группу (GROUP).

## GROUP - группа
````
{
  id: '0',
  type: Elements.GROUP,
  elements: []
},
````
Элемент используется для визуальной группировки дочерних элементов.
Дочерние элементы группируются по вертикали.
Ипользуется в композиции с `Сеткой` (GRID)
