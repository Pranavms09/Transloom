import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  user: { id: string; name: string; email: string; photoURL?: string } | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserContext: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserContext: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use a mocked user for the ClaimLens MVP so Firebase isn't required to test it
  const [user, setUser] = useState<AuthContextType["user"]>({
    id: "mock-user-123",
    name: "Demo User",
    email: "demo@claimlens.com",
  });
  const [loading] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    // We already set user synchronously above so loading is false
  }, [refreshSeed]);

  const logout = async () => {
    // For demo purposes, we will just set user to null
    setUser(null);
  };

  const updateUserContext = () => {
    setRefreshSeed((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}
