const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureTrailingSlash = (value: string) =>
  value.endsWith('/') ? value : `${value}/`;

export const gatewayOrigin = stripTrailingSlash(
  process.env.NEXT_PUBLIC_GATEWAY_ORIGIN ?? 'http://localhost:5200'
);

const apiBase = process.env.NEXT_PUBLIC_API_URL;
const normalizedApiBase = apiBase
  ? ensureTrailingSlash(stripTrailingSlash(apiBase))
  : ensureTrailingSlash(`${gatewayOrigin}/api`);

export const restApiBase = normalizedApiBase;

export const chatApiBase =
  process.env.NEXT_PUBLIC_CHAT_API_URL ?? `${gatewayOrigin}/chat/api/chat`;

export const chatHubUrl =
  process.env.NEXT_PUBLIC_CHAT_HUB_URL ?? `${gatewayOrigin}/chatHub`;

export const notifyHubUrl =
  process.env.NEXT_PUBLIC_NOTIFY_HUB_URL ?? `${gatewayOrigin}/notifyHub`;
