import { config } from 'dotenv';
import { OkeyMetaClient, createOkeyMetaProvider } from './okeymeta-client.js';

config();

export { OkeyMetaClient, createOkeyMetaProvider };
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    OkeyMetaClient,
    createOkeyMetaProvider
  };
} 