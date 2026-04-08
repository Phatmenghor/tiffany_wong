/**
 * Telegram Login Widget Placeholder
 * This is a stub component for Telegram authentication
 * Implement with actual Telegram widget when ready
 */

import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";

interface TelegramLoginButtonProps {
  botUsername: string;
  onSuccess: (data: TelegramAuthData) => void;
}

export function TelegramLoginButton({
  botUsername,
  onSuccess,
}: TelegramLoginButtonProps) {
  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      Telegram login integration coming soon
    </div>
  );
}
