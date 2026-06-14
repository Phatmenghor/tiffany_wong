import { Plus } from "lucide-react";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import { ComboboxSelectLocation } from "@/components/shared/combobox/combobox-select-location";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardTitle } from "@/components/shared/common/card";

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
    <Card>
      <CardTitle
        right={
          <CustomButton
            onClick={onAddLocation}
            size="sm"
            variant="outline"
            className="gap-[0.24375rem]"
          >
            <Plus className="h-[0.65rem] w-[0.65rem]" />
            Add Address
          </CustomButton>
        }
      >
        Delivery / Pickup
      </CardTitle>
      <ComboboxSelectLocation
        dataSelect={selectedAddress}
        onChangeSelected={onChangeSelected}
        label=""
        placeholder="Select delivery address..."
        hasDefault={selectedAddress?.isDefault || false}
      />
    </Card>
  );
}
