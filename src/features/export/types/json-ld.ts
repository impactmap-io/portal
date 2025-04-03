import type { Solution } from '../../../types';

export interface JsonLdContext {
  '@version': number;
  '@vocab': string;
  schema: string;
  sosa: string;
  prov: string;
  imp: string;
  status: JsonLdTerm;
  category: JsonLdTerm;
  flowType: JsonLdTerm;
  relationshipType: JsonLdTerm;
  criticality: JsonLdTerm;
  metrics: JsonLdTerm;
  author: JsonLdTerm;
  contributor: JsonLdTerm;
  relationship: JsonLdTerm;
  version: JsonLdTerm;
  codeRepository: JsonLdTerm;
}

export interface JsonLdTerm {
  '@id': string;
  '@type'?: string;
  '@container'?: string;
  '@context'?: Record<string, any>;
}

export interface JsonLdSolution {
  '@context': JsonLdContext;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  category: string;
  status: string;
  dateCreated: string;
  dateModified: string;
  author: JsonLdPerson;
  contributor: JsonLdPerson[];
  metrics: JsonLdMetric[];
  codeRepository?: JsonLdRepository;
  relationship?: JsonLdRelationship[];
  version?: JsonLdVersion[];
}

export interface JsonLdPerson {
  '@type': string;
  name: string;
  role: string;
}

export interface JsonLdMetric {
  '@type': 'sosa:Observation';
  name: string;
  value: {
    '@type': 'schema:QuantitativeValue';
    value: number;
    unitText: string;
  };
  targetValue: {
    '@type': 'schema:QuantitativeValue';
    value: number;
    unitText: string;
  };
  dateModified: string;
  madeBySensor?: string;
  observedProperty?: string;
}

export interface JsonLdRepository {
  '@type': string;
  name: string;
  url: string;
  repositoryType: string;
  lastCommit?: JsonLdCommit;
}

export interface JsonLdCommit {
  '@type': string;
  identifier: string;
  commitMessage: string;
  dateCreated: string;
  author: JsonLdPerson;
}

export interface JsonLdRelationship {
  '@type': string;
  '@id': string;
  relationshipType: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  flowType?: string;
  criticality?: string;
  subject: {
    '@id': string;
  };
  object: {
    '@id': string;
  };
}

export interface JsonLdVersion {
  '@type': string;
  version: string;
  status: string;
  description: string;
  dateReleased: string;
  releaseNotes: string;
  breakingChanges?: string;
  knownIssues?: string;
}

export interface JsonLdCollection {
  '@context': JsonLdContext;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  itemListElement: JsonLdListItem[];
}

export interface JsonLdListItem {
  '@type': string;
  position: number;
  item: JsonLdSolution;
} 