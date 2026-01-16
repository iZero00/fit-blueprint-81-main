import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <p className="text-sm font-medium text-primary/80">Erro 404</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A página que você tentou acessar não existe ou foi movida.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ir para o login
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
