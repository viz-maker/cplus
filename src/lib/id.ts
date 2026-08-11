/** Short prefixed id for records created in the browser. */
export const uid = (prefix: string): string => prefix + Math.random().toString(36).slice(2, 8);
