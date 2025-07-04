/**
 * Type definitions for okeymeta-ai-sdk
 * OkeyMeta AI SDK: Official SDK for OkeyMeta AI models, including OkeyAI—Africa's first trained AI.
 * https://github.com/okeymeta/okeymeta-ai-sdk
 */

export interface OkeyMetaClientOptions {
  auth_token?: string;
  headers?: Record<string, string>;
  endpoints?: Record<string, string>;
}

export interface TextCompletionParams {
  model?: string;
  input: string;
  contextKey?: string;
  APiKey?: string;
  [key: string]: any;
}

export interface ImageToTextParams {
  model?: string;
  input: string;
  imgUrl: string;
  contextKey?: string;
  APiKey?: string;
  deepCognition?: string;
  reasoningFormat?: 'raw' | 'parsed' | 'hidden';
  [key: string]: any;
}

export interface ConversationOptions {
  client: OkeyMetaClient;
  model: string;
  contextKey?: string;
}

export interface ConversationResponse {
  response: string;
  API_KEY?: string;
  APiKey?: string;
  [key: string]: any;
}

/**
 * Main OkeyMetaClient class for interacting with OkeyMeta AI models.
 */
export class OkeyMetaClient {
  constructor(options?: OkeyMetaClientOptions);

  /**
   * Generate or complete text using a specified model.
   */
  textCompletion(params: TextCompletionParams): Promise<ConversationResponse>;

  /**
   * Generate text from an image using a specified model.
   */
  imageToText(params: ImageToTextParams): Promise<ConversationResponse>;

  /**
   * Start a new conversation with a model.
   */
  startConversation(model?: string, contextKey?: string): Conversation;
}

/**
 * Create a custom OkeyMeta provider instance (advanced usage).
 */
export function createOkeyMetaProvider(options?: OkeyMetaClientOptions): OkeyMetaClient;

/**
 * Conversation manager for multi-turn dialog with OkeyMeta models.
 */
export class Conversation {
  constructor(options: ConversationOptions);

  /**
   * Set or update the context key for the conversation.
   */
  setContextKey(contextKey: string): void;

  /**
   * Send a message and receive a response from the model.
   */
  send(input: string, params?: Record<string, any>): Promise<ConversationResponse>;
} 