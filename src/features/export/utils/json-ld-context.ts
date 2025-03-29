import type { JsonLdContext } from '../types/json-ld';

const BASE_URL = 'https://impactmap.io';
const VOCAB_URL = `${BASE_URL}/vocab`;

export const CUSTOM_CONTEXT: JsonLdContext = {
  '@version': 1.1,
  '@vocab': 'https://schema.org/',
  'schema': 'https://schema.org/',
  'sosa': 'http://www.w3.org/ns/sosa/',
  'prov': 'http://www.w3.org/ns/prov#',
  'imp': `${VOCAB_URL}/`,
  
  // Custom terms for ImpactMap
  'status': {
    '@id': 'imp:status',
    '@type': '@vocab',
    '@context': {
      'active': 'imp:status/active',
      'archived': 'imp:status/archived',
      'draft': 'imp:status/draft'
    }
  },
  'category': {
    '@id': 'imp:category',
    '@type': '@vocab',
    '@context': {
      'product': 'imp:category/product',
      'service': 'imp:category/service',
      'platform': 'imp:category/platform',
      'integration': 'imp:category/integration'
    }
  },
  'flowType': {
    '@id': 'imp:flowType',
    '@type': '@vocab',
    '@context': {
      'unidirectional': 'imp:flowType/unidirectional',
      'bidirectional': 'imp:flowType/bidirectional',
      'lateral': 'imp:flowType/lateral'
    }
  },
  'relationshipType': {
    '@id': 'imp:relationshipType',
    '@type': '@vocab',
    '@context': {
      'collaboration': 'imp:relationshipType/collaboration',
      'dependency': 'imp:relationshipType/dependency',
      'integration': 'imp:relationshipType/integration'
    }
  },
  'criticality': {
    '@id': 'imp:criticality',
    '@type': '@vocab',
    '@context': {
      'low': 'imp:criticality/low',
      'medium': 'imp:criticality/medium',
      'high': 'imp:criticality/high'
    }
  },
  'metrics': {
    '@id': 'imp:metrics',
    '@container': '@index',
    '@context': {
      '@type': 'schema:QuantitativeValue',
      'value': 'sosa:hasSimpleResult',
      'targetValue': 'imp:targetValue',
      'unitText': 'sosa:hasUnit',
      'dateModified': 'prov:generatedAtTime'
    }
  },
  'author': {
    '@id': 'imp:author',
    '@context': {
      '@type': 'schema:Person',
      'name': 'schema:name',
      'role': {
        '@id': 'imp:role',
        '@type': '@vocab',
        '@context': {
          'owner': 'imp:role/owner',
          'admin': 'imp:role/admin',
          'member': 'imp:role/member',
          'viewer': 'imp:role/viewer'
        }
      }
    }
  },
  'contributor': {
    '@id': 'imp:contributor',
    '@container': '@set',
    '@context': {
      '@type': 'schema:Person',
      'name': 'schema:name',
      'role': {
        '@id': 'imp:role',
        '@type': '@vocab',
        '@context': {
          'owner': 'imp:role/owner',
          'admin': 'imp:role/admin',
          'member': 'imp:role/member',
          'viewer': 'imp:role/viewer'
        }
      }
    }
  },
  'relationship': {
    '@id': 'imp:relationship',
    '@container': '@set',
    '@context': {
      '@type': 'schema:Relationship',
      'relationshipType': 'imp:relationshipType',
      'name': 'schema:name',
      'description': 'schema:description',
      'startDate': 'schema:startDate',
      'endDate': 'schema:endDate',
      'status': 'imp:status',
      'flowType': 'imp:flowType',
      'criticality': 'imp:criticality',
      'subject': {
        '@id': 'imp:subject',
        '@type': '@id'
      },
      'object': {
        '@id': 'imp:object',
        '@type': '@id'
      }
    }
  },
  'version': {
    '@id': 'imp:version',
    '@container': '@set',
    '@context': {
      '@type': 'schema:SoftwareApplication',
      'version': 'schema:version',
      'status': {
        '@id': 'imp:versionStatus',
        '@type': '@vocab',
        '@context': {
          'alpha': 'imp:versionStatus/alpha',
          'beta': 'imp:versionStatus/beta',
          'rc': 'imp:versionStatus/rc',
          'stable': 'imp:versionStatus/stable',
          'lts': 'imp:versionStatus/lts',
          'deprecated': 'imp:versionStatus/deprecated',
          'eol': 'imp:versionStatus/eol'
        }
      },
      'description': 'schema:description',
      'dateReleased': 'schema:releaseDate',
      'releaseNotes': 'schema:releaseNotes',
      'breakingChanges': 'imp:breakingChanges',
      'knownIssues': 'imp:knownIssues'
    }
  },
  'codeRepository': {
    '@id': 'schema:codeRepository',
    '@context': {
      '@type': 'schema:SoftwareSourceCode',
      'name': 'schema:name',
      'url': 'schema:url',
      'repositoryType': {
        '@id': 'imp:repositoryType',
        '@type': '@vocab',
        '@context': {
          'github': 'imp:repositoryType/github',
          'gitlab': 'imp:repositoryType/gitlab',
          'bitbucket': 'imp:repositoryType/bitbucket'
        }
      },
      'lastCommit': {
        '@type': 'schema:Commit',
        'identifier': 'schema:identifier',
        'commitMessage': 'schema:description',
        'dateCreated': 'schema:dateCreated',
        'author': {
          '@type': 'schema:Person',
          'name': 'schema:name',
          'role': 'imp:role/committer'
        }
      }
    }
  }
}; 