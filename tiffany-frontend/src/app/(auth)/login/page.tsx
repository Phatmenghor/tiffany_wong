"use client";

import { useState } from "react";
import Image from "next/image";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { loginService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { ROUTES } from "@/constants/app-routes/routes";
import { showToast } from "@/components/shared/common/show-toast";
import { appImages } from "@/constants/app-resource/icons/app-images";

const formSchema = z.object({
  userIdentifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { isLoading, error, dispatch } = useAuthState();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIdentifier: "phatmenghor19@gmail.com",
      password: "88889999",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      await dispatch(
        loginService({
          userIdentifier: values.userIdentifier,
          password: values.password,
          userType: "OWNER",
        }),
      ).unwrap();
      router.replace(ROUTES.ADMIN.DASHBOARD);
    } catch (err: any) {
      showToast.error(err?.message || err || error || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side — decorative image (desktop only) */}
      <div className="hidden flex-1 relative lg:block">
        <Image
          src={appImages.CpBank}
          alt="CPBank Background"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Right side — login form */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-[0.65rem]">
        <Card className="w-full max-w-sm border border-gray-200 shadow-2xl">
          <CardHeader className="space-y-[0.1625rem] pb-[0.65rem] sm:pb-[0.975rem]">
            <h1 className="text-[14px] sm:text-[1.21875rem] font-bold text-gray-900">
              Admin Panel Login
            </h1>
            <p className="text-[11px] text-gray-600">
              Enter your credentials to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[0.65rem]">
              <TextField
                name="userIdentifier"
                label="Email or Username"
                placeholder="name@example.com"
                control={form.control as any}
                error={form.formState.errors.userIdentifier}
                disabled={isLoading}
                required
              />

              <PasswordField
                name="password"
                label="Password"
                placeholder="Enter your password"
                control={form.control as any}
                error={form.formState.errors.password}
                disabled={isLoading}
                required
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />

              <Button
                type="submit"
                className="w-full h-[1.7875rem] mt-[0.325rem] font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-[0.325rem] h-[0.65rem] w-[0.65rem] animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-[0.8125rem]">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-[0.325rem] text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-500 mt-[0.8125rem]">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
