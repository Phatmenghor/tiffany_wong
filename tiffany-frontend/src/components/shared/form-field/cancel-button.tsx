import { CustomButton, CustomButtonProps } from "@/components/shared/button/custom-button";

export function CancelButton({ children = "Cancel", ...props }: CustomButtonProps) {
  return <CustomButton {...props}>{children}</CustomButton>;
}

export type { CustomButtonProps };
