export * from "./toDisplayString";

export const extend = Object.assign;

export const EMPTY_OBJ = {};

export const isObject = (value) => {
  return value !== null && typeof value === "object";
};

export const isString = (value) => typeof value === "string";

export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue);
};

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str) => {
  return str ? "on" + capitalize(str) : "";
};
