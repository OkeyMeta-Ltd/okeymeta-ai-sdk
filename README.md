[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-blue?logo=github)](https://github.com/okeymeta/okeymeta-ai-sdk)
[![GitHub stars](https://img.shields.io/github/stars/okeymeta/okeymeta-ai-sdk?style=social)](https://github.com/okeymeta/okeymeta-ai-sdk/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/okeymeta/okeymeta-ai-sdk?style=social)](https://github.com/okeymeta/okeymeta-ai-sdk/network/members)
[![GitHub issues](https://img.shields.io/github/issues/okeymeta/okeymeta-ai-sdk)](https://github.com/okeymeta/okeymeta-ai-sdk/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/okeymeta/okeymeta-ai-sdk)](https://github.com/okeymeta/okeymeta-ai-sdk/graphs/contributors)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/okeymeta/okeymeta-ai-sdk)](https://github.com/okeymeta/okeymeta-ai-sdk/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/okeymeta/okeymeta-ai-sdk)](https://github.com/okeymeta/okeymeta-ai-sdk/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm audit](https://img.shields.io/badge/npm%20audit-passing-brightgreen)](https://www.npmjs.com/package/okeymeta-ai-sdk)
[![codecov](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/okeymeta/okeymeta-ai-sdk)

[![OkeyMeta Playground](https://img.shields.io/badge/OkeyMeta%20Playground-Get%20Your%20Token-orange?logo=google-chrome)](https://playground.okeymeta.com.ng)

# OkeyMeta AI SDK

[![npm version](https://img.shields.io/npm/v/okeymeta-ai-sdk.svg)](https://www.npmjs.com/package/okeymeta-ai-sdk)
[![Downloads](https://img.shields.io/npm/dm/okeymeta-ai-sdk.svg)](https://www.npmjs.com/package/okeymeta-ai-sdk)

---

> **OkeyMeta AI SDK**
>
> Effortless, production-grade integration with OkeyMeta AI models for text, image, and conversational AI. Built for Node.js, browser, and all major JS frameworks. Inspired by the best practices of Google and OpenAI SDKs.

---

## 🚀 Quickstart

### Installation
```sh
npm install okeymeta-ai-sdk
```

### Authentication
Set your OkeyMeta API token as an environment variable:
```sh
export OKEYMETA_AUTH_TOKEN="your_auth_token_here"
```
Or pass it directly to the SDK:
```js
import { OkeyMetaClient } from 'okeymeta-ai-sdk';
const client = new OkeyMetaClient({ auth_token: 'your_auth_token_here' });
```

---

## ✨ Features at a Glance

| Model                  | Text Completion | Image-to-Text | Conversation | Advanced Reasoning | Real-Time Information¹ |
|------------------------|:---------------:|:-------------:|:------------:|:-----------------:|:---------------------:|
| okeyai2.0-basic        |       ✔️        |      ❌       |      ✔️      |        ❌         |         ❌            |
| okeyai2.0-mega         |       ✔️        |      ✔️       |      ✔️      |        ❌         |         ❌            |
| okeyai3.0-vanguard     |       ✔️        |      ✔️       |      ✔️      |        ❌         |         ✔️            |
| okeyai4.0-DeepCognition|       ✔️        |      ✔️       |      ✔️      |        ✔️         |         ✔️            |

---

¹ **Real-Time Information**: Ability to access and provide up-to-date, real-world information at inference time. Only available for `okeyai3.0-vanguard` and `okeyai4.0-DeepCognition` models.

*Other features:*
- **Text Completion**: Generate or complete text based on input prompts.
- **Image-to-Text**: Describe or analyze images using AI.
- **Conversation**: Maintain context across multiple turns in a dialog.
- **Advanced Reasoning**: Enhanced logic, multi-step reasoning, or special modes (e.g., DeepCognition's `reasoningFormat`).

---

## 📝 Usage Examples

### 1. Text Completion
```js
import { OkeyMetaClient } from 'okeymeta-ai-sdk';
const client = new OkeyMetaClient();
const response = await client.textCompletion({
  model: 'okeyai3.0-vanguard',
  input: 'Tell me a fun fact about Nigeria.'
});
console.log(response);
```

### 2. Image-to-Text
```js
const imgResponse = await client.imageToText({
  model: 'okeyai4.0-DeepCognition',
  input: 'Describe this image in detail.',
  imgUrl: 'https://example.com/image.jpg',
  deepCognition: 'on',
  reasoningFormat: 'parsed' // 'raw', 'parsed', or 'hidden'
});
console.log(imgResponse);
```

### 3. Conversational AI (Context Managed)
```js
const conversation = client.startConversation('okeyai3.0-vanguard');
let reply = await conversation.send('Hello, who are you?');
console.log(reply.response);
reply = await conversation.send('Tell me a joke.');
console.log(reply.response);
```

### 4. Manual APiKey (Context Key) Override
> **Note:** If you pass the APiKey manually, it **must** start with the prefix `okeymeta-`. This is required for the OkeyMeta API to recognize and validate the context key.

```js
const response = await client.textCompletion({
  model: 'okeyai3.0-vanguard',
  input: 'Continue our conversation.',
  APiKey: 'okeymeta-your_conversation_key', // Must start with 'okeymeta-'
});
console.log(response);
```

### 5. Advanced: Custom Provider (Headers, Endpoints)
```js
import { createOkeyMetaProvider } from 'okeymeta-ai-sdk';
const okeymeta = createOkeyMetaProvider({
  auth_token: 'your_auth_token_here',
  headers: { 'X-Custom-Header': 'value' },
  endpoints: {
    'okeyai2.0-basic': 'https://custom-endpoint/okeyai2.0-basic',
  },
});
const response = await okeymeta.textCompletion({
  model: 'okeyai2.0-basic',
  input: 'What is OkeyMeta?'
});
console.log(response);
```

---

## 🧠 Understanding APiKey vs. auth_token

- **auth_token**: Your main API access credential. Required for all requests. Set via the `OKEYMETA_AUTH_TOKEN` environment variable or passed directly to the SDK.
- **APiKey (Context Key)**: Used to maintain the state of a conversation with OkeyMeta AI models. The SDK manages this automatically for you in most cases.
  - **Manual APiKey:** If you need to pass the APiKey manually (for advanced conversation control), it **must** start with the prefix `okeymeta-`. Example: `okeymeta-abc123xyz`.
  - If you omit the prefix, the API will reject your request.
  - For most users, you do **not** need to worry about the APiKey—let the SDK handle it!

---

## ⚠️ Error Handling
- All methods throw on missing/invalid parameters or unsupported features per model.
- Use try/catch for robust integration:
```js
try {
  const response = await client.textCompletion({ model: 'okeyai2.0-basic', input: '' });
} catch (err) {
  console.error('OkeyMeta error:', err.message);
}
```

---

## 🌐 Compatibility
- **Node.js**: Native support (dotenv for env vars)
- **Browser**: Use with bundlers (Webpack, Vite, etc.)
- **Frameworks**: Works with React, Vue, Angular, Next.js, Svelte, and more
- **ESM & CommonJS**: Both import and require supported

---

## 🛠️ Best Practices
- Always keep your `auth_token` secure (never expose in client-side code for public apps)
- Use environment variables for secrets
- Handle errors gracefully
- Use the conversation manager for multi-turn dialog
- Prefix manual APiKeys with `okeymeta-` if you override context

---

## ❓ FAQ
**Q: What is the difference between auth_token and APiKey?**
A: `auth_token` is your main API access credential. `APiKey` is a context key for managing conversations—handled automatically unless you need advanced control. If you pass it manually, it must start with `okeymeta-`.

**Q: Can I use this in the browser?**
A: Yes, but do not expose your `auth_token` in public apps. Use a backend proxy if needed.

**Q: How do I add custom headers or endpoints?**
A: Use `createOkeyMetaProvider` as shown above.

**Q: What happens if I forget the `okeymeta-` prefix on APiKey?**
A: The API will reject your request. Always use the correct prefix for manual context keys.

---

## 🤖 Full Feature Test Script
```js
import { OkeyMetaClient, createOkeyMetaProvider } from 'okeymeta-ai-sdk';

(async () => {
  const client = new OkeyMetaClient({ auth_token: 'your_auth_token_here' });

  // Text completion
  const text = await client.textCompletion({
    model: 'okeyai3.0-vanguard',
    input: 'What is the capital of Nigeria?'
  });
  console.log('Text:', text);

  // Image-to-text
  const image = await client.imageToText({
    model: 'okeyai4.0-DeepCognition',
    input: 'Describe this image.',
    imgUrl: 'https://example.com/image.jpg',
    deepCognition: 'on',
    reasoningFormat: 'parsed'
  });
  console.log('Image:', image);

  // Conversation
  const convo = client.startConversation('okeyai3.0-vanguard');
  let reply = await convo.send('Who won the 2018 World Cup?');
  console.log('AI:', reply.response);
  reply = await convo.send('And who was the top scorer?');
  console.log('AI:', reply.response);

  // Manual APiKey override
  const manual = await client.textCompletion({
    model: 'okeyai3.0-vanguard',
    input: 'Continue with the previous context.',
    APiKey: 'okeymeta-your_conversation_key', // Must start with 'okeymeta-'
  });
  console.log('Manual APiKey:', manual);

  // Custom provider
  const custom = createOkeyMetaProvider({
    auth_token: 'your_auth_token_here',
    headers: { 'X-Test': '1' },
  });
  const customResp = await custom.textCompletion({
    model: 'okeyai2.0-basic',
    input: 'Custom provider test.'
  });
  console.log('Custom:', customResp);
})();
```

---

## 📦 Publishing & Contributing
- To publish: `npm publish`
- To test: See the script above or run in your preferred JS environment
- PRs and issues welcome!

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 