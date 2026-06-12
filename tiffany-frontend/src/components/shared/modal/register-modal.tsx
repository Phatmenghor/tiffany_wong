"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import {
  registerCustomerService,
  loginService,
} from "@/redux/features/auth/store/thunks/auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

const registerSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  phone: z.string().min(1, "Phone number is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterModal({ open, onOpenChange, onLoginClick }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const businessName = BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME;
  const isAnyLoading = isLoading;

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userIdentifier: "", password: "", confirmPassword: "", phone: "" },
  });

  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      await dispatch(
        registerCustomerService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          phoneNumber: values.phone,
          userType: "CUSTOMER",
        }),
      ).unwrap();

      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "CUSTOMER",
        }),
      ).unwrap();

      showToast.success("Welcome! Your account has been created successfully.");
      onOpenChange(false);
      registerForm.reset();
      window.location.reload();
    } catch (err: any) {
      showToast.error(err || "Registration failed. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* Header */}
        <DialogHeader className="text-left">
          <div>
            <DialogTitle className="text-[14px]">{businessName}</DialogTitle>
            <p className="text-[11px] text-muted-foreground mt-[0.1625rem]">
              Create a new account
            </p>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body - Register Form */}
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-[0.65rem]">
          <TextField
            name="userIdentifier"
            label="Email or Username"
            placeholder="name@example.com"
            control={registerForm.control}
            error={registerForm.formState.errors.userIdentifier}
            disabled={isAnyLoading}
            required
          />

          <TextField
            name="phone"
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            control={registerForm.control}
            error={registerForm.formState.errors.phone}
            disabled={isAnyLoading}
            required
          />

          <PasswordField
            name="password"
            label="Password"
            placeholder="Enter password"
            control={registerForm.control}
            error={registerForm.formState.errors.password}
            disabled={isAnyLoading}
            required
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
            control={registerForm.control}
            error={registerForm.formState.errors.confirmPassword}
            disabled={isAnyLoading}
            required
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword((v) => !v)}
          />

          {/* Footer - Submit Button */}
          <DialogFooter className="pt-[0.325rem]">
            <Button
              type="submit"
              className="w-full h-[1.7875rem] font-semibold"
              disabled={isAnyLoading}
            >
              {isLoading && <Loader2 className="mr-[0.325rem] h-[0.65rem] w-[0.65rem] animate-spin" />}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </DialogFooter>

          <p className="text-center text-[11px] text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onLoginClick?.();
              }}
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
