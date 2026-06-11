"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/redux/store/hooks";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export function Footer() {
  const [isHydrated, setIsHydrated] = useState(false);
  const businessSettings = useAppSelector(selectBusinessSettings);

  const businessName = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME;
  const businessDescription = isHydrated ? businessSettings?.description || "" : "";
  const contactAddress = isHydrated ? businessSettings?.contactAddress || "" : "";
  const contactPhone = isHydrated ? businessSettings?.contactPhone || "" : "";
  const contactEmail = isHydrated ? businessSettings?.contactEmail || "" : "";
  const facebookUrl = isHydrated ? businessSettings?.facebookUrl || "" : "";
  const instagramUrl = isHydrated ? businessSettings?.instagramUrl || "" : "";
  const telegramUrl = isHydrated ? businessSettings?.telegramUrl || "" : "";

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const footerStyle = {
    backgroundColor: `${BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}E6`,
  };

  const socialLinks = [
    { href: facebookUrl, icon: <Facebook className="w-[0.65rem] h-[0.65rem]" />, label: "Facebook" },
    { href: instagramUrl, icon: <Instagram className="w-[0.65rem] h-[0.65rem]" />, label: "Instagram" },
    { href: telegramUrl, icon: <Send className="w-[0.65rem] h-[0.65rem]" />, label: "Telegram" },
  ].filter((s) => s.href);

  return (
    <footer className="text-white" style={footerStyle}>
      <PageContainer>
        <div className="py-[1.95rem] grid grid-cols-1 md:grid-cols-3 gap-[1.3rem]">
          {/* Brand */}
          <div className="space-y-[0.65rem]">
            <div className="flex items-center gap-[0.325rem] w-fit">
              <div className="w-[1.625rem] h-[1.625rem] rounded-[0.325rem] bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src="/assets/image/logo.png"
                  alt={businessName}
                  width={40}
                  height={40}
                  className="object-cover rounded-[0.1625rem]"
                />
              </div>
              <span className="font-bold text-[0.73125rem] text-white">{businessName}</span>
            </div>
            {isHydrated && businessDescription && (
              <p className="text-white/80 text-[0.56875rem] leading-relaxed">{businessDescription}</p>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-[0.65rem]">
            <h3 className="font-semibold text-white text-[0.65rem]">Contact Info</h3>
            <div className="space-y-[0.4875rem] text-[0.56875rem]">
              {contactAddress && (
                <div className="flex gap-[0.4875rem]">
                  <MapPin className="w-[0.8125rem] h-[0.8125rem] text-white flex-shrink-0 mt-[0.08125rem]" />
                  <p className="text-white">{contactAddress}</p>
                </div>
              )}
              {contactPhone && (
                <div className="flex gap-[0.4875rem]">
                  <Phone className="w-[0.8125rem] h-[0.8125rem] text-white flex-shrink-0 mt-[0.08125rem]" />
                  <p className="text-white">{contactPhone}</p>
                </div>
              )}
              {contactEmail && (
                <div className="flex gap-[0.4875rem]">
                  <Mail className="w-[0.8125rem] h-[0.8125rem] text-white flex-shrink-0 mt-[0.08125rem]" />
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

          {/* Social Media */}
          <div className="space-y-[0.65rem]">
            <h3 className="font-semibold text-white text-[0.65rem]">Follow Us</h3>
            <div className="space-y-[0.325rem] text-[0.56875rem]">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-[0.325rem] text-white hover:text-white/80 transition-colors"
                >
                  {s.icon}
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
