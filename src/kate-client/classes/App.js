const history = Symbol('history');
const appPath = Symbol('path');
export const currentLayout = Symbol('currentLayout');
export const currentForms = Symbol('currentForms');
const terms = Symbol('terms');

export default class App {
  constructor(params) {
    this[history] = params.history;
    this[appPath] = params.path;
    this.translations = params.translations;
    this[terms] = this.translations && this.translations[this.translations.languages[0]];
    this[currentForms] = {};
  }
  getPath(layoutName, formsToOpen = {}, params = {}) {
    const path = `${this[appPath] === '/' ? '' : this[appPath]}/${layoutName}`;
    const layout = this.layouts[layoutName];
    const forms = { ...this[currentForms], ...formsToOpen };
    let paths;
    if (layout.areas) {
      const areas = Object.keys(layout.areas).sort();
      paths = areas.map(areaName => `/${forms[areaName] || 'none'}`).join('');
    } else {
      paths = `/${forms.content || 'none'}`;
    }
    const paramsString = params && Object.keys(params).map(paramName => `${paramName}=${params[paramName]}`).join('&');
    this[currentLayout] = layoutName;
    this[currentForms] = forms;
    return `${path}${paths}${paramsString ? `?${paramsString}` : ''}`;
  }
  setLayout(layoutName, formsToOpen = {}, params) {
    this[history].push(this.getPath(layoutName, formsToOpen, params));
  }
  getLayout() {
    return { layout: this[currentLayout], forms: this[currentForms] };
  }
  open(form, params = {}, area) {
    if (this[currentLayout]) {
      const areas = this.layouts[this[currentLayout]].areas || {};
      const areaName = area ||
        Object.keys(areas).find(a => areas[a].default) ||
        'content';
      this.setLayout(this[currentLayout], { [areaName]: form }, params);
    }
  }
  t = (strings, ...keys) => {
    if (!strings) return '';
    if (typeof strings === 'string') {
      if (!this[terms]) return strings;
      return this[terms][strings] || strings;
    }
    // using as tag
    const result = [];
    keys.forEach((key, index) => {
      result.push((this[terms] && this[terms][strings[index]]) || strings[index]);
      result.push(key);
    });
    result.push((this[terms] && this[terms][strings[strings.length - 1]])
      || strings[strings.length - 1]);
    return result.join('');
  }
  /* global FormData */
  // eslint-disable-next-line class-methods-use-this
  async request(url, params = {}) {
    const headers = { ...params.headers };
    if (!(params.body instanceof FormData)) {
      headers['content-type'] = 'application/json';
    }
    return fetch(url, {
      ...params,
      headers,
    })
      .then((response) => {
        if (response.headers.get('content-type').indexOf('application/octet-stream') > -1) {
          return response
            .blob()
            .then(data => ({ response, data }))
            .catch(() => ({ response }));
        }
        if (response.headers.get('content-type').indexOf('application/json') === -1) {
          return response
            .text()
            .then(data => ({ response, data }))
            .catch(() => ({ response }));
        }
        return response
          .json()
          .then(data => ({ response, data }))
          .catch(() => ({ response }));
      })
      .then(({ response, data }) => {
        if (response.ok) {
          return ({ response: data });
        }
        return ({ error: data, errorResponse: response });
      })
      .catch(error => ({ error }));
  }
}
