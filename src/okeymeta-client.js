import axios from 'axios';

const DEFAULT_MODEL_ENDPOINTS = {
  'okeyai2.0-basic': 'https://api.okeymeta.com.ng/api/ssailm/model/okeyai2.0-basic/okeyai',
  'okeyai2.0-mega': 'https://api.okeymeta.com.ng/api/ssailm/model/okeyai2.0-mega/okeyai',
  'okeyai3.0-vanguard': 'https://api.okeymeta.com.ng/api/ssailm/model/okeyai3.0-vanguard/okeyai',
  'okeyai4.0-DeepCognition': 'https://api.okeymeta.com.ng/api/ssailm/model/okeyai4.0-DeepCognition/okeyai',
};

const MODEL_FEATURES = {
  'okeyai2.0-basic': { text: true, image: false, params: ['input', 'ask'] },
  'okeyai2.0-mega': { text: true, image: true, params: ['input', 'ask', 'imgUrl'] },
  'okeyai3.0-vanguard': { text: true, image: true, params: ['input', 'imgUrl'] },
  'okeyai4.0-DeepCognition': { text: true, image: true, params: ['input', 'imgUrl', 'deepCognition', 'reasoningFormat'] },
};

function validateParams(model, params) {
  const features = MODEL_FEATURES[model];
  if (!features) throw new Error(`Unknown model: ${model}`);
  for (const key of Object.keys(params)) {
    if (!features.params.includes(key) && key !== 'contextKey' && key !== 'APiKey') {
      throw new Error(`Parameter '${key}' is not supported by model '${model}'.`);
    }
  }
  if (model === 'okeyai4.0-DeepCognition' && params.deepCognition === 'on') {
    if (!params.reasoningFormat) {
      throw new Error('reasoningFormat is required when deepCognition is on.');
    }
    if (!['raw', 'parsed', 'hidden'].includes(params.reasoningFormat)) {
      throw new Error(`Invalid reasoningFormat: ${params.reasoningFormat}`);
    }
  }
}

class Conversation {
  constructor({ client, model, contextKey }) {
    this.client = client;
    this.model = model;
    this.contextKey = contextKey;
  }

  setContextKey(contextKey) {
    this.contextKey = contextKey;
  }

  async send(input, params = {}) {
    const response = await this.client.textCompletion({
      model: this.model,
      input,
      contextKey: this.contextKey,
      ...params,
    });
    this.contextKey = response.API_KEY || response.APiKey || this.contextKey;
    return response;
  }
}

export function createOkeyMetaProvider({
  auth_token,
  headers = {},
  endpoints = {},
} = {}) {
  return new OkeyMetaClient({ auth_token, headers, endpoints });
}

export class OkeyMetaClient {
  constructor({ auth_token, headers = {}, endpoints = {} } = {}) {
    this.auth_token = auth_token || process.env.OKEYMETA_AUTH_TOKEN;
    if (!this.auth_token) {
      throw new Error('OkeyMeta authorization token is required. Set OKEYMETA_AUTH_TOKEN env variable or pass auth_token.');
    }
    this.headers = headers;
    this.endpoints = { ...DEFAULT_MODEL_ENDPOINTS, ...endpoints };
  }

  async textCompletion({ model = 'okeyai3.0-vanguard', input, contextKey, APiKey, ...params }) {
    if (!input) throw new Error('Input prompt is required.');
    validateParams(model, { input, contextKey, APiKey, ...params });
    const url = this.endpoints[model];
    if (!url) throw new Error(`Unknown model: ${model}`);
    const headers = { Authorization: this.auth_token, ...this.headers };
    const query = { input, ...params };
    if (contextKey) query.API_KEY = contextKey;
    if (APiKey) query.API_KEY = APiKey;
    const response = await axios.get(url, { headers, params: query });
    if (model === 'okeyai4.0-DeepCognition' && params.deepCognition === 'on' && params.reasoningFormat === 'raw') {
      if (typeof response.data === 'string' && response.data.includes('<think>')) {
        return response.data;
      }
      if (response.data && response.data.response && typeof response.data.response === 'string' && response.data.response.includes('<think>')) {
        return response.data;
      }
    }
    return response.data;
  }

  async imageToText({ model = 'okeyai4.0-DeepCognition', input, imgUrl, contextKey, APiKey, ...params }) {
    if (!input) throw new Error('Input prompt is required.');
    if (!imgUrl) throw new Error('imgUrl is required for image-to-text.');
    validateParams(model, { input, imgUrl, contextKey, APiKey, ...params });
    const url = this.endpoints[model];
    if (!url) throw new Error(`Unknown model: ${model}`);
    const headers = { Authorization: this.auth_token, ...this.headers };
    const query = { input, imgUrl, ...params };
    if (contextKey) query.API_KEY = contextKey;
    if (APiKey) query.API_KEY = APiKey;
    const response = await axios.get(url, { headers, params: query });
    if (model === 'okeyai4.0-DeepCognition' && params.deepCognition === 'on' && params.reasoningFormat === 'raw') {
      if (typeof response.data === 'string' && response.data.includes('<think>')) {
        return response.data;
      }
      if (response.data && response.data.response && typeof response.data.response === 'string' && response.data.response.includes('<think>')) {
        return response.data;
      }
    }
    return response.data;
  }

  startConversation(model = 'okeyai3.0-vanguard', contextKey) {
    return new Conversation({ client: this, model, contextKey });
  }
} 