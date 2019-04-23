/* eslint-disable react/no-array-index-key */

/*
Copyright © 2018 Roman Nep <neproman@gmail.com>

This file is part of kate-form-material-kit-react library.

Library kate-form-material-kit-react is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Library kate-form-material-kit-react is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Library kate-form-material-kit-react.
If not, see <https://www.gnu.org/licenses/>.
*/

import React, { Fragment } from 'react';
import { KateForm } from 'kate-form';

import CustomInput from 'material-kit-react-package/dist/components/CustomInput/CustomInput';
import Button from 'material-kit-react-package/dist/components/CustomButtons/Button';
import GridContainer from 'material-kit-react-package/dist/components/Grid/GridContainer';
import GridItem from 'material-kit-react-package/dist/components/Grid/GridItem';
import Quote from 'material-kit-react-package/dist/components/Typography/Quote';
import Card from 'material-kit-react-package/dist/components/Card/Card';
import CardHeader from 'material-kit-react-package/dist/components/Card/CardHeader';
import CardBody from 'material-kit-react-package/dist/components/Card/CardBody';

import NavPills from 'material-kit-react-package/dist/components/NavPills/NavPills';

import Paginations from 'material-kit-react-package/dist/components/Pagination/Pagination';

import LoadingImg from './img/loading.gif';

import { Select, DateInput, CustomSwitch,
  TablePlain, TableEditable, CustomCheckbox,
  Modal } from './components/index';

import { Elements as LayoutElements, components as layoutComponents } from './components/LayoutComponents';

const Elements = {
  LABEL: Symbol('labelConnector'),
  BUTTON: Symbol('buttonConnector'),

  INPUT: Symbol('inputConnector'),
  SELECT: Symbol('selectConnector'),
  DATE: Symbol('dateConnector'),
  SWITCH: Symbol('switchConnector'),
  CHECKBOX: Symbol('checkboxConnector'),

  TABLE: Symbol('tableConnector'),
  TABLE_EDITABLE: Symbol('tableEditableConnector'),

  GROUP: Symbol('groupConnector'),
  GRID: Symbol('gridConnector'),

  CARD_ACTIONS: Symbol('cardActionsConnector'),
  CARD: Symbol('cardConnector'),
  TABS: Symbol('tabsConnector'),

  MODAL: Symbol('modalConnector'),
  MODAL_ACTIONS: Symbol('modalActionsConnector'),

  PAGINATION: Symbol('paginationConnector'),
  LOADING: Symbol('loadingConnector'),
  IMAGE: Symbol('imageConnector'),
  ...LayoutElements,
};


const buttonConnector = ({ title, subTitle, setData, path, t, ...props }) => (
  <div>
    <Button color="primary" {...props}>
      {t(title)}
    </Button>
  </div>
);

const labelsTags = {
  p: ({ children, ...props }) => <p {...props}>{children}</p>,
  a: ({ children, ...props }) => <a {...props}>{children}</a>,
  h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
  h5: ({ children, ...props }) => <h5 {...props}>{children}</h5>,
  h6: ({ children, ...props }) => <h6 {...props}>{children}</h6>,
  quote: ({ children, ...props }) => <Quote {...props}>{children}</Quote>,
};

const labelConnector = ({ title, value, setData, path, tag, t, ...props }) => {
  const Tag = labelsTags[tag] || labelsTags.p;
  const tagProps = props;
  if (tag === 'quote') {
    tagProps.text = tagProps.text || title;
  }
  const text = title || value;
  return (
    <Tag {...tagProps}>
      {t(`${(text === undefined || text === null) ? '' : text}`)}
    </Tag>
  );
};

const inputConnector = (allProps) => {
  const {
    title, value, onChange, setData, path,
    dataPath, format, disabled, rows, rowsMax,
    style, inputType, accept, setRef, readOnly,
    autoFocus, t,
    ...props
  } = allProps;
  const change = (e) => {
    let val = e.target.value;
    if (format) {
      val = format(val);
    }
    setData('value', val);
    if (inputType === 'file') {
      if (e.target.files) {
        setData('files', e.target.files);
      } else {
        setData('files', [e.target.value]);
      }
    }
    if (onChange) onChange(val, allProps);
  };
  const setInputRef = ref => setData('ref', ref);
  const inputProps = { style, readOnly };
  if (inputType) {
    inputProps.type = inputType;
    inputProps.accept = accept;
  }
  return (
    <CustomInput
      labelText={t(title)}
      formControlProps={{
        fullWidth: true,
      }}
      inputProps={{
        value: value === undefined || value === null ? '' : value,
        onChange: change,
        multiline: rows && true,
        rows,
        rowsMax,
        disabled,
        inputProps,
        inputRef: setRef ? setInputRef : undefined,
        autoFocus,
      }}
      {...props}
    />
  );
};

const switchConnector = (allProps) => {
  const { onChange, setData, path, dataPath, title, t, ...props } = allProps;
  const change = (e) => {
    setData('value', e.target.checked);
    if (onChange) onChange(e.target.checked, allProps);
  };
  return (
    <CustomSwitch
      onChange={change}
      title={t(title)}
      {...props}
    />
  );
};

const checkboxConnector = (allProps) => {
  const { onChange, setData, path, dataPath, title, t, value, ...props } = allProps;
  const change = (e) => {
    setData('value', e.target.checked);
    if (onChange) onChange(e.target.checked, allProps);
  };
  return (
    <CustomCheckbox
      onChange={change}
      title={t(title)}
      value={value || false}
      {...props}
    />
  );
};

const dateConnector = (allProps) => {
  const { title, t, value, onChange, setData, path, dataPath, disabled, ...props } = allProps;
  const change = (val) => {
    setData('value', val);
    if (onChange) onChange(val, allProps);
  };
  return (
    <DateInput
      labelText={t(title)}
      formControlProps={{
        fullWidth: true,
      }}
      inputProps={{
        value: value || '',
        onChange: change,
        disabled,
      }}
      {...props}
    />
  );
};

const selectConnector = (allProps) => {
  const { title, t, value, onChange, options, setData, path,
    dataPath, number, ...props } = allProps;
  const change = (val) => {
    setData('value', val);
    if (onChange) onChange(val, allProps);
  };
  return (
    <Select
      labelText={t(title)}
      options={(options || []).map(item => ({ ...item, title: t(item.title) }))}
      formControlProps={{
        fullWidth: true,
      }}
      value={value === undefined ? {} : value}
      onChange={change}
      {...props}
    />
  );
};

const groupConnector = ({ path, div, ...rest }) => (div ? (
  <div {...rest}>
    <KateForm path={`${path}.elements`} />
  </div>
) : (
  <Fragment>
    <KateForm path={`${path}.elements`} />
  </Fragment>
));

const styleFlex = {
  display: 'flex',
  flexWrap: 'wrap',
};

const width100 = { width: '100%' };
const gridConnector = ({ path, elements, flex }) => (
  <GridContainer style={width100}>
    {
      elements.map((item, index) => (
        <GridItem md={item.cols || 3} key={item.id || index} style={flex ? styleFlex : undefined}>
          <KateForm path={`${path}.elements.${index}`} />
        </GridItem>
      ))
    }
  </GridContainer>
);


const cardConnector = (allProps) => {
  const { title, t, path, elements, titleTag } = allProps;
  const actionsIndex = elements.findIndex(item => item.type === Elements.CARD_ACTIONS);
  const Tag = labelsTags[titleTag] || labelsTags.h2;
  return (
    <Fragment>
      { title && (
        <Tag>{t(title)}</Tag>
      )}
      <Card>
        { actionsIndex > -1 && (
          <CardHeader color="primary">
            <KateForm path={`${path}.elements.${actionsIndex}`} />
          </CardHeader>
        )}
        <CardBody>
          {
            elements.map((item, index) => index !== actionsIndex && (
              <KateForm key={index} path={`${path}.elements.${index}`} />
            ))
          }
        </CardBody>

      </Card>
    </Fragment>
  );
};

const styleMarginLeft = {
  marginLeft: 10,
};

const cardActionsConnector = ({ path, elements }) => (
  <div style={styleFlex}>
    {
      elements.map((item, index) => (
        <div style={styleMarginLeft} key={index}>
          <KateForm path={`${path}.elements.${index}`} />
        </div>
      ))
    }
  </div>
);

const tableConnector = ({ columns, value, rowClick, cellStyle, t }) => (
  <TablePlain
    tableHeaderColor="primary"
    tableHead={columns}
    tableData={value || []}
    rowClick={rowClick}
    cellStyle={cellStyle}
    t={t}
  />
);

const tableEditableConnector = ({ columns, value, path, t,
  setData, rows, rowChange, getRow, onDelete, hideRowActions }) => (
    <TableEditable
      t={t}
      tableHeaderColor="primary"
      tableHead={columns}
      tableData={value}
      tableRows={rows}
      path={path}
      setData={setData}
      rowChange={rowChange}
      getRow={getRow}
      hideRowActions={hideRowActions}
      onDelete={onDelete}
    />
);


const tabsConnector = ({ path, elements, setData, active, t }) => {
  const setActiveTab = index => setData('active', index);
  return (
    <NavPills
      color="primary"
      activeTab={active || 0}
      setActiveTab={setActiveTab}
      tabs={elements.map((item, index) => ({
        tabButton: t(item.title),
        tabIcon: item.icon,
        tabContent: (
          <KateForm path={`${path}.elements.${index}.elements`} />
        ),
      }))}
    />
  );
};

const modalConnector = (allProps) => {
  const { open, handleClose, title, t, path, elements,
    fullWidth, maxWidth, noScroll, setData } = allProps;
  const actionsIndex = (elements || []).findIndex(item => item.type === Elements.MODAL_ACTIONS);
  const close = () => setData('open', false);
  return (
    <Modal
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth} // set false to adjust to content
      handleClose={handleClose || close}
      actions={actionsIndex > -1 && (
        <KateForm path={`${path}.elements.${actionsIndex}`} />
      )}
      title={t(title)}
      noScroll={noScroll}
      content={(
        <Fragment>
          {
            ((elements || []).map((item, index) => index !== actionsIndex && (
              <KateForm key={index} path={`${path}.elements.${index}`} />
            )))
          }
        </Fragment>
      )}
    />
  );
};

const modalActionsConnector = ({ path, elements }) => (
  <Fragment>
    {
      elements.map((item, index) => (
        <KateForm key={index} path={`${path}.elements.${index}`} />
      ))
    }
  </Fragment>
);

// const uploadConnector = (allProps) => {
//   const {
//     title, value, onChange, setData, path,
//     dataPath, format, disabled, rows, rowsMax, style, password,
//     t,
//     ...props
//   } = allProps;
//   const change = (e) => {
//     console.log(e.target.value);
//   };
//   const inputProps = { style };
//   inputProps.type = 'file';
//   return (
//     <CustomInput
//       labelText={t(title)}
//       formControlProps={{
//         fullWidth: true,
//       }}
//       inputProps={{
//         value: value || '',
//         onChange: change,
//         multiline: rows && true,
//         rows,
//         rowsMax,
//         disabled,
//         inputProps,
//       }}
//       {...props}
//     />
//   );
// };

const stylePaginationWrapper = {
  marginTop: 20,
};

const paginationConnector = ({ page = 1, pageChange = (a => a), length = 5, max, t }) => {
  const pages = [];
  let start = page - Math.floor(length / 2);
  if (max && max - length < start) {
    start = max - length;
  }
  pages.push({
    text: t('Prev'),
    onClick: () => pageChange(page - 1),
    disabled: page === 1,
  });
  if (start < 1) start = 1;
  for (let index = start; index < start + length && (!max || index <= max); index += 1) {
    pages.push({
      text: index,
      active: page === index,
      onClick: () => pageChange(index),
    });
  }
  pages.push({
    text: t('Next'),
    onClick: () => pageChange(page + 1),
    disabled: page === max,
  });
  return (
    <div style={stylePaginationWrapper}>
      <Paginations
        pages={pages}
      />
    </div>
  );
};

const loadingConnector = ({ t, ...props }) => (
  <img src={LoadingImg} alt={t(props.alt) || t('Loading...')} />
);

const imageConnector = ({ title, value, setData, path, tag, t, ...props }) => (
  <img alt={t(props.alt || props.title || 'image')} {...props} />
);


const components = {
  [Elements.BUTTON]: buttonConnector,
  [Elements.LABEL]: labelConnector,

  [Elements.INPUT]: inputConnector,
  [Elements.SELECT]: selectConnector,
  [Elements.DATE]: dateConnector,
  [Elements.SWITCH]: switchConnector,
  [Elements.CHECKBOX]: checkboxConnector,

  [Elements.TABLE]: tableConnector,
  [Elements.TABLE_EDITABLE]: tableEditableConnector,

  [Elements.GROUP]: groupConnector,
  [Elements.GRID]: gridConnector,

  [Elements.CARD]: cardConnector,
  [Elements.CARD_ACTIONS]: cardActionsConnector,
  [Elements.TABS]: tabsConnector,

  [Elements.MODAL]: modalConnector,
  [Elements.MODAL_ACTIONS]: modalActionsConnector,

  [Elements.PAGINATION]: paginationConnector,
  [Elements.LOADING]: loadingConnector,
  [Elements.IMAGE]: imageConnector,
  ...layoutComponents,
};

export {
  Elements,
  components,
};