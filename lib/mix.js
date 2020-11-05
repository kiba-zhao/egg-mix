'use strict';

const is = require('is-type-of');

const DOT = '.';
const CACHE = Symbol('EGG_MIX_INJECT_CACHE');

module.exports = app => {
  const config = app.config.mix;
  for (const property in config) { init(app, config[property].name || property, config[property]); }
};

function init(app, property, config) {
  const inject = is.string(config.inject) ? app[config.inject] : config.inject;
  if (!is.class(inject) && inject !== app.context) {
    inject[property] = getProperty(inject, property, config);
    return;
  }
  Object.defineProperty(inject, property, {
    get() {
      return getProperty(this, property, config);
    },
  });
}

function getProperty(target, property, config) {
  if (!target[CACHE]) { target[CACHE] = new Map(); }
  const loader = target[CACHE];
  let instance = loader.get(property);
  if (!instance) {
    instance = getMixProxy(target, config);
    loader.set(property, instance);
  }
  return instance;
}

function getProxyProperty(ctx, propertyKey, mappings) {
  let property;
  for (const mapping of mappings) {
    property = ctx;
    const keys = mapping.split(DOT);
    for (const key of keys) {
      property = property[key];
      if (property === undefined) { break; }
    }

    if (property !== undefined && property[propertyKey] !== undefined) { break; }
  }

  return property && property[propertyKey];
}

function getMixProxy(ctx, config) {
  const mappings = config.mappings || {};
  return new Proxy({}, {
    get(target, property) {
      if (target.hasOwnProperty(property)) { return target[property]; }

      const res = getProxyProperty(ctx, property, mappings[property] || config.default);
      if (config.cache && res !== undefined) { target[property] = res; }

      return res;
    },
  });
}
