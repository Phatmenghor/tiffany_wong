"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextAreaField } from "@/components/shared/form-field/textarea-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { showToast } from "@/components/shared/common/show-toast";
import { axiosClientWithAuth } from "@/utils/axios/axios-client";
import {
  selectSelectedOrder,
  selectOrderAdminIsFetchingDetail,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";

// Validation schema
const updateOrderSchema = z.object({
  orderStatus: z.string().min(1, "Order status is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  customerNote: z.string().optional(),
});

type UpdateOrderData = z.infer<typeof updateOrderSchema>;

interface OrderUpdateModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid", value: "PAID" },
  { label: "Unpaid", value: "UNPAID" },
  { label: "Refunded", value: "REFUNDED" },
];

export function OrderUpdateModal({
  orderId,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderUpdateModalProps) {
  const dispatch = useAppDispatch();
  const orderData = useAppSelector(selectSelectedOrder);
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrderData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      orderStatus: "PENDING",
      paymentStatus: "UNPAID",
      customerNote: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && orderData) {
      reset({
        orderStatus: orderData.orderStatus || "PENDING",
        paymentStatus: orderData.paymentStatus || "UNPAID",
        customerNote: orderData.customerNote || "",
      });
    }
  }, [isOpen, orderData, reset]);

  const handleClose = () => {
    reset();
    dispatch(clearSelectedOrder());
    onClose();
  };

  const onSubmit = async (data: UpdateOrderData) => {
    if (!orderId) return;

    setIsSaving(true);
    try {
      const updatePayload = {
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus,
        customerNote: data.customerNote,
      };

      const response = await axiosClientWithAuth.put(
        `/api/v1/orders/${orderId}`,
        updatePayload
      );

      if (response.status === 200 || response.status === 204) {
        // Simple toast message (short details only)
        const details: Record<string, any> = {
          'Order': orderId.substring(0, 8),
          'Status': data.orderStatus,
          'Payment': data.paymentStatus,
        };

        showToast.order({
          title: 'Order Updated',
          message: 'Status and payment information updated.',
          details,
          duration: 5000,
        });
        if (onOrderUpdated) {
          onOrderUpdated();
        }
        handleClose();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error updating order";
      showToast.error({
        title: 'Failed to Update Order',
        message: errorMessage,
        details: {
          'Error Type': error?.response?.status === 404 ? 'Not Found' : 'Server Error',
          'Attempted At': new Date().toLocaleString(),
        },
      });
      console.error("Order update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 flex flex-col">
        <FormHeader
          title="Update Order"
          description="Update order status, payment, and notes"
          isCreate={false}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {/* Order Status */}
            <SelectField
              control={control}
              name="orderStatus"
              label="Order Status"
              placeholder="Select order status"
              options={ORDER_STATUS_OPTIONS}
              required
              disabled={isSaving || isFetchingDetail}
              error={errors.orderStatus}
            />

            {/* Payment Status */}
            <SelectField
              control={control}
              name="paymentStatus"
              label="Payment Status"
              placeholder="Select payment status"
              options={PAYMENT_STATUS_OPTIONS}
              required
              disabled={isSaving || isFetchingDetail}
              error={errors.paymentStatus}
            />

            {/* Customer Note */}
            <TextAreaField
              control={control}
              name="customerNote"
              label="Customer Note"
              placeholder="Enter customer note (optional)"
              disabled={isSaving || isFetchingDetail}
              error={errors.customerNote}
              rows={3}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isSaving}
            isDirty={isDirty}
            isCreate={false}
            updateMessage={isSaving ? "Updating..." : "Updating order..."}
          >
            <CancelButton
              onClick={handleClose}
              disabled={isSaving}
              variant="outline"
            >
              Cancel
            </CancelButton>
            <SubmitButton
              isSubmitting={isSaving}
              isDirty={isDirty}
              isCreate={false}
              updateText="Update Order"
              submittingUpdateText={isSaving ? "Updating..." : "Updating order..."}
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
