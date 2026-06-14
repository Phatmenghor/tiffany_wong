import { Plus } from "lucide-react";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { CustomButton } from "@/components/shared/button/custom-button";

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
    <div className="bg-card border rounded-[0.65rem] p-[0.8125rem]">
      <div className="flex items-center justify-between mb-[0.65rem]">
        <h2 className="text-[13px] font-bold">Delivery / Pickup</h2>
        <CustomButton
          onClick={onAddLocation}
          size="sm"
          variant="outline"
          className="gap-[0.24375rem]"
        >
          <Plus className="h-[0.65rem] w-[0.65rem]" />
          Add Address
        </CustomButton>
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
