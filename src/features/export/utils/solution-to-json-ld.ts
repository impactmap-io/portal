import type { Solution } from '../../../types';
import type { JsonLdSolution, JsonLdCollection, JsonLdRelationship, JsonLdVersion } from '../types/json-ld';
import { CUSTOM_CONTEXT } from './json-ld-context';

const BASE_URL = 'https://impactmap.io';

export function solutionToJsonLd(solution: Solution): JsonLdSolution {
  const solutionJsonLd: JsonLdSolution = {
    '@context': CUSTOM_CONTEXT,
    '@type': 'schema:SoftwareApplication',
    '@id': `${BASE_URL}/solutions/${solution.id}`,
    name: solution.name,
    description: solution.description,
    category: solution.category,
    status: solution.status,
    dateCreated: solution.createdAt,
    dateModified: solution.updatedAt,
    author: {
      '@type': 'schema:Person',
      name: solution.owner.name,
      role: solution.owner.role
    },
    contributor: solution.team.map(member => ({
      '@type': 'schema:Person',
      name: member.name,
      role: member.role
    })),
    metrics: Object.entries(solution.metrics).map(([key, value]) => ({
      '@type': 'schema:QuantitativeValue',
      name: key,
      value: value.current,
      targetValue: value.target,
      unitText: value.unit,
      dateModified: value.updatedAt
    }))
  };

  // Add repository information if available
  if (solution.repository) {
    solutionJsonLd.codeRepository = {
      '@type': 'schema:SoftwareSourceCode',
      name: solution.name,
      url: solution.repository.url,
      repositoryType: solution.repository.type,
      ...(solution.repository.lastCommit && {
        lastCommit: {
          '@type': 'schema:Commit',
          identifier: solution.repository.lastCommit.id,
          commitMessage: solution.repository.lastCommit.message,
          dateCreated: solution.repository.lastCommit.timestamp,
          author: {
            '@type': 'schema:Person',
            name: solution.repository.lastCommit.author,
            role: 'committer'
          }
        }
      })
    };
  }

  // Add relationships
  const relationships: JsonLdRelationship[] = [];

  // Add collaborations
  if (solution.collaborations?.length) {
    solution.collaborations.forEach(collab => {
      relationships.push({
        '@type': 'schema:Relationship',
        '@id': `${BASE_URL}/relationships/${collab.id}`,
        relationshipType: 'collaboration',
        name: collab.collaborationType,
        description: collab.description,
        startDate: collab.startDate,
        endDate: collab.endDate,
        status: collab.status,
        flowType: collab.flowType,
        subject: {
          '@id': `${BASE_URL}/solutions/${collab.sourceSolutionId}`
        },
        object: {
          '@id': `${BASE_URL}/solutions/${collab.targetSolutionId}`
        }
      });
    });
  }

  // Add dependencies
  if (solution.dependencies?.length) {
    solution.dependencies.forEach(dep => {
      relationships.push({
        '@type': 'schema:Relationship',
        '@id': `${BASE_URL}/relationships/${dep.id}`,
        relationshipType: 'dependency',
        name: dep.dependencyType,
        description: dep.description,
        criticality: dep.criticality,
        flowType: dep.flowType,
        subject: {
          '@id': `${BASE_URL}/solutions/${dep.dependentSolutionId}`
        },
        object: {
          '@id': `${BASE_URL}/solutions/${dep.dependencySolutionId}`
        }
      });
    });
  }

  // Add integrations
  if (solution.integrations?.length) {
    solution.integrations.forEach(integration => {
      relationships.push({
        '@type': 'schema:Relationship',
        '@id': `${BASE_URL}/relationships/${integration.id}`,
        relationshipType: 'integration',
        name: integration.integrationType,
        status: integration.status,
        flowType: integration.flowType,
        subject: {
          '@id': `${BASE_URL}/solutions/${integration.sourceSolutionId}`
        },
        object: {
          '@id': `${BASE_URL}/solutions/${integration.targetSolutionId}`
        }
      });
    });
  }

  // Add versions
  if (solution.versions?.length) {
    solutionJsonLd.version = solution.versions.map(version => ({
      '@type': 'schema:SoftwareApplication',
      version: version.version,
      status: version.state,
      description: version.changelog || '',
      dateReleased: version.releasedAt,
      releaseNotes: version.upgradeGuide || '',
      ...(version.breakingChanges && {
        breakingChanges: version.breakingChanges
      }),
      ...(version.knownIssues && {
        knownIssues: version.knownIssues
      })
    })) as JsonLdVersion[];
  }

  // Add relationships to the main JSON-LD
  if (relationships.length > 0) {
    solutionJsonLd.relationship = relationships;
  }

  return solutionJsonLd;
}

export function solutionsToJsonLd(solutions: Solution[]): JsonLdCollection {
  return {
    '@context': CUSTOM_CONTEXT,
    '@type': 'schema:Collection',
    '@id': `${BASE_URL}/solutions`,
    name: 'Solution Map',
    description: 'Collection of solutions and their relationships',
    itemListElement: solutions.map(solution => ({
      '@type': 'schema:ListItem',
      position: solutions.indexOf(solution) + 1,
      item: solutionToJsonLd(solution)
    }))
  };
} 