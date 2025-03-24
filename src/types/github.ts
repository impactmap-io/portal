export interface GitHubInstallation {
  id: string;
  account: {
    login: string;
    avatarUrl: string;
  };
  repositories: GitHubRepository[];
  permissions: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  visibility: 'public' | 'private' | 'internal';
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
}