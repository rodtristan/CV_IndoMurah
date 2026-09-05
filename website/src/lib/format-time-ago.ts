import { formatDistanceToNowStrict } from "date-fns";

export function formatTimeAgo(date: string | Date): string {
  return `${formatDistanceToNowStrict(new Date(date))} ago`;
}
