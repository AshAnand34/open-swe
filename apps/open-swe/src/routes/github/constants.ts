export const TRIGGER_USERNAME = process.env.TRIGGER_USERNAME
  ? `@${process.env.TRIGGER_USERNAME}`
  : "@open-swe";

export const PLATFORM = process.env.PLATFORM || "github";

export const PLATFORM_API_BASE_URL = PLATFORM === "github"
  ? "https://api.github.com"
  : "https://api.bitbucket.org/2.0";

export const PLATFORM_TRIGGER_USERNAME = PLATFORM === "github"
  ? TRIGGER_USERNAME
  : process.env.BITBUCKET_TRIGGER_USERNAME || "@open-swe";
