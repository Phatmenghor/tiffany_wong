'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfilePageSkeleton() {
  return (
    <div className="py-[0.65rem] sm:py-[1.3rem] space-y-[0.975rem]">
      {/* Header Section */}
      <div className="space-y-[0.325rem]">
        <Skeleton className="h-[1.625rem] w-[7.8rem]" />
        <Skeleton className="h-[0.65rem] w-[13rem]" />
      </div>

      {/* Avatar and Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-[0.65rem]">
            <Skeleton className="w-[3.9rem] h-[3.9rem] rounded-full" />
            <div className="flex-1 space-y-[0.325rem]">
              <Skeleton className="h-[0.975rem] w-[5.2rem]" />
              <Skeleton className="h-[0.65rem] w-[7.8rem]" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-[0.975rem] w-[6.5rem]" />
        </CardHeader>
        <CardContent className="space-y-[0.975rem]">
          {/* Row 1: First Name, Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem]">
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[3.9rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[3.9rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
          </div>

          {/* Row 2: Email, Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem]">
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[2.6rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[5.2rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
          </div>

          {/* Row 3: Nickname, Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[0.65rem]">
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[3.9rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
            <div className="space-y-[0.325rem]">
              <Skeleton className="h-[0.65rem] w-[3.25rem]" />
              <Skeleton className="h-[1.625rem] w-full" />
            </div>
          </div>

          {/* Row 4: Date of Birth, Full Row */}
          <div className="space-y-[0.325rem]">
            <Skeleton className="h-[0.65rem] w-[5.2rem]" />
            <Skeleton className="h-[1.625rem] w-full" />
          </div>

          {/* Button Row */}
          <div className="flex gap-[0.65rem] justify-end pt-[0.65rem]">
            <Skeleton className="h-[1.625rem] w-[3.9rem]" />
            <Skeleton className="h-[1.625rem] w-[3.9rem]" />
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-[0.975rem] w-[6.5rem]" />
        </CardHeader>
        <CardContent className="space-y-[0.65rem]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-[0.65rem] w-[7.8rem]" />
            <Skeleton className="h-[1.625rem] w-[5.2rem]" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-[0.65rem] w-[5.2rem]" />
            <Skeleton className="h-[1.625rem] w-[5.2rem]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
