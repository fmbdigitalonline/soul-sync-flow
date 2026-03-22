/**
 * Azure OpenAI shared helper module.
 * Routes all AI calls through Azure OpenAI when configured,
 * falls back to direct OpenAI if Azure env vars are not set.
 *
 * Supports SEPARATE endpoints/keys for chat vs embeddings deployments
 * (they may live on different Azure resources).
 */

// Sanitize helper: strip surrounding quotes, trailing slashes, deployment paths, and KEY= prefixes
function sanitizeEnv(raw: string | undefined, stripKeyPrefix?: string): string {
  if (!raw) return '';
  let val = raw.replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (stripKeyPrefix && val.startsWith(stripKeyPrefix + '=')) {
    val = val.slice(stripKeyPrefix.length + 1);
  }
  return val;
}

// Strip any /openai/deployments/... path that users may paste from Azure portal
function sanitizeEndpoint(raw: string): string {
  let val = sanitizeEnv(raw);
  // Remove anything from /openai onwards
  const idx = val.indexOf('/openai');
  if (idx > 0) val = val.slice(0, idx);
  return val.replace(/\/+$/, '');
}

// ── Chat credentials ──
const AZURE_OPENAI_KEY = sanitizeEnv(Deno.env.get('AZURE_OPENAI_KEY'));
const AZURE_OPENAI_ENDPOINT = sanitizeEndpoint(Deno.env.get('AZURE_OPENAI_ENDPOINT') || '');
const AZURE_OPENAI_API_VERSION = sanitizeEnv(Deno.env.get('AZURE_OPENAI_API_VERSION'), 'AZURE_OPENAI_API_VERSION') || '2024-10-21';

// ── Embeddings credentials (fall back to chat credentials if not set) ──
const AZURE_OPENAI_EMBEDDINGS_KEY = sanitizeEnv(Deno.env.get('AZURE_OPENAI_EMBEDDINGS_KEY')) || AZURE_OPENAI_KEY;
const AZURE_OPENAI_EMBEDDINGS_ENDPOINT = sanitizeEndpoint(Deno.env.get('AZURE_OPENAI_EMBEDDINGS_ENDPOINT') || '') || AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_EMBEDDINGS_API_VERSION = sanitizeEnv(Deno.env.get('AZURE_OPENAI_EMBEDDINGS_API_VERSION'), 'AZURE_OPENAI_EMBEDDINGS_API_VERSION') || '2024-02-01';

// Fallback
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Whether Azure OpenAI is fully configured (at least chat).
 */
export const isAzureConfigured = (): boolean => {
  return !!(AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT);
};

/**
 * Map OpenAI model names to Azure deployment names.
 */
const MODEL_TO_DEPLOYMENT: Record<string, string> = {
  'gpt-4.1-mini-2025-04-14': 'gpt-4.1-mini',
  'gpt-4.1-mini': 'gpt-4.1-mini',
  'gpt-4.1': 'gpt-4.1',
  'gpt-4.1-nano': 'gpt-4.1-nano',
  'gpt-4o-mini': 'gpt-4o-mini',
  'gpt-4o': 'gpt-4o',
  'text-embedding-3-small': 'text-embedding-3-small',
  'text-embedding-3-large': 'text-embedding-3-large',
};

// Boot-time verification log
if (AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT) {
  console.log(`🔷 Azure OpenAI CHAT: endpoint=${AZURE_OPENAI_ENDPOINT}, key=${AZURE_OPENAI_KEY.slice(0,4)}...${AZURE_OPENAI_KEY.slice(-4)}, api_version=${AZURE_OPENAI_API_VERSION}`);
} else {
  console.log(`⚡ Azure OpenAI CHAT NOT configured. OPENAI_API_KEY set: ${!!OPENAI_API_KEY}`);
}
if (AZURE_OPENAI_EMBEDDINGS_KEY && AZURE_OPENAI_EMBEDDINGS_ENDPOINT) {
  const sameAsChat = AZURE_OPENAI_EMBEDDINGS_ENDPOINT === AZURE_OPENAI_ENDPOINT;
  console.log(`🔷 Azure OpenAI EMBEDDINGS: endpoint=${AZURE_OPENAI_EMBEDDINGS_ENDPOINT}${sameAsChat ? ' (same as chat)' : ''}, key=${AZURE_OPENAI_EMBEDDINGS_KEY.slice(0,4)}...${AZURE_OPENAI_EMBEDDINGS_KEY.slice(-4)}, api_version=${AZURE_OPENAI_EMBEDDINGS_API_VERSION}`);
}

function getDeploymentName(model: string): string {
  return MODEL_TO_DEPLOYMENT[model] || model;
}

/**
 * Call Azure OpenAI chat completions (or fallback to OpenAI direct).
 */
export async function callChatCompletion(options: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
  tools?: any[];
  tool_choice?: any;
  signal?: AbortSignal;
  [key: string]: unknown;
}): Promise<Response> {
  const {
    messages,
    model = 'gpt-4.1-mini-2025-04-14',
    max_tokens = 4000,
    stream = false,
    temperature,
    tools,
    tool_choice,
    signal,
    ...rest
  } = options;

  if (isAzureConfigured()) {
    const deployment = getDeploymentName(model);
    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${deployment}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

    const body: Record<string, unknown> = {
      messages,
      max_completion_tokens: max_tokens,
      stream,
      ...rest,
    };
    if (temperature !== undefined) body.temperature = temperature;
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;

    console.log(`🔷 Azure Chat: ${deployment}, url=${url}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'api-key': AZURE_OPENAI_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      ...(signal ? { signal } : {}),
    });
  }

  // Fallback to direct OpenAI
  if (!OPENAI_API_KEY) {
    throw new Error('Neither Azure OpenAI nor OpenAI API key is configured');
  }

  console.log(`⚡ OpenAI Direct (fallback): ${model}`);

  const body: Record<string, unknown> = {
    model,
    messages,
    max_completion_tokens: max_tokens,
    stream,
    ...rest,
  };
  if (temperature !== undefined) body.temperature = temperature;
  if (tools) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  });
}

/**
 * Call Azure OpenAI embeddings (or fallback to OpenAI direct).
 * Uses AZURE_OPENAI_EMBEDDINGS_ENDPOINT / AZURE_OPENAI_EMBEDDINGS_KEY
 * which may point to a DIFFERENT Azure resource than chat.
 */
export async function callEmbeddings(options: {
  input: string;
  model?: string;
}): Promise<Response> {
  const { input, model = 'text-embedding-3-small' } = options;

  // Use embeddings-specific credentials
  const embeddingsConfigured = !!(AZURE_OPENAI_EMBEDDINGS_KEY && AZURE_OPENAI_EMBEDDINGS_ENDPOINT);

  if (embeddingsConfigured) {
    const deployment = getDeploymentName(model);
    const url = `${AZURE_OPENAI_EMBEDDINGS_ENDPOINT}/openai/deployments/${deployment}/embeddings?api-version=${AZURE_OPENAI_EMBEDDINGS_API_VERSION}`;

    console.log(`🔷 Azure Embeddings: ${deployment}, url=${url}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'api-key': AZURE_OPENAI_EMBEDDINGS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        encoding_format: 'float',
      }),
    });
  }

  // Fallback to direct OpenAI
  if (!OPENAI_API_KEY) {
    throw new Error('Neither Azure OpenAI nor OpenAI API key is configured');
  }

  console.log(`⚡ OpenAI Embeddings Direct (fallback): ${model}`);

  return fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
      encoding_format: 'float',
    }),
  });
}
