import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  fetchCurrentUser,
  loginOrRegister,
  logout,
} from "@/server/auth/auth.actions";
import { LoginData } from "@/types/auth.type";
import { Result } from "@/types/server.types";

function parseResult<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(String(result.error));
  }
  return result.value;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetchCurrentUser();
      if (!res.ok) {
        if (res.error === "UNAUTHORIZED") return null;
        else throw new Error(String(res.error));
      }
      return res.value;
    },
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
    mutationFn: async (data: LoginData) => {
      const res = await loginOrRegister(data);
      return parseResult(res);
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      options?.onSuccess?.(...args);
    },
  });
}

export function useLogout(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (...args) => {
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      options?.onSuccess?.(...args);
    },
  });
}
