"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SocialMedia,
} from "@/redux/features/business/store/services/business-settings-service";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "@/redux/features/business/store/thunks/business-settings-thunks";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import {
  businessSettingsSchema,
  type BusinessSettingsFormData,
} from "./schema/business-settings.schema";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";
import {
  getCachedThemeColors,
  cacheThemeColors,
  applyThemeColors,
  hasThemeChanged,
} from "@/utils/common/theme-cache";

/**
 * Convert API response to form data
 * Handles type conversions between API response and form data
 */
function convertResponseToFormData(
  response: BusinessSettingsResponse
): BusinessSettingsFormData {
  return {
    systemName: response.systemName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
    description: response.description || "",
    taxPercentage: response.taxPercentage?.toString() || "",
    logoSystemUrl: response.logoSystemUrl || "",
    socialMedia: response.socialMedia || [],
    primaryColor: response.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
    contactAddress: response.contactAddress || "",
    contactPhone: response.contactPhone || "",
    contactEmail: response.contactEmail || "",
    businessHours: response.businessHours || [],
  };
}

export default function BusinessSettingsPage() {
  const dispatch = useAppDispatch();
  const reduxBusinessSettings = useAppSelector(selectBusinessSettings);

  const [isLoading, setIsLoading] = useState(!reduxBusinessSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const form = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    mode: "onChange",
    defaultValues: {
      systemName: BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
      description: "",
      taxPercentage: "",
      logoSystemUrl: "",
      socialMedia: [],
      primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      businessHours: [],
    },
  });

  // Fetch business settings on page load
  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  // Admin page: Always fetch fresh data from API when page loads
  useEffect(() => {
    if (isHydrated) {
      fetchBusinessSettings();
    }
  }, [isHydrated]);

  const fetchBusinessSettings = async () => {
    const SYSTEM_ID = "system-settings";
    try {
      // Admin page: Load cached data first for instant display
      const cachedSettings = localStorage.getItem("businessSettings_full_cache");
      if (cachedSettings) {
        try {
          const cached = JSON.parse(cachedSettings);
          const formData = convertResponseToFormData(cached);
          form.reset(formData);
          setIsLoading(false); // Hide loading spinner since we have data
        } catch (error) {
          console.error("[ADMIN] Error parsing cached settings:", error);
        }
      } else {
        setIsLoading(true); // Show loading only if no cache
      }

      // Then fetch fresh data from API in background
      const action = await dispatch(fetchBusinessSettingsThunk());

      // Check if the action was fulfilled and has a payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const data = action.payload as BusinessSettingsResponse;

        const formData = convertResponseToFormData(data);
        form.reset(formData);

        // Check if colors changed and update cache if needed
        const cachedColors = getCachedThemeColors(SYSTEM_ID);
        const currentColors = {
          primaryColor: data.primaryColor || "",
        };

        if (hasThemeChanged(cachedColors, currentColors)) {
          cacheThemeColors(SYSTEM_ID, currentColors);
        }

        // Apply theme colors
        if (data.primaryColor) {
          applyThemeColors(data.primaryColor ?? "");
        }
      } else {
        if (!cachedSettings) {
          // Only show error if we don't have cache
          showToast.error("Failed to load business settings");
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      if (!localStorage.getItem("businessSettings_full_cache")) {
        showToast.error("Failed to load business settings");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business logo selection (store base64, upload on Save)
  const handleLogoSelect = (imageData: string) => {
    // Just store the base64 in the form, don't upload yet
    form.setValue("logoSystemUrl", imageData, {
      shouldDirty: true,
    });
    showToast.success("✓ Logo selected - click Save Changes to upload");
  };


  const onSubmit = async (data: BusinessSettingsFormData) => {
    const SYSTEM_ID = "system-settings";
    try {
      setIsSaving(true);

      // Upload logo if it's base64 (follows profile pattern)
      let logoSystemUrl = data.logoSystemUrl;
      if (logoSystemUrl && isBase64Image(logoSystemUrl)) {
        try {
          logoSystemUrl = await uploadImage(logoSystemUrl);
        } catch (error) {
          console.error("Failed to upload logo:", error);
          showToast.error("Failed to upload logo");
          return;
        }
      }

      // Upload social media icons if they are base64
      let processedSocialMedia: typeof data.socialMedia;
      try {
        processedSocialMedia = await Promise.all(
          (data.socialMedia || []).map(async (sm) => {
            let iconUrl = sm.iconUrl || "";
            if (iconUrl && isBase64Image(iconUrl)) {
              iconUrl = await uploadImage(iconUrl);
            }
            return { ...sm, iconUrl: iconUrl || undefined };
          })
        );
      } catch (error) {
        console.error("Failed to upload social media icon:", error);
        showToast.error("Failed to upload a social media icon");
        return;
      }

      // Create payload with the uploaded logo URL
      // Convert null values to undefined for API compatibility
      const payload = {
        systemName: data.systemName,
        description: data.description || undefined,
        taxPercentage: data.taxPercentage
          ? parseFloat(data.taxPercentage)
          : undefined,
        logoSystemUrl: logoSystemUrl || undefined,
        socialMedia: processedSocialMedia as any,
        primaryColor: data.primaryColor || undefined,
        contactAddress: data.contactAddress || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        businessHours: data.businessHours as any,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload));

      // Check if the action was fulfilled and has a payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const result = action.payload as BusinessSettingsResponse;

        // Reset form with updated data from API
        const updatedFormData = convertResponseToFormData(result);
        form.reset(updatedFormData);

        // Cache the colors for instant load on next page refresh
        const colors = {
          primaryColor: result.primaryColor ?? "",
        };
        cacheThemeColors(SYSTEM_ID, colors);

        // Apply colors in real-time without refresh
        if (result.primaryColor) {
          applyThemeColors(result.primaryColor ?? "");
        }

        showToast.success("Business settings updated successfully");
      } else {
        showToast.error("Failed to update business settings");
        console.error("[FORM] Failed to save settings. Action:", action);
        return;
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast.error("Failed to update business settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Only show loading spinner after hydration to avoid SSR mismatch
  if (isLoading && isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media accounts
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Name */}
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  placeholder="System name"
                  {...form.register("systemName")}
                />
                <p className="text-xs text-muted-foreground">
                  System name displayed throughout the site
                </p>
              </div>

              {/* Tax Percentage */}
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Tax Percentage</Label>
                <div className="relative">
                  <Input
                    id="taxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    className="pr-8"
                    {...form.register("taxPercentage")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tax rate applied to all transactions (0-100%)
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Business description displayed in footer..."
                {...form.register("description")}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Brief description of your business (shown in footer under business name)
              </p>
            </div>

            {/* System Logo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ClickableImageUpload
                  label="System Logo"
                  value={form.watch("logoSystemUrl")}
                  onChange={handleLogoSelect}
                  disabled={isSaving}
                  aspectRatio="square"
                  height="h-48"
                  placeholder="Click to upload logo"
                  helperText="Upload a square image (PNG, JPG, etc.)"
                  maxSize={5}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Logo will be uploaded when you click Save Changes
                </p>
              </div>
              {/* Right column - empty for now, can be used for future additions */}
              <div />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Customize your brand color (applies site-wide)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    placeholder={BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    value={form.watch("primaryColor") || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR}
                    onChange={(e) => form.setValue("primaryColor", e.target.value, { shouldDirty: true })}
                    disabled={isSaving}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Main brand color
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactAddress">Contact Address</Label>
                <Input
                  id="contactAddress"
                  placeholder="123 Street Name, Phnom Penh, Cambodia"
                  {...form.register("contactAddress")}
                />
                <p className="text-xs text-muted-foreground">
                  Physical address displayed in footer
                </p>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+855 12 345 678"
                  {...form.register("contactPhone")}
                />
                <p className="text-xs text-muted-foreground">
                  Phone number for customer inquiries
                </p>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...form.register("contactEmail")}
                />
                <p className="text-xs text-muted-foreground">
                  Email for customer support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                {(() => {
                    const hours = form.watch("businessHours") || [];
                    return hours.length > 0
                      ? `${hours.length} day${hours.length > 1 ? "s" : ""} configured`
                      : "No business hours configured";
                  })()}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentHours = form.getValues("businessHours") || [];
                form.setValue("businessHours", [
                  ...currentHours,
                  { day: "", openingTime: "", closingTime: "" },
                ]);
              }}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </div>

          {form.watch("businessHours")?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No business hours configured
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.watch("businessHours")?.map((hours, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 relative lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Day
                          </Label>
                          <Input
                            placeholder="e.g., Monday"
                            value={hours.day}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].day = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Opening Time
                          </Label>
                          <Input
                            placeholder="09:00"
                            type="time"
                            value={hours.openingTime}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].openingTime = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Closing Time
                          </Label>
                          <Input
                            placeholder="22:00"
                            type="time"
                            value={hours.closingTime}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("businessHours") || []),
                              ];
                              updated[index].closingTime = e.target.value;
                              form.setValue("businessHours", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      {!isSaving && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const currentHours =
                              form.getValues("businessHours") || [];
                            form.setValue(
                              "businessHours",
                              currentHours.filter((_, i) => i !== index),
                              { shouldDirty: true }
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Social Media Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <p className="text-sm text-muted-foreground">
                {form.watch("socialMedia")?.length > 0
                  ? `${form.watch("socialMedia").length} account${
                      form.watch("socialMedia").length > 1 ? "s" : ""
                    } added`
                  : "No social media accounts added"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSocialMedia = form.getValues("socialMedia") || [];
                form.setValue("socialMedia", [
                  ...currentSocialMedia,
                  { name: "", linkUrl: "", iconUrl: "" },
                ]);
              }}
              disabled={isSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {form.watch("socialMedia")?.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No social media accounts added
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.watch("socialMedia")?.map((social, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 relative lg:col-span-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Platform Name
                          </Label>
                          <Input
                            placeholder="e.g., Facebook"
                            value={social.name}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].name = e.target.value;
                              form.setValue("socialMedia", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Profile URL
                          </Label>
                          <Input
                            placeholder="https://facebook.com/yourprofile"
                            type="url"
                            value={social.linkUrl}
                            onChange={(e) => {
                              const updated = [
                                ...(form.getValues("socialMedia") || []),
                              ];
                              updated[index].linkUrl = e.target.value;
                              form.setValue("socialMedia", updated, { shouldDirty: true });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <ClickableImageUpload
                          label="Icon Image"
                          value={social.iconUrl || ""}
                          onChange={(base64) => {
                            const updated = [
                              ...(form.getValues("socialMedia") || []),
                            ];
                            updated[index].iconUrl = base64;
                            form.setValue("socialMedia", updated, { shouldDirty: true });
                          }}
                          disabled={isSaving}
                          aspectRatio="square"
                          height="h-24"
                          placeholder="Click to upload icon"
                          helperText="PNG, SVG, JPG up to 5MB"
                          showPreviewText={false}
                          maxSize={5}
                        />
                      </div>
                      {!isSaving && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const currentSocialMedia =
                              form.getValues("socialMedia") || [];
                            form.setValue(
                              "socialMedia",
                              currentSocialMedia.filter((_, i) => i !== index),
                              { shouldDirty: true }
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={fetchBusinessSettings}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !form.formState.isDirty}
            className="min-w-[140px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
