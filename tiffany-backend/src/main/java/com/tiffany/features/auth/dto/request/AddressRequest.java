package com.tiffany.features.auth.dto.request;

import com.tiffany.enums.user.AddressType;
import lombok.Data;

import java.util.UUID;

@Data
public class AddressRequest {
    private UUID id;  // present = update existing, absent = create new
    private AddressType addressType;
    private String houseNo;
    private String street;
    private String village;
    private String commune;
    private String district;
    private String province;
    private String country;
}
