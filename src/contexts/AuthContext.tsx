import { createContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../lib/firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: { id: string; name: string; email: string; photoURL?: string } | null;
  firebaseUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserContext: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
  updateUserContext: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const user = firebaseUser
    ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "User",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || undefined,
      }
    : null;

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserContext = () => {
    // No-op — Firebase Auth updates are emitted via onAuthStateChanged
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
}
