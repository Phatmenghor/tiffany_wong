import { CustomButton, CustomButtonProps } from "@/components/shared/button/custom-button";

export function CancelButton({
  children = "Cancel",
  variant = "outline",
  ...props
}: CustomButtonProps) {
  return (
    <CustomButton variant={variant} {...props}>
      {children}
    </CustomButton>
  );
}

export type { CustomButtonProps };
