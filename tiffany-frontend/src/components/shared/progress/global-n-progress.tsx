"use client";

import NextTopLoader from "nextjs-toploader";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export default function PageProgressBar() {
  return (
    <NextTopLoader
      color={BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
      height={3}
      showSpinner={false}
      crawl={true}
      crawlSpeed={200}
      initialPosition={0.08}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR},0 0 5px ${BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}`}
    />
  );
}
