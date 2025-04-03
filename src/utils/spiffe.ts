import type { Solution } from '../types';

const DEFAULT_TRUST_DOMAIN = 'impactmap.io';

export interface SpiffeId {
  trustDomain: string;
  path: string;
  fullId: string;
}

export function generateSpiffeId(
  trustDomain: string = DEFAULT_TRUST_DOMAIN,
  path: string
): SpiffeId {
  const fullId = `spiffe://${trustDomain}${path}`;
  return {
    trustDomain,
    path,
    fullId
  };
}

export function generateSolutionSpiffeId(solution: Solution): SpiffeId {
  return generateSpiffeId(
    DEFAULT_TRUST_DOMAIN,
    `/solutions/${solution.id}`
  );
}

export function generateWorkloadSpiffeId(
  solution: Solution,
  workloadName: string,
  environment: string
): SpiffeId {
  return generateSpiffeId(
    DEFAULT_TRUST_DOMAIN,
    `/solutions/${solution.id}/workloads/${environment}/${workloadName}`
  );
}

export function generateServiceSpiffeId(
  solution: Solution,
  serviceName: string
): SpiffeId {
  return generateSpiffeId(
    DEFAULT_TRUST_DOMAIN,
    `/solutions/${solution.id}/services/${serviceName}`
  );
}

export function validateSpiffeId(spiffeId: string): boolean {
  const spiffeRegex = /^spiffe:\/\/[^\/]+\/[^\/]+$/;
  return spiffeRegex.test(spiffeId);
}

export function parseSpiffeId(spiffeId: string): SpiffeId | null {
  if (!validateSpiffeId(spiffeId)) {
    return null;
  }

  const [trustDomain, ...pathParts] = spiffeId.replace('spiffe://', '').split('/');
  const path = '/' + pathParts.join('/');

  return {
    trustDomain,
    path,
    fullId: spiffeId
  };
} 