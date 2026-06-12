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
        description: data.description || undefined,
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
        <Loader2 className="h-[1.3rem] w-[1.3rem] animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-[0.975rem] px-[0.65rem] py-[0.975rem]">
      <div className="space-y-[0.325rem]">
        <h1 className="text-[1.21875rem] font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage your business configuration and social media links
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[0.975rem]">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-[0.975rem]">
            <div className="space-y-[0.325rem]">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Business description displayed in footer..."
                {...form.register("description")}
                rows={3}
              />
              <p className="text-[11px] text-muted-foreground">
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
          <CardContent className="space-y-[0.65rem]">
            <div className="space-y-[0.325rem]">
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Input
                id="contactAddress"
                placeholder="123 Street Name, Phnom Penh, Cambodia"
                {...form.register("contactAddress")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.65rem]">
              <div className="space-y-[0.325rem]">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+855 12 345 678"
                  {...form.register("contactPhone")}
                />
              </div>

              <div className="space-y-[0.325rem]">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...form.register("contactEmail")}
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-[11px] text-destructive">
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
          <CardContent className="space-y-[0.65rem]">
            <div className="space-y-[0.325rem]">
              <Label htmlFor="facebookUrl" className="flex items-center gap-[0.325rem]">
                <Facebook className="h-[0.65rem] w-[0.65rem] text-blue-600" />
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

            <div className="space-y-[0.325rem]">
              <Label htmlFor="instagramUrl" className="flex items-center gap-[0.325rem]">
                <Instagram className="h-[0.65rem] w-[0.65rem] text-pink-500" />
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

            <div className="space-y-[0.325rem]">
              <Label htmlFor="telegramUrl" className="flex items-center gap-[0.325rem]">
                <Send className="h-[0.65rem] w-[0.65rem] text-sky-500" />
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
        <div className="flex gap-[0.4875rem] justify-end pt-[0.65rem] border-t">
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
                <Loader2 className="mr-[0.325rem] h-[0.65rem] w-[0.65rem] animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-[0.325rem] h-[0.65rem] w-[0.65rem]" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
