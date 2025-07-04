declare module "okeymeta-ai-sdk" {
  export class OkeyMetaClient {
    constructor(options?: { auth_token?: string, headers?: object, endpoints?: object });
    textCompletion(params: object): Promise<any>;
    imageToText(params: object): Promise<any>;
    startConversation(model?: string, contextKey?: string): Conversation;
  }

  export function createOkeyMetaProvider(options?: { auth_token?: string, headers?: object, endpoints?: object }): OkeyMetaClient;

  export class Conversation {
    constructor(options: { client: OkeyMetaClient, model: string, contextKey?: string });
    setContextKey(contextKey: string): void;
    send(input: string, params?: object): Promise<any>;
  }
} 