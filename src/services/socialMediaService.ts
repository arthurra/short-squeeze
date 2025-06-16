import { SocialMediaPost, SocialMediaMetrics } from "../lib/types/stock";

export class SocialMediaService {
  private static instance: SocialMediaService;
  private readonly RECENT_POST_DAYS = 3;
  private readonly ENGAGEMENT_WEIGHTS = {
    likes: 1,
    comments: 2,
    shares: 3,
  };

  private constructor() {}

  static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  /**
   * Calculates social media metrics for a stock
   * @param posts Array of social media posts
   * @returns Social media metrics
   */
  calculateMetrics(posts: SocialMediaPost[]): SocialMediaMetrics {
    if (!posts || posts.length === 0) {
      return this.getEmptyMetrics();
    }

    const recentPosts = this.getRecentPosts(posts);
    const platformBreakdown = this.calculatePlatformBreakdown(posts);
    const recentEngagement = this.calculateEngagement(recentPosts);
    const totalEngagement = this.calculateEngagement(posts);
    const averageSentiment = this.calculateAverageSentiment(posts);
    const averageRelevance = this.calculateAverageRelevance(posts);

    return {
      totalPosts: posts.length,
      recentPosts: recentPosts.length,
      totalEngagement,
      recentEngagement,
      averageSentiment,
      averageRelevance,
      platformBreakdown,
    };
  }

  /**
   * Gets posts from the last 3 days
   * @param posts Array of all social media posts
   * @returns Array of recent posts
   */
  private getRecentPosts(posts: SocialMediaPost[]): SocialMediaPost[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RECENT_POST_DAYS);

    return posts.filter((post) => post.postedAt >= cutoffDate && post.isRecent);
  }

  /**
   * Calculates engagement score for posts
   * @param posts Array of social media posts
   * @returns Total engagement score
   */
  private calculateEngagement(posts: SocialMediaPost[]): number {
    return posts.reduce((total, post) => {
      const { likes, comments, shares } = post.engagement;
      return (
        total +
        (likes * this.ENGAGEMENT_WEIGHTS.likes +
          comments * this.ENGAGEMENT_WEIGHTS.comments +
          shares * this.ENGAGEMENT_WEIGHTS.shares)
      );
    }, 0);
  }

  /**
   * Calculates average sentiment score (-1 to 1)
   * @param posts Array of social media posts
   * @returns Average sentiment score
   */
  private calculateAverageSentiment(posts: SocialMediaPost[]): number {
    if (posts.length === 0) return 0;

    let positiveCount = 0;
    let negativeCount = 0;

    posts.forEach((post) => {
      if (post.sentiment === "positive") positiveCount++;
      else if (post.sentiment === "negative") negativeCount++;
    });

    return (positiveCount - negativeCount) / posts.length;
  }

  /**
   * Calculates average relevance score (0 to 1)
   * @param posts Array of social media posts
   * @returns Average relevance score
   */
  private calculateAverageRelevance(posts: SocialMediaPost[]): number {
    if (posts.length === 0) return 0;

    const relevanceSum = posts.reduce((sum, post) => sum + post.relevance, 0);
    return relevanceSum / posts.length;
  }

  /**
   * Calculates platform breakdown
   * @param posts Array of social media posts
   * @returns Platform breakdown percentages
   */
  private calculatePlatformBreakdown(posts: SocialMediaPost[]): {
    reddit: number;
    twitter: number;
    stocktwits: number;
  } {
    const total = posts.length;
    if (total === 0) {
      return { reddit: 0, twitter: 0, stocktwits: 0 };
    }

    const counts = posts.reduce(
      (acc, post) => {
        acc[post.platform]++;
        return acc;
      },
      { reddit: 0, twitter: 0, stocktwits: 0 }
    );

    return {
      reddit: counts.reddit / total,
      twitter: counts.twitter / total,
      stocktwits: counts.stocktwits / total,
    };
  }

  /**
   * Returns empty metrics object
   * @returns Empty metrics object
   */
  private getEmptyMetrics(): SocialMediaMetrics {
    return {
      totalPosts: 0,
      recentPosts: 0,
      totalEngagement: 0,
      recentEngagement: 0,
      averageSentiment: 0,
      averageRelevance: 0,
      platformBreakdown: {
        reddit: 0,
        twitter: 0,
        stocktwits: 0,
      },
    };
  }

  /**
   * Gets the engagement score for a post
   * @param post The social media post
   * @returns Engagement score
   */
  getPostEngagementScore(post: SocialMediaPost): number {
    const { likes, comments, shares } = post.engagement;
    return (
      likes * this.ENGAGEMENT_WEIGHTS.likes +
      comments * this.ENGAGEMENT_WEIGHTS.comments +
      shares * this.ENGAGEMENT_WEIGHTS.shares
    );
  }
}
