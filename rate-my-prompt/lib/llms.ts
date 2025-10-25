export interface LLM {
  id: string;
  name: string;
  provider: string;
  logo: string; // URL or path to logo
  logoFallback?: string; // Fallback CDN URL if local file doesn't exist
}

export const LLMS: LLM[] = [
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    logo: "/images/llms/claude.png",
    logoFallback: "https://mintlify.s3.us-west-1.amazonaws.com/anthropic/logo/light.svg",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    logo: "/images/llms/claude.png",
    logoFallback: "https://mintlify.s3.us-west-1.amazonaws.com/anthropic/logo/light.svg",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    logo: "/images/llms/claude.png",
    logoFallback: "https://mintlify.s3.us-west-1.amazonaws.com/anthropic/logo/light.svg",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "o1",
    name: "o1",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    provider: "OpenAI",
    logo: "/images/llms/openai.png",
    logoFallback: "https://cdn.simpleicons.org/openai/412991",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    logo: "/images/llms/gemini.png",
    logoFallback: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  },
  {
    id: "gemini-ultra",
    name: "Gemini Ultra",
    provider: "Google",
    logo: "/images/llms/gemini.png",
    logoFallback: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    logo: "/images/llms/gemini.png",
    logoFallback: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    logo: "/images/llms/gemini.png",
    logoFallback: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    logo: "/images/llms/deepseek.png",
    logoFallback: "https://github.com/deepseek-ai.png",
  },
  {
    id: "deepseek-v2.5",
    name: "DeepSeek V2.5",
    provider: "DeepSeek",
    logo: "/images/llms/deepseek.png",
    logoFallback: "https://github.com/deepseek-ai.png",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    logo: "/images/llms/deepseek.png",
    logoFallback: "https://github.com/deepseek-ai.png",
  },
  {
    id: "llama-3.1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta",
    logo: "/images/llms/meta.png",
    logoFallback: "https://cdn.simpleicons.org/meta/0668E1",
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    provider: "Meta",
    logo: "/images/llms/meta.png",
    logoFallback: "https://cdn.simpleicons.org/meta/0668E1",
  },
  {
    id: "llama-3",
    name: "Llama 3",
    provider: "Meta",
    logo: "/images/llms/meta.png",
    logoFallback: "https://cdn.simpleicons.org/meta/0668E1",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    logo: "/images/llms/mistral.png",
    logoFallback: "https://docs.mistral.ai/img/logo.svg",
  },
  {
    id: "mistral-medium",
    name: "Mistral Medium",
    provider: "Mistral AI",
    logo: "/images/llms/mistral.png",
    logoFallback: "https://docs.mistral.ai/img/logo.svg",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    provider: "Mistral AI",
    logo: "/images/llms/mistral.png",
    logoFallback: "https://docs.mistral.ai/img/logo.svg",
  },
  {
    id: "qwen-2.5",
    name: "Qwen 2.5",
    provider: "Alibaba",
    logo: "/images/llms/qwen.png",
    logoFallback: "https://avatars.githubusercontent.com/u/110708752",
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    logo: "/images/llms/cohere.png",
    logoFallback: "https://asset.brandfetch.io/idSUrLOSerucU7_fh_/id0p5RFJOf.svg",
  },
];

export function getLLMById(id: string): LLM | undefined {
  return LLMS.find((llm) => llm.id === id);
}

export function getLLMsByIds(ids: string[]): LLM[] {
  return ids.map((id) => getLLMById(id)).filter((llm): llm is LLM => llm !== undefined);
}
