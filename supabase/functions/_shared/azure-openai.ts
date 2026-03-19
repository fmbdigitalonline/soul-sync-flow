/**
 * Azure OpenAI shared helper module.
 * Routes all AI calls through Azure OpenAI when configured,
 * falls back to direct OpenAI if Azure env vars are not set.
 */

// Sanitize helper: strip surrounding quotes, trailing slashes, and accidental KEY= prefixes
function sanitizeEnv(raw: string | undefined, stripKeyPrefix?: string): string {
  if (!raw) return '';
  let val = raw.replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (stripKeyPrefix && val.startsWith(stripKeyPrefix + '=')) {
    val = val.slice(stripKeyPrefix.length + 1);
  }
  return val;
}

// Azure environment variables (sanitized defensively)
const AZURE_OPENAI_KEY = sanitizeEnv(Deno.env.get('AZURE_OPENAI_KEY'));
const AZURE_OPENAI_ENDPOINT = sanitizeEnv(Deno.env.get('AZURE_OPENAI_ENDPOINT'));
const AZURE_OPENAI_API_VERSION = sanitizeEnv(Deno.env.get('AZURE_OPENAI_API_VERSION'), 'AZURE_OPENAI_API_VERSION') || '2024-10-21';
const AZURE_OPENAI_EMBEDDINGS_API_VERSION = sanitizeEnv(Deno.env.get('AZURE_OPENAI_EMBEDDINGS_API_VERSION'), 'AZURE_OPENAI_EMBEDDINGS_API_VERSION') || '2024-02-01';

// Fallback
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Whether Azure OpenAI is fully configured.
 */
export const isAzureConfigured = (): boolean => {
  return !!(AZURE_OPENAI_KEY && AZURE_OPENAI_ENDPOINT);
};

/**
 * Map OpenAI model names to Azure deployment names.
 * Update this mapping to match your Azure OpenAI deployments.
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

/**
 * Resolve a model name to an Azure deployment name.
 */
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

    console.log(`🔷 Azure OpenAI: ${deployment} (${messages.length} messages), key length=${AZURE_OPENAI_KEY.length}, key=${AZURE_OPENAI_KEY.slice(0,4)}...${AZURE_OPENAI_KEY.slice(-4)}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'api-key': AZURE_OPENAI_KEY!,
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
 */
export async function callEmbeddings(options: {
  input: string;
  model?: string;
}): Promise<Response> {
  const { input, model = 'text-embedding-3-small' } = options;

  if (isAzureConfigured()) {
    const deployment = getDeploymentName(model);
    const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${deployment}/embeddings?api-version=${AZURE_OPENAI_EMBEDDINGS_API_VERSION}`;

    console.log(`🔷 Azure OpenAI Embeddings: ${deployment}`);
    console.log(`🔷 Full embeddings URL: ${url}`);

    return fetch(url, {
      method: 'POST',
      headers: {
        'api-key': AZURE_OPENAI_KEY!,
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
