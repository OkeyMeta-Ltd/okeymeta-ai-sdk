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
  // Enforce correct prompt parameter per model
  if (model === 'okeyai2.0-basic' || model === 'okeyai2.0-mega') {
    if (!('ask' in params) || !params.ask) {
      throw new Error(`Parameter 'ask' is required for model '${model}'.`);
    }
    if ('input' in params) {
      throw new Error(`Parameter 'input' is not allowed for model '${model}'. Use 'ask' instead.`);
    }
  } else if (model === 'okeyai3.0-vanguard' || model === 'okeyai4.0-DeepCognition') {
    if (!('input' in params) || !params.input) {
      throw new Error(`Parameter 'input' is required for model '${model}'.`);
    }
    if ('ask' in params) {
      throw new Error(`Parameter 'ask' is not allowed for model '${model}'. Use 'input' instead.`);
    }
  }
  for (const key of Object.keys(params)) {
    if (!features.params.includes(key) && key !== 'contextKey' && key !== 'APiKey' && key !== 'stream') {
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

  async *sendStream(input, params = {}) {
    const stream = this.client.textCompletion({
      model: this.model,
      input,
      contextKey: this.contextKey,
      stream: true,
      ...params,
    });
    
    let lastResponse = null;
    for await (const chunk of stream) {
      lastResponse = chunk;
      yield chunk;
    }
    
    if (lastResponse && lastResponse.apiResponse) {
      this.contextKey = lastResponse.apiResponse.API_KEY || lastResponse.apiResponse.APiKey || this.contextKey;
    }
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

  async *streamTextCompletion({ model = 'okeyai3.0-vanguard', ask, input, contextKey, APiKey, ...params }) {
    if (params.raw) {
      throw new Error('Streaming is not supported with raw mode. Remove raw: true to enable streaming.');
    }

    let fullResponse = '';
    let apiResponse = null;

    // Enforce correct prompt parameter per model
    if (model === 'okeyai2.0-basic' || model === 'okeyai2.0-mega') {
      if (!ask) throw new Error(`Parameter 'ask' is required for model '${model}'.`);
      validateParams(model, { ask, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { ask, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      
      try {
        const response = await axios.get(url, { headers, params: query });
        apiResponse = response.data;
        const responseText = response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
        
        if (typeof responseText === 'string') {
          const words = responseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
            fullResponse += chunk;
            yield { chunk, fullResponse, done: false };
          }
        } else {
          yield { chunk: responseText, fullResponse: responseText, done: false };
        }
      } catch (error) {
        throw new Error(`Streaming error: ${error.message}`);
      }
    } else if (model === 'okeyai3.0-vanguard' || model === 'okeyai4.0-DeepCognition') {
      if (!input) throw new Error(`Parameter 'input' is required for model '${model}'.`);
      validateParams(model, { input, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { input, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      
      try {
        const response = await axios.get(url, { headers, params: query });
        apiResponse = response.data;
        let responseText = response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
        
        if (model === 'okeyai4.0-DeepCognition' && params.deepCognition === 'on' && params.reasoningFormat === 'raw') {
          if (typeof response.data === 'string' && response.data.includes('<think>')) {
            responseText = response.data;
          } else if (response.data && response.data.response && typeof response.data.response === 'string' && response.data.response.includes('<think>')) {
            responseText = response.data;
          }
        }
        
        if (typeof responseText === 'string') {
          const words = responseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
            fullResponse += chunk;
            yield { chunk, fullResponse, done: false };
          }
        } else {
          yield { chunk: responseText, fullResponse: responseText, done: false };
        }
      } catch (error) {
        throw new Error(`Streaming error: ${error.message}`);
      }
    } else {
      throw new Error(`Unknown model: ${model}`);
    }

    yield { chunk: '', fullResponse, done: true, apiResponse };
  }

  textCompletion({ model = 'okeyai3.0-vanguard', ask, input, contextKey, APiKey, raw = false, stream = false, ...params }) {
    if (stream && raw) {
      throw new Error('Streaming is not supported with raw mode. Remove raw: true to enable streaming.');
    }

    if (stream) {
      return this.streamTextCompletion({ model, ask, input, contextKey, APiKey, ...params });
    }

    // For non-streaming, use async wrapper
    return this._textCompletionAsync({ model, ask, input, contextKey, APiKey, raw, ...params });
  }

  async _textCompletionAsync({ model = 'okeyai3.0-vanguard', ask, input, contextKey, APiKey, raw = false, ...params }) {

    // Enforce correct prompt parameter per model
    if (model === 'okeyai2.0-basic' || model === 'okeyai2.0-mega') {
      if (!ask) throw new Error(`Parameter 'ask' is required for model '${model}'.`);
      validateParams(model, { ask, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { ask, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      const response = await axios.get(url, { headers, params: query });
      if (raw) return response.data;
      return response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
    } else if (model === 'okeyai3.0-vanguard' || model === 'okeyai4.0-DeepCognition') {
      if (!input) throw new Error(`Parameter 'input' is required for model '${model}'.`);
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
      if (raw) return response.data;
      return response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
    } else {
      throw new Error(`Unknown model: ${model}`);
    }
  }



  async *streamImageToText({ model = 'okeyai4.0-DeepCognition', ask, input, imgUrl, contextKey, APiKey, ...params }) {
    if (params.raw) {
      throw new Error('Streaming is not supported with raw mode. Remove raw: true to enable streaming.');
    }

    if (!imgUrl) throw new Error('imgUrl is required for image-to-text.');
    let fullResponse = '';
    let apiResponse = null;

    // Enforce correct prompt parameter per model
    if (model === 'okeyai2.0-basic' || model === 'okeyai2.0-mega') {
      if (!ask) throw new Error(`Parameter 'ask' is required for model '${model}'.`);
      validateParams(model, { ask, imgUrl, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { ask, imgUrl, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      
      try {
        const response = await axios.get(url, { headers, params: query });
        apiResponse = response.data;
        const responseText = response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
        
        if (typeof responseText === 'string') {
          const words = responseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
            fullResponse += chunk;
            yield { chunk, fullResponse, done: false };
          }
        } else {
          yield { chunk: responseText, fullResponse: responseText, done: false };
        }
      } catch (error) {
        throw new Error(`Streaming error: ${error.message}`);
      }
    } else if (model === 'okeyai3.0-vanguard' || model === 'okeyai4.0-DeepCognition') {
      if (!input) throw new Error(`Parameter 'input' is required for model '${model}'.`);
      validateParams(model, { input, imgUrl, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { input, imgUrl, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      
      try {
        const response = await axios.get(url, { headers, params: query });
        apiResponse = response.data;
        let responseText = response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
        
        if (model === 'okeyai4.0-DeepCognition' && params.deepCognition === 'on' && params.reasoningFormat === 'raw') {
          if (typeof response.data === 'string' && response.data.includes('<think>')) {
            responseText = response.data;
          } else if (response.data && response.data.response && typeof response.data.response === 'string' && response.data.response.includes('<think>')) {
            responseText = response.data;
          }
        }
        
        if (typeof responseText === 'string') {
          const words = responseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
            fullResponse += chunk;
            yield { chunk, fullResponse, done: false };
          }
        } else {
          yield { chunk: responseText, fullResponse: responseText, done: false };
        }
      } catch (error) {
        throw new Error(`Streaming error: ${error.message}`);
      }
    } else {
      throw new Error(`Unknown model: ${model}`);
    }

    yield { chunk: '', fullResponse, done: true, apiResponse };
  }

  imageToText({ model = 'okeyai4.0-DeepCognition', ask, input, imgUrl, contextKey, APiKey, raw = false, stream = false, ...params }) {
    if (stream && raw) {
      throw new Error('Streaming is not supported with raw mode. Remove raw: true to enable streaming.');
    }

    if (stream) {
      return this.streamImageToText({ model, ask, input, imgUrl, contextKey, APiKey, ...params });
    }

    // For non-streaming, use async wrapper
    return this._imageToTextAsync({ model, ask, input, imgUrl, contextKey, APiKey, raw, ...params });
  }

  async _imageToTextAsync({ model = 'okeyai4.0-DeepCognition', ask, input, imgUrl, contextKey, APiKey, raw = false, ...params }) {
    if (!imgUrl) throw new Error('imgUrl is required for image-to-text.');
    // Enforce correct prompt parameter per model
    if (model === 'okeyai2.0-basic' || model === 'okeyai2.0-mega') {
      if (!ask) throw new Error(`Parameter 'ask' is required for model '${model}'.`);
      validateParams(model, { ask, imgUrl, contextKey, APiKey, ...params });
      const url = this.endpoints[model];
      if (!url) throw new Error(`Unknown model: ${model}`);
      const headers = { Authorization: this.auth_token, ...this.headers };
      const query = { ask, imgUrl, ...params };
      if (contextKey) query.API_KEY = contextKey;
      if (APiKey) query.API_KEY = APiKey;
      const response = await axios.get(url, { headers, params: query });
      if (raw) return response.data;
      return response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
    } else if (model === 'okeyai3.0-vanguard' || model === 'okeyai4.0-DeepCognition') {
      if (!input) throw new Error(`Parameter 'input' is required for model '${model}'.`);
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
      if (raw) return response.data;
      return response.data && typeof response.data.response === 'string' ? response.data.response : response.data;
    } else {
      throw new Error(`Unknown model: ${model}`);
    }
  }



  /**
   * Fine-tune a model (OkeyMeta 3.0/4.0)
   * @param {Object} options - Fine-tuning options
   * @param {string} options.baseModel - The base model to fine-tune (e.g., 'okeyai3.0-vanguard', 'okeyai4.0-DeepCognition')
   * @param {string} options.modelName - Name for your fine-tuned model
   * @param {string} options.version - Version string
   * @param {string} options.developer - Developer name
   * @param {string} options.specialization - Specialization/domain
   * @param {string} options.tone - Tone/style
   * @param {string} options.instructions - Instructions for the model
   * @param {Array|Object} options.trainingData - Array or object of training examples
   * @param {boolean} [options.raw=false] - If true, return the full API response; otherwise, return only the accessKey
   * @returns {Promise<Object|string>} Fine-tune response (accessKey or full API object)
   */
  async fineTuneModel({ baseModel, modelName, version, developer, specialization, tone, instructions, trainingData, raw = false }) {
    if (!baseModel || !modelName || !version || !developer || !specialization || !tone || !instructions || !trainingData) {
      throw new Error('All fine-tuning parameters are required.');
    }
    const url = this.endpoints[baseModel];
    if (!url) throw new Error(`Unknown base model: ${baseModel}`);
    const params = {
      mode: 'finetune',
      modelName,
      version,
      developer,
      specialization,
      tone,
      instructions,
      trainingData: JSON.stringify(trainingData)
    };
    const headers = { Authorization: this.auth_token, ...this.headers };
    const response = await axios.get(url, { headers, params });
    if (raw) return response.data;
    return response.data && response.data.accessKey ? response.data.accessKey : response.data;
  }

  /**
   * Use a fine-tuned model (OkeyMeta 3.0/4.0)
   * @param {Object} options - Usage options
   * @param {string} options.baseModel - The base model (e.g., 'okeyai3.0-vanguard', 'okeyai4.0-DeepCognition')
   * @param {string} options.accessKey - The fine-tuned model access key
   * @param {string} options.input - Input prompt (required)
   * @param {string} [options.imgUrl] - Optional image URL (for image-to-text)
   * @param {Object} [options.extra] - Any extra params (e.g., deepCognition, reasoningFormat)
   * @returns {Promise<Object>} Model response
   */
  async useFineTunedModel({ baseModel, accessKey, input, imgUrl, extra = {} }) {
    if (!baseModel || !accessKey || !input) {
      throw new Error('baseModel, accessKey, and input are required.');
    }
    const url = this.endpoints[baseModel];
    if (!url) throw new Error(`Unknown base model: ${baseModel}`);
    const params = {
      input,
      fineTunedAccessKey: accessKey,
      ...extra
    };
    if (imgUrl) params.imgUrl = imgUrl;
    const headers = { Authorization: this.auth_token, ...this.headers };
    const response = await axios.get(url, { headers, params });
    return response.data;
  }

  startConversation(model = 'okeyai3.0-vanguard', contextKey) {
    return new Conversation({ client: this, model, contextKey });
  }
} 