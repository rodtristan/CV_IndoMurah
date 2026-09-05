import type { Metadata } from "next";
import { GeneralForm } from "@/components/settings/GeneralForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsGeneralPage() {
  return <GeneralForm />;
}
