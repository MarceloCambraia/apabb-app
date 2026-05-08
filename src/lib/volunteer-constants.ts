export const NUCLEUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'df', label: 'Brasília - DF' },
  { value: 'sp', label: 'São Paulo - SP' },
  { value: 'rj', label: 'Rio de Janeiro - RJ' },
  { value: 'mg', label: 'Belo Horizonte - MG' },
  { value: 'rs', label: 'Porto Alegre - RS' },
  { value: 'ba', label: 'Salvador - BA' },
  { value: 'pr', label: 'Curitiba - PR' },
  { value: 'ce', label: 'Fortaleza - CE' },
  { value: 'pe', label: 'Recife - PE' },
  { value: 'go', label: 'Goiânia - GO' },
  { value: 'pa', label: 'Belém - PA' },
  { value: 'sc', label: 'Florianópolis - SC' },
  { value: 'es', label: 'Vitória - ES' },
  { value: 'rn', label: 'Natal - RN' },
  { value: 'se', label: 'Aracaju - SE' },
];

export const NUCLEUS_NAMES: Record<string, string> = Object.fromEntries(
  NUCLEUS_OPTIONS.map((n) => [n.value, n.label])
);

export const INTEREST_AREAS: { value: string; label: string }[] = [
  { value: 'educacao', label: 'Educação' },
  { value: 'arte', label: 'Arte e Cultura' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'tecnologia', label: 'Tecnologia' },
];

export const INTEREST_AREA_NAMES: Record<string, string> = Object.fromEntries(
  INTEREST_AREAS.map((a) => [a.value, a.label])
);

export const VOLUNTEER_STATUSES = ['pendente', 'aprovado', 'em_contato', 'rejeitado'] as const;
export type VolunteerStatus = typeof VOLUNTEER_STATUSES[number];

export const VOLUNTEER_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  em_contato: 'Em Contato',
  rejeitado: 'Rejeitado',
};
