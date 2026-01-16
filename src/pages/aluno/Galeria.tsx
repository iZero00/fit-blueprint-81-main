import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia } from '@/hooks/useTreinos';
import { useTreinoFotos, type TreinoFoto } from '@/hooks/useTreinoFotos';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function GaleriaPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: treinos } = useTreinosDia(profile?.id);
  const { data: fotos, isLoading } = useTreinoFotos(profile?.id);

  const [selectedFoto, setSelectedFoto] = useState<TreinoFoto | null>(null);

  const getTreinoNome = (treinoId: string) => {
    const treino = treinos?.find((t) => t.id === treinoId);
    if (!treino) return 'Treino';
    const upper = treino.nome.toUpperCase();
    if (upper === 'AQUECIMENTO') return 'Aquecimento';
    if (upper === 'CARDIO') return 'Cardio';
    return `Treino ${treino.nome}`;
  };

  const fotosOrdenadas = (fotos || []).slice().sort((a, b) => {
    if (a.data_foto === b.data_foto) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(b.data_foto).getTime() - new Date(a.data_foto).getTime();
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Galeria de Fotos</h1>
            <p className="text-sm text-muted-foreground">
              Veja as fotos que você registrou ao concluir seus treinos.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando fotos...</span>
            </div>
          </div>
        )}

        {!isLoading && fotosOrdenadas.length === 0 && (
          <div className="bg-card rounded-2xl p-8 text-center card-hover border border-dashed">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-60" />
            <h2 className="text-lg font-semibold mb-2">Nenhuma foto ainda</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ao concluir um treino, adicione uma foto. Ela aparecerá aqui com a
              data em que foi salva.
            </p>
          </div>
        )}

        {!isLoading && fotosOrdenadas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {fotosOrdenadas.map((foto) => (
              <div
                key={foto.id}
                className="bg-card rounded-xl overflow-hidden border card-hover flex flex-col"
              >
                <button
                  type="button"
                  className="block"
                  onClick={() => setSelectedFoto(foto)}
                >
                  <img
                    src={foto.foto_url}
                    alt={getTreinoNome(foto.treino_dia_id)}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </button>
                <div className="p-3 space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatDate(foto.data_foto)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getTreinoNome(foto.treino_dia_id)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        <Dialog
          open={!!selectedFoto}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedFoto(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            {selectedFoto && (
              <>
                <DialogHeader>
                  <DialogTitle>{formatDate(selectedFoto.data_foto)}</DialogTitle>
                  <DialogDescription>
                    {getTreinoNome(selectedFoto.treino_dia_id)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="w-full">
                    <img
                      src={selectedFoto.foto_url}
                      alt={getTreinoNome(selectedFoto.treino_dia_id)}
                      className="w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <a href={selectedFoto.foto_url} download>
                        Baixar foto
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
    </Layout>
  );
}
