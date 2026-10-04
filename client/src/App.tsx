import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/Home";

export default function App() {
  return (
    <AuthProvider>
      <Home />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
