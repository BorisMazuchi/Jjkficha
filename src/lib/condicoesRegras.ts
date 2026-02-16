/**
 * Condições do livro Feiticeiros e Maldições v2.5 — Cap. 12, p.317–319.
 * Grupos: Físicas, Incapacitação, Mentais, Movimento, Sensoriais, Vulnerabilidade.
 */

export type GrupoCondicao =
  | "Físicas"
  | "Incapacitação"
  | "Mentais"
  | "Movimento"
  | "Sensoriais"
  | "Vulnerabilidade"

export interface CondicaoRegra {
  nome: string
  grupo: GrupoCondicao
  descricao: string
  pagina: string
}

export const CONDICOES_POR_GRUPO: Record<GrupoCondicao, CondicaoRegra[]> = {
  Físicas: [
    { nome: "Condenado", grupo: "Físicas", descricao: "Custo em PE de todas as habilidades aumentado em 1.", pagina: "p.318" },
    { nome: "Engasgando", grupo: "Físicas", descricao: "Alvo fica mudo e precisa segurar o Ar.", pagina: "p.318" },
    { nome: "Enjoado", grupo: "Físicas", descricao: "Não pode converter ações dentro da Hierarquia de Ações.", pagina: "p.318" },
    { nome: "Envenenado", grupo: "Físicas", descricao: "-2 em jogadas de ataque, TR e testes de perícia enquanto o veneno durar.", pagina: "p.318" },
    { nome: "Sangramento", grupo: "Físicas", descricao: "Perda de vida no início do turno; TR Fortitude no final para encerrar. CD e valor dependem do causador.", pagina: "p.318" },
    { nome: "Sofrendo", grupo: "Físicas", descricao: "-5 em testes de concentração e Prestidigitação (rituais); -3 m de movimento.", pagina: "p.318" },
  ],
  Incapacitação: [
    { nome: "Atordoado", grupo: "Incapacitação", descricao: "Fica desprevenido e não pode realizar ações ou reações.", pagina: "p.318" },
    { nome: "Inconsciente", grupo: "Incapacitação", descricao: "Não pode agir ou reagir; caído; larga o que segura; falha em TR Reflexos; ataques acertam e são críticos.", pagina: "p.318" },
    { nome: "Paralisado", grupo: "Incapacitação", descricao: "Não pode realizar ações ou reações (exceto mentais); -10 Defesa; falha em TR Reflexos; ataques corpo a corpo que acertam são críticos.", pagina: "p.318" },
    { nome: "Indefeso", grupo: "Incapacitação", descricao: "Fica Imóvel e atordoado. Ação completa ao alcance de toque: matar ou causar Ferimento Complexo.", pagina: "p.318" },
  ],
  Mentais: [
    { nome: "Abalado", grupo: "Mentais", descricao: "-1 em jogadas de ataque e testes de perícia.", pagina: "p.318" },
    { nome: "Amedrontado", grupo: "Mentais", descricao: "-3 em jogadas de ataque e testes de perícia (evolução de Abalado).", pagina: "p.318" },
    { nome: "Aterrorizado", grupo: "Mentais", descricao: "Não pode se aproximar voluntariamente da criatura que infligiu a condição.", pagina: "p.318" },
    { nome: "Confuso", grupo: "Mentais", descricao: "Comportamento aleatório; -4 em Fortitude/Atletismo para manter-se de pé; movimento involuntário (1d4 direção a cada 1,5 m).", pagina: "p.318" },
    { nome: "Enfeitiçado", grupo: "Mentais", descricao: "Prejuízo de -2 em todos os testes contra quem enfeitiçou.", pagina: "p.318" },
  ],
  Movimento: [
    { nome: "Agarrado", grupo: "Movimento", descricao: "Fica desprevenido e imóvel. Ataques a distância contra alvo agarrado: 50% de acertar o errado.", pagina: "p.319" },
    { nome: "Caído", grupo: "Movimento", descricao: "-3 em ataques corpo a corpo; só 4,5 m rastejando ou ação de movimento para levantar; -3 Defesa corpo a corpo, +3 Defesa a distância.", pagina: "p.319" },
    { nome: "Enredado", grupo: "Movimento", descricao: "Deslocamento à metade; -2 na Defesa e em rolagens de ataque.", pagina: "p.319" },
    { nome: "Imóvel", grupo: "Movimento", descricao: "Não pode usar Andar, Esgueirar, Levantar, Pular; pode Sacar. Não recebe Deslocamento de qualquer fonte.", pagina: "p.319" },
    { nome: "Lento", grupo: "Movimento", descricao: "Todo movimento (deslocamento) reduzido à metade.", pagina: "p.319" },
  ],
  Sensoriais: [
    { nome: "Cego", grupo: "Sensoriais", descricao: "Surpreso e Lento; falha em testes de visão; -5 Percepção; alvos recebem Camuflagem Total (50% falha).", pagina: "p.319" },
    { nome: "Desorientado", grupo: "Sensoriais", descricao: "Não pode usar reações contra a próxima ação ofensiva ou ataques de oportunidade; encerra após o efeito.", pagina: "p.319" },
    { nome: "Desprevenido", grupo: "Sensoriais", descricao: "-3 na Defesa e em TR de Reflexos.", pagina: "p.319" },
    { nome: "Invisível", grupo: "Sensoriais", descricao: "Não pode ser visto; +10 Furtividade; ao receber, pode Esconder como Ação Livre; vantagem na iniciativa se invisível ao rolar.", pagina: "p.319" },
    { nome: "Surdo", grupo: "Sensoriais", descricao: "Falha em testes de audição; -5 em Iniciativa (e valor atual em combate).", pagina: "p.319" },
    { nome: "Surpreso", grupo: "Sensoriais", descricao: "Desprevenido e não pode usar reações contra quem surpreendeu.", pagina: "p.319" },
  ],
  Vulnerabilidade: [
    { nome: "Exposto", grupo: "Vulnerabilidade", descricao: "Ataques recebem +4; ao acertar, dano adicional igual ao nível do atacante por rolagem de dano.", pagina: "p.319" },
    { nome: "Fragilizado", grupo: "Vulnerabilidade", descricao: "Redução de Dano e resistências anuladas (imunidades mantidas); não pode aumentar RD nem ganhar resistência.", pagina: "p.319" },
  ],
}

/** Todas as condições oficiais (nome único) para uso em listas/toggle. */
export const TODAS_CONDICOES_OFICIAIS: string[] = Object.values(CONDICOES_POR_GRUPO).flatMap(
  (arr) => arr.map((c) => c.nome)
)

export function getCondicaoRegra(nome: string): CondicaoRegra | undefined {
  for (const arr of Object.values(CONDICOES_POR_GRUPO)) {
    const found = arr.find((c) => c.nome === nome)
    if (found) return found
  }
  return undefined
}

/** Condições customizadas continuam no formato "Outro: Nome" */
export function ehCondicaoOutro(condicao: string): boolean {
  return condicao.startsWith("Outro:")
}
