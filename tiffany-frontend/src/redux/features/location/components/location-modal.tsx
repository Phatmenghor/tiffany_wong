"use client";

import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { showToast } from "@/components/shared/common/show-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Map,
  ListFilter,
  Star,
  Search,
  LocateFixed,
  Maximize2,
  Minimize2,
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { useLocationState } from "../store/state/location-state";
import { usePublicLocationState } from "../store/state/public-location-state";
import {
  createLocationSchema,
  LocationFormData,
} from "../store/models/schema/location-schema";
import {
  LocationResponseModel,
  ProvinceResponseModel,
  DistrictResponseModel,
  CommuneResponseModel,
  VillageResponseModel,
} from "../store/models/response/location-response";

// ---------------------------------------------------------------------------
// Google Maps script loader
// ---------------------------------------------------------------------------
let gmapLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (gmapLoadPromise) return gmapLoadPromise;
  gmapLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.Map) { resolve(); return; }
    const existing = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => { if (window.google?.maps?.Map) { clearInterval(id); resolve(); } }, 100);
      setTimeout(() => { clearInterval(id); if (window.google?.maps?.Map) resolve(); else reject(new Error("Timeout")); }, 10000);
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured")); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true; script.defer = true;
    script.onload = () => {
      const id = setInterval(() => { if (window.google?.maps?.Map) { clearInterval(id); resolve(); } }, 100);
      setTimeout(() => { clearInterval(id); if (window.google?.maps?.Map) resolve(); else reject(new Error("Map unavailable")); }, 10000);
    };
    script.onerror = () => { gmapLoadPromise = null; reject(new Error("Failed to load Google Maps")); };
    document.head.appendChild(script);
  });
  gmapLoadPromise.catch(() => { gmapLoadPromise = null; });
  return gmapLoadPromise;
}

// ---------------------------------------------------------------------------
interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: LocationResponseModel | null;
  initialCoords?: { lat: number; lng: number } | null;
}

// ---------------------------------------------------------------------------
// Center pin
// ---------------------------------------------------------------------------
function CenterPin({ size = "h-9 w-9", isDragging }: { size?: string; isDragging: boolean }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
      <div className={`transition-transform duration-150 ${isDragging ? "-translate-y-3 scale-110" : ""}`}>
        <MapPin className={`${size} text-red-500 drop-shadow-lg`} fill="currentColor" strokeWidth={1.5} />
      </div>
      <div className={`h-1 bg-black/30 rounded-full mx-auto transition-all duration-150 ${isDragging ? "w-3 opacity-40" : "w-2 opacity-60"}`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function LocationModal({ isOpen, onClose, editData, initialCoords }: LocationModalProps) {
  const isCreate = !editData;
  const { create, update, operations, error: reduxError, clearError } = useLocationState();
  const { reset: resetPublicLocation } = usePublicLocationState();

  const { isCreating, isUpdating } = operations;
  const isSubmitting = isCreate ? isCreating : isUpdating;

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenMapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const fullscreenMapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const fullscreenSearchRef = useRef<HTMLInputElement>(null);
  const fullscreenAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<any>(null!);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFullScreenMapReady, setIsFullScreenMapReady] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors, isDirty } } = useForm<LocationFormData>({
    resolver: zodResolver(createLocationSchema) as any,
    defaultValues: {
      label: "", latitude: 0, longitude: 0,
      houseNumber: "", streetNumber: "", village: "", commune: "",
      district: "", province: "", country: "", note: "",
      isDefault: false,
    },
    mode: "onChange",
  });

  setValueRef.current = setValue;
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const isDefaultValue = watch("isDefault");
  const hasCoords = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null;

  const addressPreview = useMemo(() => {
    const parts = [watch("houseNumber"), watch("streetNumber"), watch("village"), watch("commune"), watch("district"), watch("province")].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }, [watch("houseNumber"), watch("streetNumber"), watch("village"), watch("commune"), watch("district"), watch("province")]);

  // Reset on open
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      reset({
        label: editData.label ?? "", latitude: editData.latitude ?? 0, longitude: editData.longitude ?? 0,
        houseNumber: editData.houseNumber ?? "", streetNumber: editData.streetNumber ?? "",
        village: editData.village ?? "", commune: editData.commune ?? "",
        district: editData.district ?? "", province: editData.province ?? "",
        country: editData.country ?? "", note: editData.note ?? "",
        isDefault: editData.isDefault || false,
      });
    } else {
      reset({ label: "", latitude: 0, longitude: 0, houseNumber: "", streetNumber: "", village: "", commune: "", district: "", province: "", country: "", note: "", isDefault: false });
    }
    clearError();
  }, [isOpen, editData, reset, clearError]);

  // Load Google Maps as soon as modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsMapReady(false);
      setIsFullScreen(false);
      setMapError(null);
      // Clean up map refs when modal closes
      googleMapRef.current = null;
      geocoderRef.current = null;
      fullscreenAutocompleteRef.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleMapsScript();
        if (!cancelled) setIsMapReady(true);
      } catch (err: any) {
        if (!cancelled) setMapError(err?.message ?? "Failed to load map");
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setIsReverseGeocoding(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      setIsReverseGeocoding(false);
      if (status !== "OK" || !results?.length) return;
      const comps = results[0].address_components || [];
      let streetNumber = "", village = "", commune = "", district = "", province = "", country = "";
      for (const comp of comps) {
        const t = comp.types;
        if (t.includes("street_number")) streetNumber = comp.long_name;
        else if (t.includes("route")) streetNumber = streetNumber ? `${streetNumber} ${comp.long_name}` : comp.long_name;
        else if (t.includes("sublocality_level_1") || t.includes("sublocality")) village = comp.long_name;
        else if (t.includes("locality")) commune = comp.long_name;
        else if (t.includes("administrative_area_level_2")) district = comp.long_name;
        else if (t.includes("administrative_area_level_1")) province = comp.long_name;
        else if (t.includes("country")) country = comp.long_name;
      }
      const sv = setValueRef.current;
      sv("streetNumber", streetNumber, { shouldDirty: true });
      sv("village", village, { shouldDirty: true });
      sv("commune", commune, { shouldDirty: true });
      sv("district", district, { shouldDirty: true });
      sv("province", province, { shouldDirty: true });
      sv("country", country, { shouldDirty: true });
    });
  }, []);

  const setupAutocomplete = useCallback((input: HTMLInputElement, ref: React.MutableRefObject<google.maps.places.Autocomplete | null>) => {
    const map = googleMapRef.current;
    if (!map || !google.maps.places) return;
    if (ref.current) google.maps.event.clearInstanceListeners(ref.current);
    const ac = new google.maps.places.Autocomplete(input, { types: ["geocode", "establishment"] });
    ac.bindTo("bounds", map);
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place.geometry?.location) {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setValueRef.current("latitude", lat, { shouldDirty: true });
        setValueRef.current("longitude", lng, { shouldDirty: true });
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
      }
    });
    ref.current = ac;
  }, [reverseGeocode]);

  const initMap = useCallback((container: HTMLDivElement, lat: number, lng: number) => {
    const map = new google.maps.Map(container, {
      center: { lat, lng }, zoom: 15,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      zoomControl: false,
      gestureHandling: "none",
    });
    googleMapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    map.addListener("dragstart", () => setIsDragging(true));
    map.addListener("dragend", () => {
      const center = map.getCenter();
      if (!center) return;
      const lat = center.lat(); const lng = center.lng();
      setValueRef.current("latitude", lat, { shouldDirty: true });
      setValueRef.current("longitude", lng, { shouldDirty: true });
      setIsDragging(false);
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 400);
    });

    setValueRef.current("latitude", lat, { shouldDirty: true });
    setValueRef.current("longitude", lng, { shouldDirty: true });
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current) return;
    if (googleMapRef.current) return;
    const lat = editData?.latitude || initialCoords?.lat || 11.5564;
    const lng = editData?.longitude || initialCoords?.lng || 104.9282;
    initMap(mapContainerRef.current, lat, lng);
    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, [isMapReady]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || !isMapReady) return;

    if (isFullScreen && fullscreenMapContainerRef.current) {
      setIsFullScreenMapReady(false);
      // Get current center and zoom from modal map
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Reinitialize map in fullscreen container
      const fullscreenMap = new google.maps.Map(fullscreenMapContainerRef.current, {
        center: center || { lat: 11.5564, lng: 104.9282 },
        zoom: zoom || 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "greedy",
      });

      // Add same listeners to fullscreen map
      fullscreenMap.addListener("dragstart", () => setIsDragging(true));
      fullscreenMap.addListener("dragend", () => {
        const c = fullscreenMap.getCenter();
        if (!c) return;
        const lat = c.lat();
        const lng = c.lng();
        setValueRef.current("latitude", lat, { shouldDirty: true });
        setValueRef.current("longitude", lng, { shouldDirty: true });
        setIsDragging(false);
        if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 400);
      });

      fullscreenMapRef.current = fullscreenMap;

      // Trigger resize and setup autocomplete after DOM is ready
      const t = setTimeout(() => {
        google.maps.event.trigger(fullscreenMap, "resize");
        if (center) fullscreenMap.setCenter(center);
        setIsFullScreenMapReady(true);
        if (fullscreenSearchRef.current && google.maps.places) {
          setupAutocomplete(fullscreenSearchRef.current, fullscreenAutocompleteRef);
        }
      }, 100);

      return () => clearTimeout(t);
    } else if (!isFullScreen) {
      setIsFullScreenMapReady(false);
      // Clean up fullscreen map when exiting
      fullscreenMapRef.current = null;

      // Reinitialize modal map with current coordinates from form
      const t = setTimeout(() => {
        if (mapContainerRef.current) {
          // Clear the container
          mapContainerRef.current.innerHTML = "";
          // Get current coordinates from form or fullscreen map
          const currentLat = latitude || map.getCenter()?.lat() || 11.5564;
          const currentLng = longitude || map.getCenter()?.lng() || 104.9282;
          // Reinitialize the map
          googleMapRef.current = null;
          initMap(mapContainerRef.current, currentLat, currentLng);
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isFullScreen, isMapReady, setupAutocomplete, reverseGeocode]);

  // Handle map resize on mount
  useEffect(() => {
    if (googleMapRef.current) {
      const map = googleMapRef.current;
      const t = setTimeout(() => {
        google.maps.event.trigger(map, "resize");
        const center = map.getCenter();
        if (center) map.setCenter(center);
      }, 50);
      return () => clearTimeout(t);
    }
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) { showToast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = googleMapRef.current;
        if (map) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.panTo({ lat, lng });
          map.setZoom(17);
          setValueRef.current("latitude", lat, { shouldDirty: true });
          setValueRef.current("longitude", lng, { shouldDirty: true });
          if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
          geocodeTimerRef.current = setTimeout(() => reverseGeocode(lat, lng), 200);
        }
      },
      () => showToast.error("Unable to get your location")
    );
  }, [reverseGeocode]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      const payload = {
        label: data.label, latitude: data.latitude, longitude: data.longitude,
        houseNumber: data.houseNumber || "", streetNumber: data.streetNumber || "",
        village: data.village || "", commune: data.commune || "",
        district: data.district || "", province: data.province || "",
        country: data.country || "", note: data.note || "",
        isDefault: data.isDefault,
      };
      if (isCreate) { await create(payload).unwrap(); showToast.success("Location created"); }
      else { await update({ locationId: editData!.id, locationData: payload }).unwrap(); showToast.success("Location updated"); }
      handleClose();
    } catch (error: any) { showToast.error(error?.message ?? `Failed to ${isCreate ? "create" : "update"} location`); }
  };

  const handleClose = useCallback(() => {
    setIsFullScreen(false);
    resetPublicLocation(); reset(); clearError(); onClose();
  }, [reset, clearError, onClose, resetPublicLocation]);

  // ---------------------------------------------------------------------------
  // Fullscreen map overlay
  // ---------------------------------------------------------------------------
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[201] flex flex-col bg-white">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0 gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold block">Select on Map</span>
              {hasCoords && (
                <span className="text-xs font-mono text-muted-foreground">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  {isReverseGeocoding && <Loader2 className="inline-block h-3 w-3 ml-1 animate-spin" />}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={handleMyLocation} className="gap-1 h-9">
              <LocateFixed className="h-4 w-4" />
              <span className="hidden sm:inline">My Location</span>
            </Button>
            <Button type="button" variant="default" size="sm" onClick={() => setIsFullScreen(false)} className="gap-1 h-9">
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Done</span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b bg-background/95 backdrop-blur shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input ref={fullscreenSearchRef} type="text" placeholder="Search for a place, address…" className="pl-9 h-10 rounded-lg text-sm w-full" autoComplete="off" />
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative bg-gray-100">
          {!isFullScreenMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading map…</span>
              </div>
            </div>
          )}
          <CenterPin isDragging={isDragging} size="h-10 w-10" />
          <div ref={fullscreenMapContainerRef} className="w-full h-full bg-white" />
          {/* Address display */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded-xl px-6 py-4 shadow-lg w-[90%] max-w-2xl">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                {addressPreview && (
                  <p className="text-base font-semibold text-foreground leading-relaxed break-words">
                    {addressPreview}
                  </p>
                )}
                <p className="text-sm font-mono text-muted-foreground mt-2 flex items-center gap-2">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  {isReverseGeocoding && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main modal render
  // ---------------------------------------------------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 overflow-hidden flex flex-col w-full sm:max-w-3xl lg:max-w-5xl max-h-[95dvh] rounded-2xl"
        onInteractOutside={(e) => { if ((e.target as HTMLElement).closest(".pac-container")) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if ((e.target as HTMLElement).closest(".pac-container")) e.preventDefault(); }}
      >
        <FormHeader
          title={isCreate ? "Add Location" : "Edit Location"}
          description={isCreate ? "Pin on map or select from address list" : "Update your location details"}
          isCreate={isCreate}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <FormBody contentClassName="space-y-5">
            {/* Error banner */}
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive font-medium">
                {reduxError}
              </div>
            )}

            {/* Map section */}
            <div>
              <div className="space-y-3">
                <div className="relative h-64 rounded-lg overflow-hidden border bg-muted">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  {!isMapReady && !mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading map…</span>
                      </div>
                    </div>
                  )}
                  {mapError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-50/90">
                      <div className="text-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-yellow-800">Map unavailable</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 group cursor-pointer" onClick={() => setIsFullScreen(true)}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 text-xs text-foreground flex items-center gap-1.5 shadow-sm group-hover:shadow-md transition-all">
                      <Maximize2 className="h-3.5 w-3.5 text-primary" />
                      Click to expand
                    </div>
                  </div>
                  <CenterPin isDragging={isDragging} size="h-8 w-8" />
                </div>

                {hasCoords && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs font-mono text-green-700 flex-1">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                    <Badge variant="secondary" className="text-xs">Set</Badge>
                  </div>
                )}

                <Button type="button" variant="outline" onClick={handleMyLocation} className="w-full gap-2" disabled={isSubmitting}>
                  <LocateFixed className="h-4 w-4" />
                  Use My Location
                </Button>
              </div>
            </div>

            {/* Address details section */}
            <div className="space-y-4 pt-3 border-t">
              <TextField control={control} name="label" label="Label" placeholder="e.g., Home, Office, Shop" required disabled={isSubmitting} error={errors.label} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField control={control} name="houseNumber" label="House Number" placeholder="Enter house number" disabled={isSubmitting} error={errors.houseNumber} />
                <TextField control={control} name="streetNumber" label="Street" placeholder="Enter street" disabled={isSubmitting} error={errors.streetNumber} />
                <TextField control={control} name="village" label="Village / Sangkat" placeholder="Auto-filled" disabled={isSubmitting} error={errors.village} />
                <TextField control={control} name="commune" label="Commune / City" placeholder="Auto-filled" required disabled={isSubmitting} error={errors.commune} />
                <TextField control={control} name="district" label="District / Khan" placeholder="Auto-filled" disabled={isSubmitting} error={errors.district} />
                <TextField control={control} name="province" label="Province" placeholder="Auto-filled" disabled={isSubmitting} error={errors.province} />
              </div>

              <TextareaField control={control} name="note" label="Notes" placeholder="Delivery instructions…" rows={2} disabled={isSubmitting} error={errors.note} />

              {/* Primary location toggle */}
              <button
                type="button"
                onClick={() => setValue("isDefault", !isDefaultValue, { shouldDirty: true })}
                disabled={isSubmitting}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all focus:outline-none",
                  isDefaultValue
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className={cn("p-2 rounded-lg shrink-0", isDefaultValue ? "bg-amber-100" : "bg-muted")}>
                  <Star className={cn("h-4 w-4", isDefaultValue ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", isDefaultValue ? "text-amber-700" : "text-foreground")}>
                    {isDefaultValue ? "Default Location" : "Set as Default"}
                  </p>
                  <p className="text-xs text-muted-foreground">Default address for deliveries</p>
                </div>
                {isDefaultValue && <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />}
              </button>
            </div>
          </FormBody>

          <FormFooter isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createMessage="Creating location…" updateMessage="Updating location…">
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton isSubmitting={isSubmitting} isDirty={isDirty} isCreate={isCreate} createText="Add Location" updateText="Update" submittingCreateText="Creating…" submittingUpdateText="Updating…" />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
