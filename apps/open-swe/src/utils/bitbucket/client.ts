import axios, { AxiosInstance } from 'axios';

export class BitBucketClient {
  private authToken: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(authToken: string) {
    this.authToken = authToken;
    this.baseUrl = 'https://api.bitbucket.org/2.0';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
  }

  async getPullRequestComments(owner: string, repo: string, prNumber: number): Promise<any[]> {
    // Implement API call to fetch pull request comments
    const response = await this.axiosInstance.get(`/repositories/${owner}/${repo}/pullrequests/${prNumber}/comments`);
    return response.data.values;
  }

  async getPullRequestReviews(owner: string, repo: string, prNumber: number): Promise<any[]> {
    // BitBucket does not have a direct concept of reviews like GitHub, so this might need to be adapted
    const response = await this.axiosInstance.get(
        `/repositories/${owner}/${repo}/pullrequests/${prNumber}/activity`
    );

    // Filter for approval events or other relevant activities
    const reviews = response.data.values.filter((activity: any) =>
        activity.approval || activity.comment
    );

    return reviews.map((review: any) => ({
        id: review.id,
        type: review.approval ? "approval" : "comment",
        user: review.user.display_name,
        date: review.date,
        content: review.comment?.content?.raw || null,
    }));
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    // Implement API call to fetch issue details
    const response = await this.axiosInstance.get(`/repositories/${owner}/${repo}/issues/${issueNumber}`);
    return response.data;
  }
}
