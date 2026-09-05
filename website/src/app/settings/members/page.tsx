import type { Metadata } from "next";
import { MembersView } from "@/components/settings/MembersView";

export const metadata: Metadata = {
  title: "Members",
};

export default function SettingsMembersPage() {
  return <MembersView />;
}
