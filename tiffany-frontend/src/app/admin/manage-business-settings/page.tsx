"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/components/shared/common/show-toast";
import { Loader2, Save, Facebook, Instagram, Send } from "lucide-react";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "@/redux/features/business/store/thunks/business-settings-thunks";
import {
  businessSettingsSchema,
  type BusinessSettingsFormData,
} from "./schema/business-settings.schema";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";

function convertResponseToFormData(
  response: BusinessSettingsResponse
): BusinessSettingsFormData {
  return {
    systemName: response.systemName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
    description: response.description || "",
    contactAddress: response.contactAddress || "",
    contactPhone: response.contactPhone || "",
    contactEmail: response.contactEmail || "",
    facebookUrl: response.facebookUrl || "",
    instagramUrl: response.instagramUrl || "",
    telegramUrl: response.telegramUrl || "",
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
      contactAddress: "",
      contactPhone: "",
      contactEmail: "",
      facebookUrl: "",
      instagramUrl: "",
      telegramUrl: "",
    },
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      loadSettings();
    }
  }, [isHydrated]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const action = await dispatch(fetchBusinessSettingsThunk());
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        form.reset(convertResponseToFormData(action.payload as BusinessSettingsResponse));
      } else {
        showToast.error("Failed to load business settings");
      }
    } catch {
      showToast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BusinessSettingsFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        systemName: data.systemName,
        description: data.description || undefined,
        taxPercentage: BUSINESS_SETTINGS_DEFAULTS.TAX_PERCENTAGE,
        primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
        contactAddress: data.contactAddress || undefined,
        contactPhone: data.contactPhone || undefined,
        contactEmail: data.contactEmail || undefined,
        facebookUrl: data.facebookUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        telegramUrl: data.telegramUrl || undefined,
      };

      const action = await dispatch(updateBusinessSettingsThunk(payload as any));

      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        form.reset(convertResponseToFormData(action.payload as BusinessSettingsResponse));
        showToast.success("Business settings updated successfully");
      } else {
        showToast.error("Failed to update business settings");
      }
    } catch {
      showToast.error("Failed to update business settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media links
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                placeholder="System name"
                {...form.register("systemName")}
              />
              {form.formState.errors.systemName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.systemName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Business description displayed in footer..."
                {...form.register("description")}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Brief description shown in the footer under the business name
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Input
                id="contactAddress"
                placeholder="123 Street Name, Phnom Penh, Cambodia"
                {...form.register("contactAddress")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+855 12 345 678"
                  {...form.register("contactPhone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...form.register("contactEmail")}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                id="facebookUrl"
                type="url"
                placeholder="https://facebook.com/yourpage"
                {...form.register("facebookUrl")}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500" />
                Instagram
              </Label>
              <Input
                id="instagramUrl"
                type="url"
                placeholder="https://instagram.com/yourpage"
                {...form.register("instagramUrl")}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUrl" className="flex items-center gap-2">
                <Send className="h-4 w-4 text-sky-500" />
                Telegram
              </Label>
              <Input
                id="telegramUrl"
                type="url"
                placeholder="https://t.me/yourchannel"
                {...form.register("telegramUrl")}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={loadSettings}
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
