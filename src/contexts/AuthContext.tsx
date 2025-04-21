
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DummyUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  session: { user: DummyUser } | null;
  user: DummyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mockUser = (email: string): DummyUser => ({
    id: btoa(email),
    email,
    name: email.split("@")[0] || "Demo User",
    role: "user",
  });

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Simulate a delay for user experience
    await new Promise((res) => setTimeout(res, 400));
    setUser(mockUser(email));
    navigate("/");
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 400));
    setUser(mockUser(email));
    // No email verification, just set user
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 200));
    setUser(null);
    navigate("/auth");
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session: user ? { user } : null,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
