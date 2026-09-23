"use client";

import { EntityNewPage } from "@/components/master-data/pages";
import { shippingConfig } from "@/components/master-data/configs";

export default function Page() {
  return <EntityNewPage config={shippingConfig} />;
}
