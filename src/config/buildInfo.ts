/**
 * Build Information
 * The __BUILD_TIMESTAMP__ constant is injected by webpack during build
 */

export const BUILD_INFO = {
  timestamp: __BUILD_TIMESTAMP__ || new Date().toISOString(),
  version: '1.0.0',
};
