import {
  WebhookHandlerBase,
  WebhookHandlerContext,
} from "./webhook-handler-base.js";
import { RequestSource } from "../../constants.js";
import { ManagerGraphUpdate } from "@openswe/shared/open-swe/manager/types";
import { GraphConfig } from "@openswe/shared/open-swe/types";
import {
  mentionsPlatformUserForTrigger,
  extractLinkedIssues,
  getPrContext,
  convertPRPayloadToPullRequestObj,
} from "./utils.js";
import {
  PullRequestReviewTriggerData,
  SimpleIssue,
  SimplePullRequestComment,
  SimplePullRequestReview,
  SimpleTriggerComment,
} from "./types.js";
import { PLATFORM_TRIGGER_USERNAME } from "./constants.js";
import { PlatformPullRequest } from "../../utils/github/types.js";

export interface PRWebhookContext extends WebhookHandlerContext {
  prNumber: number;
}

export abstract class PRWebhookHandlerBase extends WebhookHandlerBase {
  /**
   * Validates that the content mentions the platform-specific trigger username
   */
  protected validatePlatformMention(
    content: string,
    logContext: string,
  ): boolean {
    if (!mentionsPlatformUserForTrigger(content)) {
      this.logger.info(
        `${logContext} does not mention ${PLATFORM_TRIGGER_USERNAME}, skipping`,
      );
      return false;
    }
    return true;
  }

  /**
   * Sets up PR-specific webhook context
   */
  protected async setupPRWebhookContext(
    payload: any,
  ): Promise<PRWebhookContext | null> {
    const baseContext = await this.setupWebhookContext(payload);
    if (!baseContext) {
      return null;
    }

    const prNumber = payload.pull_request?.number || payload.issue?.number;
    if (!prNumber) {
      this.logger.error("No PR number found in webhook payload");
      return null;
    }

    return {
      ...baseContext,
      prNumber,
    };
  }

  /**
   * Fetches PR context including reviews, comments, and linked issues
   */
  protected async fetchPRContext(
    context: PRWebhookContext,
    pullRequestBody: string,
  ): Promise<{
    prComments: SimplePullRequestComment[];
    reviews: SimplePullRequestReview[];
    linkedIssues: SimpleIssue[];
  }> {
    return await getPrContext(context.octokit, {
      owner: context.owner,
      repo: context.repo,
      prNumber: context.prNumber,
      linkedIssueNumbers: extractLinkedIssues(pullRequestBody || ""),
    });
  }

  /**
   * Creates PR trigger data structure
   */
  protected createPRTriggerData(
    pullRequest: PlatformPullRequest,
    prNumber: number,
    triggerComment: SimpleTriggerComment,
    prComments: SimplePullRequestComment[],
    reviews: SimplePullRequestReview[],
    linkedIssues: SimpleIssue[],
    repository: { owner: string; name: string },
  ): PullRequestReviewTriggerData {
    return {
      pullRequest: convertPRPayloadToPullRequestObj(pullRequest, prNumber),
      triggerComment,
      prComments,
      reviews,
      linkedIssues,
      repository,
    };
  }

  /**
   * Creates a standard PR run input
   */
  protected createPRRunInput(
    prompt: string,
    context: PRWebhookContext,
    pullRequest: any,
  ): ManagerGraphUpdate {
    return {
      messages: [
        this.createHumanMessage(
          prompt,
          RequestSource.GITHUB_PULL_REQUEST_WEBHOOK,
        ),
      ],
      targetRepository: {
        owner: context.owner,
        repo: context.repo,
        branch: pullRequest.head.ref,
      },
      autoAcceptPlan: true,
    };
  }

  /**
   * Creates standard PR run configuration
   */
  protected createPRRunConfiguration(
    context: PRWebhookContext,
  ): Partial<GraphConfig["configurable"]> {
    return {
      shouldCreateIssue: false,
      reviewPullNumber: context.prNumber,
    };
  }

  /**
   * Abstract method for creating the prompt - each handler implements its own
   */
  protected abstract createPrompt(prData: PullRequestReviewTriggerData): string;

  /**
   * Abstract method for creating the comment message - each handler implements its own
   */
  protected abstract createCommentMessage(linkToTrigger: string): string;

  /**
   * Abstract method for creating the link to the trigger - each handler implements its own
   */
  protected abstract createTriggerLink(
    context: PRWebhookContext,
    triggerId: number | string,
  ): string;
}
