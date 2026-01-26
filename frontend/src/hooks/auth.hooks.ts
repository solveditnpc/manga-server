import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  fetchCurrentUser,
  handleLogin,
  handleLogout,
} from "@/client/auth.client";
import { LoginData } from "@/types/auth.type";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
  });
}

export function useIsAuthenticated() {
  const { data } = useCurrentUser();
  return !!data;
}

export function useLogin(options?: UseMutationOptions<void, Error, LoginData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: handleLogin,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useLogout(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: handleLogout,
    onSuccess: (...args) => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      options?.onSuccess?.(...args);
    },
  });
}
