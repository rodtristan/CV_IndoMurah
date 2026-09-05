import type { Metadata } from "next";
import { SecurityForm } from "@/components/settings/SecurityForm";

export const metadata: Metadata = {
  title: "Security",
};

export default function SettingsSecurityPage() {
  return <SecurityForm />;
}
