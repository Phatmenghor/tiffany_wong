"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LoginModal } from "@/components/shared/modal/login-modal";
import { RegisterModal } from "@/components/shared/modal/register-modal";

interface AuthModalContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  openLoginModal: () => {},
  openRegisterModal: () => {},
});

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthModalContext.Provider
      value={{
        openLoginModal: () => setShowLogin(true),
        openRegisterModal: () => setShowRegister(true),
      }}
    >
      {children}
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal
        open={showRegister}
        onOpenChange={setShowRegister}
        onLoginClick={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
