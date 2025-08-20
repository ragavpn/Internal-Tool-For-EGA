import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee, LoginCredentials, InsertEmployee } from "@shared/schema";

export function useAuth() {
  const { data: employee, isLoading, error } = useQuery<Employee>({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest("POST", "/api/auth/login", credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (employeeData: InsertEmployee) => 
      apiRequest("POST", "/api/auth/register", employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.clear();
      window.location.reload();
    },
  });

  return {
    employee,
    isLoading,
    isAuthenticated: !!employee,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}