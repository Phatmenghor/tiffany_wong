import { MapPin, Plus } from "lucide-react";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { Button } from "@/components/ui/button";

interface DeliveryAddressSectionProps {
  selectedAddress: LocationResponseModel | null;
  onChangeSelected: (address: LocationResponseModel | null) => void;
  onAddLocation: () => void;
}

export function DeliveryAddressSection({
  selectedAddress,
  onChangeSelected,
  onAddLocation,
}: DeliveryAddressSectionProps) {
  return (
    <div className="bg-card border rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </h2>
        <Button
          onClick={onAddLocation}
          size="sm"
          variant="outline"
          className="gap-1.5 h-8"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>
      <ComboboxSelectLocation
        dataSelect={selectedAddress}
        onChangeSelected={onChangeSelected}
        label=""
        placeholder="Select delivery address..."
        hasDefault={selectedAddress?.isDefault || false}
      />
    </div>
  );
}
