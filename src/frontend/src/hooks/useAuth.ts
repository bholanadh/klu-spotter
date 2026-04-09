import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const { login, clear, isLoginSuccess, identity, loginStatus } =
    useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Login error:", err);
      if (err.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return {
    isAuthenticated,
    isLoginSuccess,
    isLoggingIn,
    identity,
    login: handleLogin,
    logout: handleLogout,
    principal: identity?.getPrincipal(),
  };
}
