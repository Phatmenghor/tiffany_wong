'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CheckoutPageSkeleton() {
  return (
    <div className="py-[0.65rem] sm:py-[1.3rem] pb-[6.5rem] sm:pb-[1.3rem] space-y-[0.975rem]">
      {/* Header Section */}
      <div className="space-y-[0.325rem]">
        <Skeleton className="h-[1.625rem] w-[7.8rem]" />
        <Skeleton className="h-[0.65rem] w-[13rem]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[0.975rem]">
        {/* Main Content - Checkout Items */}
        <div className="lg:col-span-2 space-y-[0.975rem]">
          {/* Items Section */}
          <Card>
            <CardHeader>
              <Skeleton className="h-[0.975rem] w-[6.5rem]" />
            </CardHeader>
            <CardContent className="space-y-[0.65rem]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-[0.65rem] pb-[0.65rem] border-b last:border-b-0">
                  <Skeleton className="w-[3.9rem] h-[3.9rem] rounded-[0.1625rem]" />
                  <div className="flex-1 space-y-[0.325rem]">
                    <Skeleton className="h-[0.8125rem] w-[7.8rem]" />
                    <Skeleton className="h-[0.65rem] w-[5.2rem]" />
                    <Skeleton className="h-[0.65rem] w-[3.9rem]" />
                  </div>
                  <Skeleton className="w-[3.25rem] h-[1.625rem]" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Address Section */}
          <Card>
            <CardHeader>
              <Skeleton className="h-[0.975rem] w-[7.8rem]" />
            </CardHeader>
            <CardContent className="space-y-[0.65rem]">
              <div className="border rounded-[0.325rem] p-[0.65rem] space-y-[0.4875rem]">
                <Skeleton className="h-[0.8125rem] w-[6.5rem]" />
                <Skeleton className="h-[0.65rem] w-[10.4rem]" />
                <Skeleton className="h-[0.65rem] w-[7.8rem]" />
                <div className="flex gap-[0.325rem] pt-[0.325rem]">
                  <Skeleton className="h-[1.3rem] w-[3.25rem]" />
                  <Skeleton className="h-[1.3rem] w-[3.9rem]" />
                </div>
              </div>
              <Skeleton className="h-[1.625rem] w-[6.5rem]" />
            </CardContent>
          </Card>

          {/* Order Notes Section */}
          <Card>
            <CardHeader>
              <Skeleton className="h-[0.975rem] w-[6.5rem]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[3.9rem] w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-[0.65rem]">
            <CardHeader>
              <Skeleton className="h-[0.975rem] w-[6.5rem]" />
            </CardHeader>
            <CardContent className="space-y-[0.65rem]">
              {/* Summary Items */}
              <div className="space-y-[0.4875rem]">
                <div className="flex justify-between">
                  <Skeleton className="h-[0.65rem] w-[3.9rem]" />
                  <Skeleton className="h-[0.65rem] w-[3.25rem]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-[0.65rem] w-[3.25rem]" />
                  <Skeleton className="h-[0.65rem] w-[3.25rem]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-[0.65rem] w-[3.9rem]" />
                  <Skeleton className="h-[0.65rem] w-[3.25rem]" />
                </div>
              </div>

              <div className="border-t pt-[0.4875rem]">
                <div className="flex justify-between mb-[0.65rem]">
                  <Skeleton className="h-[0.8125rem] w-[3.25rem]" />
                  <Skeleton className="h-[0.8125rem] w-[3.9rem]" />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-[0.325rem]">
                <Skeleton className="h-[0.65rem] w-[5.2rem]" />
                <div className="space-y-[0.325rem]">
                  <Skeleton className="h-[1.625rem] w-full" />
                  <Skeleton className="h-[1.625rem] w-full" />
                </div>
              </div>

              {/* Checkout Button */}
              <Skeleton className="h-[1.95rem] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
