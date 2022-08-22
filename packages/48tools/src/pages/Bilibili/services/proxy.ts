import { HttpProxyAgent, HttpsProxyAgent, type HttpProxyAgentOptions, type HttpsProxyAgentOptions } from 'hpagent';
import type { Agents as GotAgents } from 'got';

const proxyAgentOptions: HttpProxyAgentOptions | HttpsProxyAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
  scheduling: 'lifo',
  proxy: atob('aHR0cDovL2Nocm9tZXR3LnVmdW5yLm1lOjc3Nzc=')
};

export const gotAgent: GotAgents = {
  http: new HttpProxyAgent(proxyAgentOptions),
  https: new HttpsProxyAgent(proxyAgentOptions)
};

const proxyAgentOptionsChineseMainland: HttpProxyAgentOptions | HttpsProxyAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
  scheduling: 'lifo',
  proxy: atob('aHR0cDovL2Nocm9tZS51ZnVuci5tZTo3Nzc3')
};

export let gotAgentChineseMainland: GotAgents | undefined = undefined;

if (process.env.TEST) {
  gotAgentChineseMainland = {
    http: new HttpProxyAgent(proxyAgentOptionsChineseMainland),
    https: new HttpsProxyAgent(proxyAgentOptionsChineseMainland)
  };
}