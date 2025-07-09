import React from "react";
import { useAuthorization } from "../hooks/useAuthorization";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // Since we're using hooks instead of context providers,
  // we'll just return the children directly
  return <>{children}</>;
}

// Create a wrapper component that provides the authorization context
export function AuthorizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
