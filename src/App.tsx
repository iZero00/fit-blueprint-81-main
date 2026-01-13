import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Aluno Pages
import AlunoDashboard from "./pages/aluno/Dashboard";
import TreinoDia from "./pages/aluno/TreinoDia";
import PerfilAluno from "./pages/aluno/Perfil";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAlunos from "./pages/admin/Alunos";
import AdminExercicios from "./pages/admin/Exercicios";
import AdminGruposMusculares from "./pages/admin/GruposMusculares";
import AdminTreinos from "./pages/admin/Treinos";
import AdminCalculadoras from "./pages/admin/Calculadoras";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'aluno')[];
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole(user?.id);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Default to 'aluno' if no role found yet
  const userRole = role || 'aluno';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

// Public Route (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user && !roleLoading) {
    const userRole = role || 'aluno';
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Aluno Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['aluno', 'admin']}>
            <AlunoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treino/:treinoId"
        element={
          <ProtectedRoute allowedRoles={['aluno', 'admin']}>
            <TreinoDia />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute allowedRoles={['aluno', 'admin']}>
            <PerfilAluno />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/alunos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAlunos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exercicios"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminExercicios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grupos-musculares"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminGruposMusculares />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/treinos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminTreinos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/calculadoras"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCalculadoras />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
