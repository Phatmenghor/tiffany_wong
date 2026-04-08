package com.tiffany.features.order.mapper;

import com.tiffany.enums.payment.PaymentMethod;
import com.tiffany.enums.payment.PaymentStatus;
import com.tiffany.enums.payment.PaymentType;
import com.tiffany.features.order.dto.helper.PaymentCreateHelper;
import com.tiffany.features.order.dto.request.PaymentCreateRequest;
import com.tiffany.features.order.dto.response.PaymentResponse;
import com.tiffany.features.order.dto.update.PaymentUpdateRequest;
import com.tiffany.features.order.models.Payment;
import com.tiffany.shared.dto.PaginationResponse;
import com.tiffany.shared.mapper.PaginationMapper;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", uses = {PaginationMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    Payment toEntity(PaymentCreateRequest request);

    @Mapping(target = "formattedAmount", expression = "java(payment.getFormattedAmount())")
    @Mapping(target = "formattedAmountKhr", expression = "java(payment.getFormattedAmountKhr())")
    PaymentResponse toResponse(Payment payment);

    List<PaymentResponse> toResponseList(List<Payment> payments);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(PaymentUpdateRequest request, @MappingTarget Payment payment);

    default PaginationResponse<PaymentResponse> toPaginationResponse(Page<Payment> paymentPage, PaginationMapper paginationMapper) {
return paginationMapper.toPaginationResponse(paymentPage, this::toResponseList);
    }

    /**
     * Create payment from helper DTO - pure MapStruct mapping
     */
    Payment createFromHelper(PaymentCreateHelper helper);

}