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
} from "@/redux/features/auth/store/thunks/auth-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppSelector } from '@/redux/store/hooks';
import { selectBusinessName } from "@/redux/features/business/store/selectors/business-settings-selector";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterModal({ open, onOpenChange, onLoginClick }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isLoading, dispatch } = useAuthState();
  const businessName = useAppSelector(selectBusinessName);
  const isAnyLoading = isLoading;

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function onRegisterSubmit(values: RegisterFormData) {
    try {
      const result = await dispatch(
        registerCustomerService({
          userIdentifier: values.email,
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phone,
          userType: "CUSTOMER",
        }),
      ).unwrap();

      if (result) {
        showToast.success("Welcome! Your account has been created successfully.");
        onOpenChange(false);
        registerForm.reset();
        window.location.reload();
      }
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
            <DialogTitle className="text-2xl">{businessName}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new account
            </p>
          </div>
        </DialogHeader>

        <Separator />

        {/* Body - Register Form */}
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          {/* First and Last Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              name="firstName"
              label="First Name"
              placeholder="John"
              control={registerForm.control}
              error={registerForm.formState.errors.firstName}
              disabled={isAnyLoading}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              control={registerForm.control}
              error={registerForm.formState.errors.lastName}
              disabled={isAnyLoading}
              required
            />
          </div>

          <TextField
            name="email"
            label="Email"
            placeholder="name@example.com"
            control={registerForm.control}
            error={registerForm.formState.errors.email}
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
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isAnyLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </DialogFooter>

          <p className="text-center text-sm text-muted-foreground">
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
