import { createContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../lib/firebase";

interface AuthContextType {
  user: { id: string; name: string; email: string; photoURL?: string } | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserContext: () => void; // Trigger a manual refresh if needed
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserContext: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState(true);
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name:
            firebaseUser.displayName || firebaseUser.email || "Unknown User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [refreshSeed]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error", error);
    }
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
