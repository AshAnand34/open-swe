import type { RestEndpointMethodTypes } from "@octokit/rest";

export type GitHubIssue =
  RestEndpointMethodTypes["issues"]["get"]["response"]["data"];

export type GitHubIssueComment =
  RestEndpointMethodTypes["issues"]["listComments"]["response"]["data"][number];

export type GitHubPullRequest =
  RestEndpointMethodTypes["pulls"]["create"]["response"]["data"];

export type GitHubPullRequestUpdate =
  RestEndpointMethodTypes["pulls"]["update"]["response"]["data"];

export type GitHubPullRequestList =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"];

export type GitHubBranch =
  RestEndpointMethodTypes["repos"]["getBranch"]["response"]["data"];

export type GitHubPullRequestGet =
  RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];

export type GitHubReviewComment =
  RestEndpointMethodTypes["pulls"]["createReviewComment"]["response"]["data"];

export type PlatformPullRequest = GitHubPullRequestGet | BitBucketPullRequestGet;

export interface BitBucketPullRequestGet {
  id: number;
  title: string;
  description: string;
  state: string;
  author: {
    username: string;
  };
  source: {
    branch: {
      name: string;
    };
  };
  destination: {
    branch: {
      name: string;
    };
  };
}
