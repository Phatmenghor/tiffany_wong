"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/redux/store/hooks";
import {
  selectBusinessSettings,
  selectPrimaryColor,
} from "@/redux/features/business/store/selectors/business-settings-selector";

export function Footer() {
  const [isHydrated, setIsHydrated] = useState(false);

  const businessSettings = useAppSelector(selectBusinessSettings);
  const primaryColor = useAppSelector(selectPrimaryColor);

  // Use Redux data or fallback to empty (blank) for hydration consistency
  const businessName = businessSettings?.systemName || "";
  const businessLogo = businessSettings?.logoSystemUrl || null;
  const businessDescription = isHydrated
    ? businessSettings?.description || ""
    : "";
  const socialMedia = isHydrated ? businessSettings?.socialMedia || [] : [];
  const contactAddress = isHydrated
    ? businessSettings?.contactAddress || ""
    : "";
  const contactPhone = isHydrated ? businessSettings?.contactPhone || "" : "";
  const contactEmail = isHydrated ? businessSettings?.contactEmail || "" : "";
  const businessHours = isHydrated ? businessSettings?.businessHours || [] : [];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Dynamic footer background color — guarded by isHydrated to prevent SSR/CSR mismatch
  const footerStyle = {
    backgroundColor: isHydrated && primaryColor ? `${primaryColor}E6` : undefined,
  };

  return (
    <footer className="text-white" style={footerStyle}>
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Business Name - From System Settings */}
          {isHydrated && (businessLogo || businessName) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 w-fit">
                {businessLogo && (
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <img
                      src={businessLogo}
                      alt={businessName}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                {businessName && (
                  <span className="font-bold text-lg text-white">
                    {businessName}
                  </span>
                )}
              </div>
              {businessDescription && (
                <p className="text-white text-sm leading-relaxed">
                  {businessDescription}
                </p>
              )}
            </div>
          )}

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p className="text-white">{contactAddress}</p>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p className="text-white">{contactPhone}</p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">
              Business Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div className="text-white">
                  {businessHours.map((hours, index) => (
                    <p key={index} className="font-medium">
                      {hours.day}: {hours.openingTime} - {hours.closingTime}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Follow Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            <div className="space-y-2 text-sm">
              {socialMedia && socialMedia.length > 0 ? (
                socialMedia.map((social) => (
                  <a
                    key={social.id}
                    href={social.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    {social.iconUrl ? (
                      <img
                        src={social.iconUrl}
                        alt={social.name}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                    ) : null}
                    <span>{social.name}</span>
                  </a>
                ))
              ) : (
                <p className="text-white/60 text-xs">
                  No social media links available
                </p>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
