"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail, Facebook, Instagram, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/redux/store/hooks";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 flex-shrink-0" />,
  instagram: <Instagram className="w-4 h-4 flex-shrink-0" />,
  telegram: <Send className="w-4 h-4 flex-shrink-0" />,
};

function getSocialIcon(name: string): React.ReactNode {
  return PLATFORM_ICONS[name.toLowerCase()] ?? null;
}

export function Footer() {
  const [isHydrated, setIsHydrated] = useState(false);

  const businessSettings = useAppSelector(selectBusinessSettings);

  const businessName = businessSettings?.systemName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME;
  const businessDescription = isHydrated ? businessSettings?.description || "" : "";
  const socialMedia = isHydrated ? businessSettings?.socialMedia || [] : [];
  const contactAddress = isHydrated ? businessSettings?.contactAddress || "" : "";
  const contactPhone = isHydrated ? businessSettings?.contactPhone || "" : "";
  const contactEmail = isHydrated ? businessSettings?.contactEmail || "" : "";
  const businessHours = isHydrated ? businessSettings?.businessHours || [] : [];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const footerStyle = {
    backgroundColor: `${BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}E6`,
  };

  return (
    <footer className="text-white" style={footerStyle}>
      <PageContainer>
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src="/assets/image/logo.png"
                  alt={businessName}
                  width={40}
                  height={40}
                  className="object-cover rounded"
                />
              </div>
              <span className="font-bold text-lg text-white">{businessName}</span>
            </div>
            {isHydrated && businessDescription && (
              <p className="text-white text-sm leading-relaxed">{businessDescription}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            <div className="space-y-3 text-sm">
              {contactAddress && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white">{contactAddress}</p>
                </div>
              )}
              {contactPhone && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white">{contactPhone}</p>
                </div>
              )}
              {contactEmail && (
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Business Hours</h3>
            <div className="space-y-2 text-sm">
              {businessHours.length > 0 ? (
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
              ) : null}
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            <div className="space-y-2 text-sm">
              {socialMedia.filter((s) => s.linkUrl).length > 0 ? (
                socialMedia
                  .filter((s) => s.linkUrl)
                  .map((social) => (
                    <a
                      key={social.id}
                      href={social.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                    >
                      {getSocialIcon(social.name)}
                      <span>{social.name}</span>
                    </a>
                  ))
              ) : null}
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
