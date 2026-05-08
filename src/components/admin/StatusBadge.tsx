import { Badge } from '@/components/ui/badge';

const styles: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-100 border-yellow-300',
  aprovado: 'bg-green-100 text-green-900 hover:bg-green-100 border-green-300',
  rejeitado: 'bg-red-100 text-red-900 hover:bg-red-100 border-red-300',
  em_contato: 'bg-blue-100 text-blue-900 hover:bg-blue-100 border-blue-300',
  ativo: 'bg-green-100 text-green-900 hover:bg-green-100 border-green-300',
  encerrado: 'bg-muted text-muted-foreground hover:bg-muted border-border',
};

const labels: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  em_contato: 'Em Contato',
  ativo: 'Ativo',
  encerrado: 'Encerrado',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={styles[status] || ''}>
      {labels[status] || status}
    </Badge>
  );
}
