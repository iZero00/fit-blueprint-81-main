import { useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTreinosDia } from '@/hooks/useTreinos';
import { useTreinoFotos, type TreinoFoto } from '@/hooks/useTreinoFotos';
import { Image as ImageIcon, Loader2, Scale, X, Check, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function GaleriaPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: treinos } = useTreinosDia(profile?.id);
  const { data: fotos, isLoading } = useTreinoFotos(profile?.id);

  const [selectedFoto, setSelectedFoto] = useState<TreinoFoto | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonFotos, setComparisonFotos] = useState<TreinoFoto[]>([]);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setComparisonFotos([]);
    setShowComparisonDialog(false);
  };

  const handleFotoClick = (foto: TreinoFoto) => {
    if (isCompareMode) {
      setComparisonFotos((prev) => {
        const isSelected = prev.some((p) => p.id === foto.id);
        if (isSelected) {
          return prev.filter((p) => p.id !== foto.id);
        }
        if (prev.length >= 4) {
          toast.info('Selecione apenas 4 fotos para comparar');
          return prev;
        }
        return [...prev, foto];
      });
    } else {
      setSelectedFoto(foto);
    }
  };

  const openComparison = () => {
    if (comparisonFotos.length < 2) return;
    setShowComparisonDialog(true);
  };

  const handleDownloadComparison = async () => {
    if (!comparisonRef.current) return;

    try {
      setIsDownloading(true);
      const canvas = await html2canvas(comparisonRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff', // Ensure white background
        scale: 2, // Better quality
      });

      const link = document.createElement('a');
      link.download = `evolucao-bassinifit-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download iniciado!');
    } catch (error) {
      console.error('Error downloading comparison:', error);
      toast.error('Erro ao baixar o comparativo. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
          
          {fotosOrdenadas.length > 0 && (
            <Button
              variant={isCompareMode ? "secondary" : "outline"}
              onClick={toggleCompareMode}
              className="gap-2"
            >
              {isCompareMode ? (
                <>
                  <X className="h-4 w-4" />
                  Cancelar Comparação
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Comparar Fotos
                </>
              )}
            </Button>
          )}
        </div>

        {isCompareMode && (
          <div className="bg-muted/50 border border-primary/20 rounded-xl p-4 flex items-center justify-between sticky top-4 z-10 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {comparisonFotos.length} de 4 fotos selecionadas
              </span>
            </div>
            <Button 
              size="sm" 
              onClick={openComparison}
              disabled={comparisonFotos.length < 2}
            >
              Visualizar Comparação
            </Button>
          </div>
        )}

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
            {fotosOrdenadas.map((foto) => {
              const isSelected = comparisonFotos.some(p => p.id === foto.id);
              return (
                <div
                  key={foto.id}
                  className={cn(
                    "bg-card rounded-xl overflow-hidden border card-hover flex flex-col relative transition-all",
                    isCompareMode && "cursor-pointer",
                    isSelected && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => isCompareMode && handleFotoClick(foto)}
                >
                  {isCompareMode && isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 z-10 shadow-md">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={(e) => {
                      if (isCompareMode) {
                        e.stopPropagation(); // Let parent div handle it
                        handleFotoClick(foto);
                      } else {
                        setSelectedFoto(foto);
                      }
                    }}
                  >
                    <img
                      src={foto.foto_url}
                      alt={getTreinoNome(foto.treino_dia_id)}
                      className={cn(
                        "w-full h-48 object-cover transition-opacity",
                        isCompareMode && !isSelected && comparisonFotos.length >= 4 && "opacity-50"
                      )}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Single Photo Dialog */}
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

      {/* Comparison Dialog */}
      <Dialog
        open={showComparisonDialog}
        onOpenChange={setShowComparisonDialog}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="text-left">
                <DialogTitle>Comparação de Evolução</DialogTitle>
                <DialogDescription>
                  Visualize sua evolução comparando as fotos lado a lado.
                </DialogDescription>
              </DialogHeader>
              <Button 
                onClick={handleDownloadComparison}
                disabled={isDownloading}
                className="gap-2 shrink-0"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Baixar Comparativo</span>
                <span className="sm:hidden">Baixar</span>
              </Button>
            </div>
            
            <div ref={comparisonRef} className="bg-background p-2 rounded-lg">
              {comparisonFotos.length >= 2 && (() => {
                const sortedComparison = [...comparisonFotos].sort((a, b) => 
                  new Date(a.data_foto).getTime() - new Date(b.data_foto).getTime()
                );
                
                return (
                  <div className="grid grid-cols-2 gap-4">
                    {sortedComparison.map((foto, index) => (
                      <div key={foto.id} className="space-y-2">
                        <div className="relative aspect-[3/4] bg-black/5 rounded-lg overflow-hidden border">
                          <img
                            src={foto.foto_url}
                            alt={`Foto ${index + 1}`}
                            crossOrigin="anonymous"
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{formatDate(foto.data_foto)}</p>
                          <p className="text-xs text-muted-foreground">{getTreinoNome(foto.treino_dia_id)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
