package com.emenu.features.order.service.impl;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.enums.payment.PaymentType;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.features.order.dto.filter.PaymentFilterRequest;
import com.emenu.features.order.dto.request.PaymentCreateRequest;
import com.emenu.features.order.dto.response.PaymentResponse;
import com.emenu.features.order.dto.update.PaymentUpdateRequest;
import com.emenu.features.order.mapper.PaymentMapper;
import com.emenu.features.order.models.Payment;
import com.emenu.features.order.repository.PaymentRepository;
import com.emenu.features.order.service.ExchangeRateService;
import com.emenu.features.order.service.PaymentService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.generate.PaymentReferenceGenerator;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ExchangeRateService exchangeRateService;
    private final PaymentMapper paymentMapper;
    private final PaymentReferenceGenerator referenceGenerator;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        log.info("Creating payment: amount={}, type={}", request.getAmount(), request.getPaymentType());
        String referenceNumber = determineReferenceNumber(request);
        PaymentType paymentType = request.getPaymentType();
        PaymentResponse response = switch (paymentType) {
            case SUBSCRIPTION -> createSubscriptionPaymentStubbed(referenceNumber);
            case BUSINESS_RECORD -> createBusinessPaymentStubbed(referenceNumber);
            case USER_PLAN -> createUserPlanPayment(request, referenceNumber);
            case REFUND -> createRefundPayment(request, referenceNumber);
            case OTHER -> createOtherPayment(request, referenceNumber);
        };
        log.info("Payment created: id={}, reference={}", response.getId(), referenceNumber);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<PaymentResponse> getAllPayments(PaymentFilterRequest filter) {
        log.info("Fetching payments: status={}", filter.getStatuses());
        Pageable pageable = PaginationUtils.createPageable(filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());
        List<PaymentMethod> paymentMethods = (filter.getPaymentMethods() != null && !filter.getPaymentMethods().isEmpty())
                ? filter.getPaymentMethods() : null;
        List<PaymentStatus> paymentStatuses = (filter.getStatuses() != null && !filter.getStatuses().isEmpty())
                ? filter.getStatuses() : null;
        Page<Payment> paymentPage = paymentRepository.findAllWithFilters(
                filter.getPlanId(),
                paymentMethods,
                paymentStatuses,
                filter.getCreatedFrom(),
                filter.getCreatedTo(),
                filter.getSearch(),
                pageable
        );
        return paymentMapper.toPaginationResponse(paymentPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        log.info("Fetching payment: id={}", id);
        Payment payment = paymentRepository.findByIdWithRelationships(id)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse updatePayment(UUID id, PaymentUpdateRequest request) {
        log.info("Updating payment: id={}", id);
        Payment payment = findPaymentById(id);

        paymentMapper.updateEntity(request, payment);
        if (request.getAmount() != null) {
            Double rate = exchangeRateService.getCurrentActiveRate().getUsdToKhrRate();
            payment.calculateAmountKhr(rate);
        }
        Payment updated = paymentRepository.save(payment);
        Payment withRelations = paymentRepository.findByIdWithRelationships(updated.getId()).orElse(updated);
        return paymentMapper.toResponse(withRelations);
    }

    @Override
    public PaymentResponse deletePayment(UUID id) {
        log.info("Deleting payment: id={}", id);
        Payment payment = findPaymentById(id);
        payment.softDelete();
        payment = paymentRepository.save(payment);
        return paymentMapper.toResponse(payment);
    }

    private String determineReferenceNumber(PaymentCreateRequest request) {
        if (request.getReferenceNumber() != null && !request.getReferenceNumber().trim().isEmpty()) {
            return request.getReferenceNumber().trim();
        }
        return referenceGenerator.generateUniqueReference();
    }

    private PaymentResponse createSubscriptionPaymentStubbed(String referenceNumber) {
        log.warn("SUBSCRIPTION payment type is no longer supported - this feature has been removed. Reference: {}", referenceNumber);
        throw new UnsupportedOperationException("SUBSCRIPTION payment type is no longer supported. Use USER_PLAN or OTHER instead.");
    }

    private PaymentResponse createBusinessPaymentStubbed(String referenceNumber) {
        log.warn("BUSINESS_RECORD payment type is no longer supported - this feature has been removed. Reference: {}", referenceNumber);
        throw new UnsupportedOperationException("BUSINESS_RECORD payment type is no longer supported. Use USER_PLAN or OTHER instead.");
    }


    private PaymentResponse createUserPlanPayment(PaymentCreateRequest request, String referenceNumber) {
        log.info("Creating USER_PLAN payment type");
        Payment payment = paymentMapper.toEntity(request);
        payment.setReferenceNumber(referenceNumber);
        return savePayment(payment);
    }

    private PaymentResponse createRefundPayment(PaymentCreateRequest request, String referenceNumber) {
        log.info("Creating REFUND payment type");
        Payment payment = paymentMapper.toEntity(request);
        payment.setReferenceNumber(referenceNumber);
        return savePayment(payment);
    }

    private PaymentResponse createOtherPayment(PaymentCreateRequest request, String referenceNumber) {
        log.info("Creating OTHER payment type");
        Payment payment = paymentMapper.toEntity(request);
        payment.setReferenceNumber(referenceNumber);
        return savePayment(payment);
    }

    private PaymentResponse savePayment(Payment payment) {
        Double rate = exchangeRateService.getCurrentActiveRate().getUsdToKhrRate();
        payment.calculateAmountKhr(rate);
        Payment saved = paymentRepository.save(payment);
        Payment withRelations = paymentRepository.findByIdWithRelationships(saved.getId()).orElse(saved);
        return paymentMapper.toResponse(withRelations);
    }

    private Payment findPaymentById(UUID id) {
        return paymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new NotFoundException("Payment not found"));
    }
}
