/** @param {string} id */
export const toViewId = (id) => id.replace(/\.(?!([^.]+)$)/g, "/");
