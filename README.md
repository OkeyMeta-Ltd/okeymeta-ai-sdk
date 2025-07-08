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
[![Node.js CI](https://img.shields.io/github/workflow/status/okeymeta/okeymeta-ai-sdk/Node.js%20CI)](https://github.com/okeymeta/okeymeta-ai-sdk/actions)

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

| Model                  | Prompt Param | Text Completion | Image-to-Text | Conversation | Advanced Reasoning | Real-Time Information¹ |
|------------------------|:------------:|:---------------:|:-------------:|:------------:|:-----------------:|:---------------------:|
| okeyai2.0-basic        |    ask       |       ✔️        |      ❌       |      ✔️      |        ❌         |         ❌            |
| okeyai2.0-mega         |    ask       |       ✔️        |      ✔️       |      ✔️      |        ❌         |         ❌            |
| okeyai3.0-vanguard     |   input      |       ✔️        |      ✔️       |      ✔️      |        ❌         |         ✔️            |
| okeyai4.0-DeepCognition|   input      |       ✔️        |      ✔️       |      ✔️      |        ✔️         |         ✔️            |

---

¹ **Real-Time Information**: Ability to access and provide up-to-date, real-world information at inference time. Only available for `okeyai3.0-vanguard` and `okeyai4.0-DeepCognition` models.

*Other features:*
- **Text Completion**: Generate or complete text based on input prompts.
- **Image-to-Text**: Describe or analyze images using AI.
- **Conversation**: Maintain context across multiple turns in a dialog.
- **Advanced Reasoning**: Enhanced logic, multi-step reasoning, or special modes (e.g., DeepCognition's `reasoningFormat`).

---

**Prompt Parameter Enforcement:**
- For `okeyai2.0-basic` and `okeyai2.0-mega`, you must use the `ask` parameter for your prompt. The `input` parameter is not allowed for these models.
- For `okeyai3.0-vanguard` and `okeyai4.0-DeepCognition`, you must use the `input` parameter for your prompt. The `ask` parameter is not allowed for these models.
- The SDK enforces this rule for both `textCompletion` and `imageToText` methods. Passing the wrong parameter will result in an error.

---

## 📝 Usage Examples

### 1. Text Completion
```js
import { OkeyMetaClient } from 'okeymeta-ai-sdk';
const client = new OkeyMetaClient();
// For 2.0 models:
const response2 = await client.textCompletion({
  model: 'okeyai2.0-basic',
  ask: 'Tell me a fun fact about Nigeria.'
});
console.log(response2); // Only the AI's response string is returned
// For 3.0/4.0 models:
const response3 = await client.textCompletion({
  model: 'okeyai3.0-vanguard',
  input: 'Tell me a fun fact about Nigeria.'
});
console.log(response3); // Only the AI's response string is returned
```

### 2. Image-to-Text
```js
// For 2.0-mega:
const imgResponse2 = await client.imageToText({
  model: 'okeyai2.0-mega',
  ask: 'Describe this image in detail.',
  imgUrl: 'https://example.com/image.jpg'
});
console.log(imgResponse2); // Only the AI's response string is returned
// For 3.0/4.0 models:
const imgResponse3 = await client.imageToText({
  model: 'okeyai4.0-DeepCognition',
  input: 'Describe this image in detail.',
  imgUrl: 'https://example.com/image.jpg',
  deepCognition: 'on',
  reasoningFormat: 'parsed' // 'raw', 'parsed', or 'hidden'
});
console.log(imgResponse3); // Only the AI's response string is returned
```

### 3. Conversational AI (Context Managed)
```js
const conversation = client.startConversation('okeyai3.0-vanguard');
let reply = await conversation.send('Hello, who are you?');
console.log(reply); // Only the AI's response string is returned
reply = await conversation.send('Tell me a joke.');
console.log(reply); // Only the AI's response string is returned
```

### 4. Manual APiKey (Context Key) Override
> **Note:** If you pass the APiKey manually, it **must** start with the prefix `okeymeta-`. This is required for the OkeyMeta API to recognize and validate the context key.

```js
const response = await client.textCompletion({
  model: 'okeyai3.0-vanguard',
  input: 'Continue our conversation.',
  APiKey: 'okeymeta-your_conversation_key', // Must start with 'okeymeta-'
});
console.log(response); // Only the AI's response string is returned
```

### 5. Advanced: Get the Full API Response (raw mode)
> If you want the full API response object (including model info, metrics, etc.), pass `{ raw: true }`:
```js
const fullTextResponse = await client.textCompletion({
  model: 'okeyai3.0-vanguard',
  input: 'Tell me a fun fact about Nigeria.',
  raw: true
});
console.log(fullTextResponse); // Full API object

const fullImageResponse = await client.imageToText({
  model: 'okeyai4.0-DeepCognition',
  input: 'Describe this image in detail.',
  imgUrl: 'https://example.com/image.jpg',
  deepCognition: 'on',
  reasoningFormat: 'parsed',
  raw: true
});
console.log(fullImageResponse); // Full API object
```

### 6. Advanced: Custom Provider (Headers, Endpoints)
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
  ask: 'What is OkeyMeta?'
});
console.log(response); // Only the AI's response string is returned
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
- The SDK enforces the use of the correct prompt parameter for each model:
  - For `okeyai2.0-basic` and `okeyai2.0-mega`, you must use `ask` (using `input` will throw an error).
  - For `okeyai3.0-vanguard` and `okeyai4.0-DeepCognition`, you must use `input` (using `ask` will throw an error).
- Use try/catch for robust integration:
```js
try {
  // This will throw for 2.0 models because 'input' is not allowed:
  const response = await client.textCompletion({ model: 'okeyai2.0-basic', input: 'Hello' });
} catch (err) {
  console.error('OkeyMeta error:', err.message); // Parameter 'input' is not allowed for model 'okeyai2.0-basic'. Use 'ask' instead.
}
try {
  // This will throw for 3.0/4.0 models because 'ask' is not allowed:
  const response = await client.textCompletion({ model: 'okeyai3.0-vanguard', ask: 'Hello' });
} catch (err) {
  console.error('OkeyMeta error:', err.message); // Parameter 'ask' is not allowed for model 'okeyai3.0-vanguard'. Use 'input' instead.
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
**Q: What prompt parameter should I use for my model?**
A: For `okeyai2.0-basic` and `okeyai2.0-mega`, always use `ask`. For `okeyai3.0-vanguard` and `okeyai4.0-DeepCognition`, always use `input`. The SDK enforces this and will throw an error if you use the wrong parameter.

**Q: What happens if I use the wrong prompt parameter?**
A: The SDK will throw a clear error. For example, using `input` with a 2.0 model will throw: `Parameter 'input' is not allowed for model 'okeyai2.0-basic'. Use 'ask' instead.`

**Q: What is the difference between auth_token and APiKey?**
A: `auth_token` is your main API access credential. `APiKey` is a context key for managing conversations—handled automatically unless you need advanced control. If you pass it manually, it must start with `okeymeta-`.

**Q: Can I use this in the browser?**
A: Yes, but do not expose your `auth_token` in public apps. Use a backend proxy if needed.

**Q: How do I add custom headers or endpoints?**
A: Use `createOkeyMetaProvider` as shown above.

**Q: What happens if I forget the `okeymeta-` prefix on APiKey?**
A: The API will reject your request. Always use the correct prefix for manual context keys.

**Q: How do I get the full API response object?**
A: Pass `{ raw: true }` to `textCompletion` or `imageToText`.

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
  console.log('Text:', text); // Only the AI's response string is returned

  // Image-to-text
  const image = await client.imageToText({
    model: 'okeyai4.0-DeepCognition',
    input: 'Describe this image.',
    imgUrl: 'https://example.com/image.jpg',
    deepCognition: 'on',
    reasoningFormat: 'parsed'
  });
  console.log('Image:', image); // Only the AI's response string is returned

  // Conversation
  const convo = client.startConversation('okeyai3.0-vanguard');
  let reply = await convo.send('Who won the 2018 World Cup?');
  console.log('AI:', reply); // Only the AI's response string is returned
  reply = await convo.send('And who was the top scorer?');
  console.log('AI:', reply); // Only the AI's response string is returned

  // Manual APiKey override
  const manual = await client.textCompletion({
    model: 'okeyai3.0-vanguard',
    input: 'Continue with the previous context.',
    APiKey: 'okeymeta-your_conversation_key', // Must start with 'okeymeta-'
  });
  console.log('Manual APiKey:', manual); // Only the AI's response string is returned

  // Custom provider
  const custom = createOkeyMetaProvider({
    auth_token: 'your_auth_token_here',
    headers: { 'X-Test': '1' },
  });
  const customResp = await custom.textCompletion({
    model: 'okeyai2.0-basic',
    input: 'Custom provider test.'
  });
  console.log('Custom:', customResp); // Only the AI's response string is returned

  // Full API response (raw mode)
  const fullText = await client.textCompletion({
    model: 'okeyai3.0-vanguard',
    input: 'Show me everything.',
    raw: true
  });
  console.log('Full API object (text):', fullText);

  const fullImage = await client.imageToText({
    model: 'okeyai4.0-DeepCognition',
    input: 'Show me everything in this image.',
    imgUrl: 'https://example.com/image.jpg',
    deepCognition: 'on',
    reasoningFormat: 'parsed',
    raw: true
  });
  console.log('Full API object (image):', fullImage);

  // Fine-tune a model (get only the accessKey)
  const accessKey = await client.fineTuneModel({
    baseModel: 'okeyai3.0-vanguard',
    modelName: 'LegalAssistant',
    version: '1.0',
    developer: 'Jane Doe',
    specialization: 'legal_consulting',
    tone: 'Legal', // Must be one of the allowed values
    instructions: 'Focus on legal terminology and contract advice',
    trainingData: [
      { input: 'What is a contract?', output: 'A contract is a legally binding agreement.' },
      { input: 'Define tort law.', output: 'Tort law deals with civil wrongs and damages.' }
    ]
  });
  console.log('Fine-tune accessKey:', accessKey);

  // Use the fine-tuned model
  const fineTunedResult = await client.useFineTunedModel({
    baseModel: 'okeyai3.0-vanguard',
    accessKey,
    input: 'What is a contract?'
  });
  console.log('Fine-tuned result:', fineTunedResult);
})();
```

---

## 🔬 Fine-tuning OkeyMeta Models (3.0 & 4.0)

You can fine-tune OkeyMeta 3.0 and 4.0 models for your own domain, tone, or dataset. The SDK provides a simple, production-grade interface for both fine-tuning and using your custom model.

**Allowed tone values:**
- Professional
- Casual
- Friendly
- Technical
- Academic
- Medical
- Legal
- Business

### 1. Fine-tune a Model
```js
// Get only the accessKey (default):
const accessKey = await client.fineTuneModel({
  baseModel: 'okeyai3.0-vanguard',
  modelName: 'MedicalAssistant',
  version: '1.0',
  developer: 'Dr.Smith',
  specialization: 'medical_consulting',
  tone: 'Professional', // Must be one of the allowed values
  instructions: 'Focus on medical terminology and healthcare advice',
  trainingData: [
    { input: 'What is hypertension?', output: 'Hypertension is high blood pressure.' },
    { input: 'Give me a healthy diet tip.', output: 'Eat more vegetables and reduce salt intake.' }
  ]
});
console.log(accessKey); // Only the accessKey string

// Get the full API response (set raw: true):
const fineTuneResponse = await client.fineTuneModel({
  baseModel: 'okeyai3.0-vanguard',
  modelName: 'MedicalAssistant',
  version: '1.0',
  developer: 'Dr.Smith',
  specialization: 'medical_consulting',
  tone: 'Professional', // Must be one of the allowed values
  instructions: 'Focus on medical terminology and healthcare advice',
  trainingData: [
    { input: 'What is hypertension?', output: 'Hypertension is high blood pressure.' },
    { input: 'Give me a healthy diet tip.', output: 'Eat more vegetables and reduce salt intake.' }
  ],
  raw: true
});
console.log(fineTuneResponse); // Full API object
```

**Sample Response:**
```json
{
  "status": "200",
  "message": "Fine-tuned model created successfully",
  "accessKey": "c74914909adbac...f63b884",
  "modelDetails": {
    "name": "MedicalAssistant",
    "version": "1.0",
    "developer": "Dr.Smith",
    "specialization": "medical_consulting",
    "tone": "professional",
    "baseModel": "OkeyAI 3.0 Vanguard",
    "originalCreator": "OkeyMeta Programming Team",
    "originalDeveloper": "Okechukwu Nwaozor"
  }
}
```

### 2. Use Your Fine-tuned Model
```js
const result = await client.useFineTunedModel({
  baseModel: 'okeyai3.0-vanguard', // or 'okeyai4.0-DeepCognition'
  accessKey: fineTuneResponse.accessKey,
  input: 'What is hypertension?'
});
console.log(result);

// For image-to-text with a fine-tuned model:
const imgResult = await client.useFineTunedModel({
  baseModel: 'okeyai4.0-DeepCognition',
  accessKey: fineTuneResponse.accessKey,
  input: 'Describe this image.',
  imgUrl: 'https://example.com/image.jpg',
  extra: { deepCognition: 'on', reasoningFormat: 'parsed' }
});
console.log(imgResult);
```

**Note:** Fine-tuning is only supported for OkeyMeta 3.0 and 4.0 models. Always save your accessKey securely.

---

## 📦 Publishing & Contributing
- To publish: `npm publish`
- To test: See the script above or run in your preferred JS environment
- PRs and issues welcome!

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 