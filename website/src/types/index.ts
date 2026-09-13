// Original types - DO NOT export POS types here to avoid conflicts
// POS types should be imported directly from "@/types/pos"

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export interface AvatarProps {
  src?: string;
  icon?: string;
  alt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: AvatarProps;
  status: UserStatus;
  location: string;
}

export interface MailSender {
  name: string;
  email: string;
  avatar?: AvatarProps;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: MailSender;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  name: string;
  username: string;
  role: "member" | "owner";
  avatar: AvatarProps;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
}

// Use this Sale type for the original dashboard
export interface Sale {
  id: string;
  date: string;
  status: SaleStatus;
  email: string;
  amount: number;
}

export interface NotificationSender {
  name: string;
  email?: string;
  avatar?: AvatarProps;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: NotificationSender;
  body: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}
