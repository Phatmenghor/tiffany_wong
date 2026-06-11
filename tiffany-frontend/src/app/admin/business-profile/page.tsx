"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Save,
  Eye,
  Upload,
  Plus,
  Trash2,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/shared/common/show-toast";
import {
  SystemAdminSettings,
  BusinessType,
  DayOfWeek,
} from "@/types/system-admin";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export default function BusinessProfileEditorPage() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector((state) => state.businessSettings.data);
  const isLoading = useAppSelector((state) => state.businessSettings.isLoading);
  const error = useAppSelector((state) => state.businessSettings.error);

  // Fetch business settings on mount
  useEffect(() => {
    if (!businessSettings) {
      dispatch(fetchBusinessSettingsThunk());
    }
  }, [dispatch, businessSettings]);

  // Show error if fetch fails
  useEffect(() => {
    if (error) {
      showToast.error(error);
    }
  }, [error]);

  const [profile, setProfile] = useState<SystemAdminSettings | null>(null);

  // Update profile when businessSettings is loaded
  useEffect(() => {
    if (businessSettings) {
      const mappedProfile: SystemAdminSettings = {
        id: businessSettings.id,
        businessName: BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME,
        tagline: "",
        description: businessSettings.description || "",
        logo: "",
        coverImage: "",
        businessType: BusinessType.POS,
        industry: "",
        contact: {
          email: businessSettings.contactEmail,
          phone: businessSettings.contactPhone,
          whatsapp: businessSettings.contactPhone,
          address: {
            street: businessSettings.contactAddress,
            city: "",
            state: "",
            country: "",
            postalCode: "",
          },
          mapLink: "",
        },
        socialMedia: {},
        businessHours: [],
        gallery: [],
        features: [],
        services: [],
        team: [],
        reviews: [],
        stats: {
          yearsInBusiness: 0,
          customersServed: 0,
          projectsCompleted: 0,
          productsAvailable: 0,
        },
        theme: {
          primaryColor: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
          fontFamily: "Inter",
          layout: "modern",
        },
        isPublished: true,
        createdAt: businessSettings.createdAt,
        updatedAt: businessSettings.updatedAt,
        slug: "",
      };
      setProfile(mappedProfile);
    }
  }, [businessSettings]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-[1.3rem]">
        <Skeleton className="h-[5.2rem] w-full mb-[0.65rem]" />
        <Skeleton className="h-[15.6rem] w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-[1.3rem]">
        <Card>
          <CardContent className="pt-[0.975rem]">
            <p className="text-red-600">Failed to load business settings. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<string>("basic");

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      businessName: profile.businessName,
      tagline: profile.tagline || "",
      description: profile.description,
      businessType: profile.businessType,
      industry: profile.industry,
      email: profile.contact.email,
      phone: profile.contact.phone,
      whatsapp: profile.contact.whatsapp || "",
      street: profile.contact.address.street,
      city: profile.contact.address.city,
      state: profile.contact.address.state || "",
      country: profile.contact.address.country,
      postalCode: profile.contact.address.postalCode || "",
      facebook: profile.socialMedia?.facebook || "",
      instagram: profile.socialMedia?.instagram || "",
      twitter: profile.socialMedia?.twitter || "",
      linkedin: profile.socialMedia?.linkedin || "",
      website: profile.socialMedia?.website || "",
    },
  });

  const onSubmit = (data: any) => {
    showToast.success("Business profile updated successfully!");
    // TODO: API call to save profile
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact & Hours" },
    { id: "media", label: "Images & Gallery" },
    { id: "services", label: "Services & Products" },
    { id: "team", label: "Team & Testimonials" },
    { id: "social", label: "Social Media" },
  ];

  return (
    <div className="container mx-auto px-[0.4875rem] sm:px-[0.65rem] py-[0.65rem] sm:py-[1.3rem] max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[0.4875rem] mb-[0.65rem] sm:mb-[1.3rem]">
        <div>
          <h1 className="text-[0.8125rem] sm:text-[1.21875rem] font-bold">Business Profile</h1>
          <p className="text-[0.56875rem] text-gray-600 mt-[0.1625rem]">
            Customize your business portfolio and showcase your brand
          </p>
        </div>
        <div className="flex gap-[0.325rem]">
          <Link href="/business-profile" target="_blank">
            <Button variant="outline" size="sm" className="gap-[0.325rem]">
              <Eye className="w-[0.65rem] h-[0.65rem]" />
              Preview
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty}
            className="gap-[0.325rem]"
          >
            <Save className="w-[0.65rem] h-[0.65rem]" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-[0.975rem]">
        <Badge variant={profile.isPublished ? "default" : "secondary"}>
          {profile.isPublished ? "✓ Published" : "Draft"}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-[0.975rem]">
        <nav className="flex gap-[0.65rem] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-[0.4875rem] px-[0.65rem] text-[0.56875rem] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[0.975rem]">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.975rem]">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[0.65rem]">
                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Business Name *
                  </label>
                  <Controller
                    name="businessName"
                    control={control}
                    rules={{ required: "Business name is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="My Amazing Business" />
                    )}
                  />
                  {errors.businessName && (
                    <p className="text-red-600 text-[0.56875rem] mt-[0.1625rem]">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Tagline
                  </label>
                  <Controller
                    name="tagline"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Your catchy tagline here" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[0.65rem]">
                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      Business Type *
                    </label>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full border rounded-md px-[0.4875rem] py-[0.325rem]"
                        >
                          {Object.values(BusinessType).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      Industry *
                    </label>
                    <Controller
                      name="industry"
                      control={control}
                      rules={{ required: "Industry is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="e.g., Food & Beverage" />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    About Your Business *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Tell your customers about your business, what makes you unique, your story..."
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-[0.56875rem] mt-[0.1625rem]">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact & Hours Tab */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[0.975rem]">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[0.65rem]">
                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Email *
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="contact@business.com"
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-[0.56875rem] mt-[0.1625rem]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Phone *
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    WhatsApp (optional)
                  </label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="+1234567890" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Street Address *
                  </label>
                  <Controller
                    name="street"
                    control={control}
                    rules={{ required: "Address is required" }}
                    render={({ field }) => (
                      <Input {...field} placeholder="123 Main Street" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-[0.65rem]">
                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      City *
                    </label>
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: "City is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="San Francisco" />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      State/Province
                    </label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="California" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[0.65rem]">
                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      Country *
                    </label>
                    <Controller
                      name="country"
                      control={control}
                      rules={{ required: "Country is required" }}
                      render={({ field }) => (
                        <Input {...field} placeholder="United States" />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                      Postal Code
                    </label>
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="94102" />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-[0.4875rem]">
                  {profile.businessHours?.map((hours, index) => (
                    <div key={hours.day} className="flex flex-wrap items-center gap-[0.325rem]">
                      <div className="w-[3.9rem] font-medium text-[0.56875rem]">
                        {hours.day.charAt(0) + hours.day.slice(1).toLowerCase()}
                      </div>
                      <input
                        type="checkbox"
                        checked={hours.isOpen}
                        className="rounded-[0.1625rem]"
                        onChange={() => {
                          // Handle toggle
                        }}
                      />
                      {hours.isOpen && (
                        <>
                          <Input
                            type="time"
                            value={hours.openTime}
                            className="w-[5.2rem]"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.closeTime}
                            className="w-[5.2rem]"
                          />
                        </>
                      )}
                      {!hours.isOpen && (
                        <span className="text-gray-500 text-[0.56875rem]">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Images & Gallery Tab */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 gap-[0.975rem]">
            <Card>
              <CardHeader>
                <CardTitle>Cover Image & Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-[0.975rem]">
                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-[1.3rem] text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-[1.3rem] h-[1.3rem] mx-auto text-gray-400 mb-[0.325rem]" />
                    <p className="text-[0.56875rem] text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[0.4875rem] text-gray-500 mt-[0.1625rem]">
                      Recommended: 1200x400px
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                    Business Logo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-[1.3rem] text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-[1.3rem] h-[1.3rem] mx-auto text-gray-400 mb-[0.325rem]" />
                    <p className="text-[0.56875rem] text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[0.4875rem] text-gray-500 mt-[0.1625rem]">
                      Recommended: Square image, 400x400px
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Gallery</span>
                  <Button size="sm" className="gap-[0.325rem]">
                    <Plus className="w-[0.65rem] h-[0.65rem]" />
                    Add Photo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-[0.65rem]">
                  {profile.gallery?.map((item, index) => (
                    <div key={item.id} className="relative group aspect-square">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-[0.325rem] bg-red-500 rounded-full text-white">
                          <Trash2 className="w-[0.65rem] h-[0.65rem]" />
                        </button>
                      </div>
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-[1.3rem] h-[1.3rem] text-gray-400" />
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                    <div className="text-center">
                      <Plus className="w-[0.975rem] h-[0.975rem] mx-auto text-gray-400" />
                      <p className="text-[0.4875rem] text-gray-500 mt-[0.1625rem]">Add Photo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === "social" && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[0.65rem] max-w-2xl">
              <div>
                <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                  Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-[0.325rem]">
                      <Globe className="w-[0.8125rem] h-[0.8125rem] text-gray-400" />
                      <Input {...field} placeholder="https://yourwebsite.com" />
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                  Facebook
                </label>
                <Controller
                  name="facebook"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://facebook.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                  Instagram
                </label>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://instagram.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                  Twitter
                </label>
                <Controller
                  name="twitter"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://twitter.com/yourpage"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-[0.56875rem] font-medium mb-[0.325rem]">
                  LinkedIn
                </label>
                <Controller
                  name="linkedin"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/company/yourpage"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === "services" || activeTab === "team") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "services"
                  ? "Services & Products"
                  : "Team & Testimonials"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-[1.95rem]">
                <p className="text-gray-500">
                  This section will allow you to manage your{" "}
                  {activeTab === "services"
                    ? "services, products, and features"
                    : "team members and customer testimonials"}
                  .
                </p>
                <Button className="mt-[0.65rem] gap-[0.325rem]">
                  <Plus className="w-[0.65rem] h-[0.65rem]" />
                  Add {activeTab === "services" ? "Service" : "Team Member"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
