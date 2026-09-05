import type { Metadata } from "next";
import { NotificationsForm } from "@/components/settings/NotificationsForm";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function SettingsNotificationsPage() {
  return <NotificationsForm />;
}
