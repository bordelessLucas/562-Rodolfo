import type { CreateArticleInput } from '@/src/domain/article';

export type SeedArticlePayload = {
  id: string;
  input: Omit<CreateArticleInput, 'createdBy' | 'createdByRole' | 'status'> & {
    status: 'published';
  };
};

export const MOCK_PUBLISHED_ARTICLES: SeedArticlePayload[] = [
  {
    id: 'seed_noticia_compressao',
    input: {
      title: 'Novidades no uso de compressão no lipedema',
      summary:
        'Resumo informativo sobre práticas atuais de compressão no dia a dia.',
      body: 'Este é um conteúdo mock de notícia para validar a área Explorar. Não substitui orientação de um profissional de saúde. Acompanhe sinais, conforto e adapte a rotina com acompanhamento adequado.',
      kind: 'noticia',
      coverUrl: null,
      externalUrl: null,
      sortOrder: 1,
      status: 'published',
    },
  },
  {
    id: 'seed_pesquisa_sinais',
    input: {
      title: 'Pesquisa: sinais precoces e qualidade de vida',
      summary:
        'Síntese educativa (mock) sobre estudos observacionais e autocuidado.',
      body: 'Conteúdo mock de pesquisa. Destaca a importância do registro diário de sintomas e da busca por avaliação profissional quando houver dúvidas. Fontes e dados reais serão vinculados quando a curadoria estiver disponível.',
      kind: 'pesquisa',
      coverUrl: null,
      externalUrl: null,
      sortOrder: 2,
      status: 'published',
    },
  },
  {
    id: 'seed_artigo_orientacao',
    input: {
      title: 'Artigo: organização da rotina de cuidados',
      summary: 'Texto curto com ideias práticas de organização semanal.',
      body: 'Artigo mock com tópicos: hidratação, movimento leve, registro no check-in e pausas. Use como referência educativa dentro do app, sempre em conjunto com o plano do seu profissional.',
      kind: 'artigo',
      coverUrl: null,
      externalUrl: null,
      sortOrder: 3,
      status: 'published',
    },
  },
];
