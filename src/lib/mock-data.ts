export type Canal = "whatsapp" | "telegram" | "email";
export type EstadoLead = "novo" | "a_conversar" | "visita_marcada" | "escalado" | "fechado" | "perdido";
export type FaseKanban = "novos" | "qualificados" | "visita_marcada" | "encaminhados" | "fechados";

export interface Mensagem {
  id: string;
  de: "cliente" | "agente";
  texto: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  nome: string;
  contacto: string;
  canal: Canal;
  estado: EstadoLead;
  fase: FaseKanban;
  mensagens: Mensagem[];
  imoveisMostrados: string[];
  dataEntrada: string;
  notas: string;
}

export interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  localizacao: string;
  tipologia: string;
  area: number;
  quartos: number;
  casasBanho: number;
  descricao: string;
  imagem: string;
  ativo: boolean;
  vezesMostrado: number;
}

export interface Tarefa {
  id: string;
  leadId: string;
  leadNome: string;
  descricao: string;
  concluida: boolean;
  timestamp: string;
}

export interface Notificacao {
  id: string;
  tipo: "lead_quente" | "visita" | "escalado";
  mensagem: string;
  leadId: string;
  timestamp: string;
  lida: boolean;
}

const now = new Date();
const horasAtras = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const minAtras = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

export const imoveisMock: Imovel[] = [
  { id: "im1", titulo: "Apartamento T2 em Almada", preco: 195000, localizacao: "Almada", tipologia: "T2", area: 85, quartos: 2, casasBanho: 1, descricao: "Apartamento renovado com vista para o Tejo, próximo de transportes.", imagem: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 12 },
  { id: "im2", titulo: "Moradia T4 em Cascais", preco: 580000, localizacao: "Cascais", tipologia: "T4", area: 220, quartos: 4, casasBanho: 3, descricao: "Moradia com jardim e piscina, zona residencial tranquila.", imagem: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 8 },
  { id: "im3", titulo: "Estúdio T0 no Chiado", preco: 245000, localizacao: "Lisboa - Chiado", tipologia: "T0", area: 38, quartos: 0, casasBanho: 1, descricao: "Estúdio totalmente remodelado no coração de Lisboa.", imagem: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 15 },
  { id: "im4", titulo: "Apartamento T3 em Sintra", preco: 320000, localizacao: "Sintra", tipologia: "T3", area: 120, quartos: 3, casasBanho: 2, descricao: "Amplo apartamento com varanda e vista para a serra.", imagem: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 6 },
  { id: "im5", titulo: "T1 renovado em Benfica", preco: 175000, localizacao: "Lisboa - Benfica", tipologia: "T1", area: 55, quartos: 1, casasBanho: 1, descricao: "T1 com cozinha equipada, perto do Colombo.", imagem: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 9 },
  { id: "im6", titulo: "Penthouse T3 no Parque das Nações", preco: 495000, localizacao: "Lisboa - Parque das Nações", tipologia: "T3", area: 150, quartos: 3, casasBanho: 2, descricao: "Penthouse com terraço panorâmico e garagem dupla.", imagem: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 4 },
  { id: "im7", titulo: "Moradia T3 na Costa da Caparica", preco: 385000, localizacao: "Costa da Caparica", tipologia: "T3", area: 160, quartos: 3, casasBanho: 2, descricao: "A 5 minutos da praia, com quintal e churrasqueira.", imagem: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 7 },
  { id: "im8", titulo: "T2 com terraço em Oeiras", preco: 275000, localizacao: "Oeiras", tipologia: "T2", area: 90, quartos: 2, casasBanho: 1, descricao: "Apartamento moderno com terraço de 30m², zona calma.", imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", ativo: false, vezesMostrado: 3 },
  { id: "im9", titulo: "Loft T1 no Cais do Sodré", preco: 310000, localizacao: "Lisboa - Cais do Sodré", tipologia: "T1", area: 65, quartos: 1, casasBanho: 1, descricao: "Loft industrial com pé-direito duplo, junto ao rio.", imagem: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 11 },
  { id: "im10", titulo: "Apartamento T2 em Setúbal", preco: 155000, localizacao: "Setúbal", tipologia: "T2", area: 78, quartos: 2, casasBanho: 1, descricao: "Boa oportunidade de investimento, próximo do centro.", imagem: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", ativo: true, vezesMostrado: 2 },
];

export const leadsMock: Lead[] = [
  {
    id: "l1", nome: "Maria Silva", contacto: "+351912345678", canal: "whatsapp", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(2), notas: "", imoveisMostrados: ["im1", "im3"],
    mensagens: [
      { id: "m1", de: "cliente", texto: "Olá, vi o anúncio do apartamento em Almada. Ainda está disponível?", timestamp: horasAtras(2) },
      { id: "m2", de: "agente", texto: "Olá Maria! Sim, o apartamento T2 em Almada ainda está disponível. Tem 85m² e vista para o Tejo. Gostaria de saber mais detalhes?", timestamp: horasAtras(1.9) },
      { id: "m3", de: "cliente", texto: "Sim, qual é o preço e se posso visitar?", timestamp: horasAtras(1.5) },
      { id: "m4", de: "agente", texto: "O valor é 195.000€. Posso agendar uma visita para si. Quando teria disponibilidade?", timestamp: horasAtras(1.4) },
      { id: "m5", de: "cliente", texto: "Sábado de manhã seria ideal.", timestamp: horasAtras(1) },
    ]
  },
  {
    id: "l2", nome: "João Pereira", contacto: "+351923456789", canal: "whatsapp", estado: "visita_marcada", fase: "visita_marcada",
    dataEntrada: horasAtras(5), notas: "Interessado em T3 ou T4. Orçamento até 400k.", imoveisMostrados: ["im4", "im7"],
    mensagens: [
      { id: "m6", de: "cliente", texto: "Bom dia, procuro uma casa com 3 quartos na zona de Sintra ou Costa da Caparica.", timestamp: horasAtras(5) },
      { id: "m7", de: "agente", texto: "Bom dia João! Temos ótimas opções nessas zonas. Posso mostrar-lhe um T3 em Sintra por 320.000€ e uma moradia na Costa da Caparica por 385.000€.", timestamp: horasAtras(4.8) },
      { id: "m8", de: "cliente", texto: "A de Sintra parece interessante. Posso visitar amanhã?", timestamp: horasAtras(4) },
      { id: "m9", de: "agente", texto: "Claro! Visita agendada para amanhã às 10h. Envio-lhe a morada por mensagem.", timestamp: horasAtras(3.9) },
    ]
  },
  {
    id: "l3", nome: "Ana Costa", contacto: "+351934567890", canal: "telegram", estado: "novo", fase: "novos",
    dataEntrada: minAtras(30), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m10", de: "cliente", texto: "Olá, estou à procura de um T1 ou T2 em Lisboa até 250 mil euros.", timestamp: minAtras(30) },
      { id: "m11", de: "agente", texto: "Olá Ana! Bem-vinda. Temos várias opções nessa faixa de preço em Lisboa. Posso enviar-lhe algumas sugestões?", timestamp: minAtras(29) },
    ]
  },
  {
    id: "l4", nome: "Pedro Santos", contacto: "+351945678901", canal: "whatsapp", estado: "escalado", fase: "encaminhados",
    dataEntrada: horasAtras(8), notas: "Cliente exigente, quer falar com o consultor diretamente.", imoveisMostrados: ["im2", "im6"],
    mensagens: [
      { id: "m12", de: "cliente", texto: "Procuro algo premium, moradia ou penthouse. Orçamento não é problema.", timestamp: horasAtras(8) },
      { id: "m13", de: "agente", texto: "Olá Pedro! Temos uma moradia T4 em Cascais por 580.000€ e um Penthouse no Parque das Nações. Posso dar-lhe mais detalhes.", timestamp: horasAtras(7.8) },
      { id: "m14", de: "cliente", texto: "Quero falar diretamente com o consultor. Não quero conversar com bots.", timestamp: horasAtras(7) },
      { id: "m15", de: "agente", texto: "Compreendo perfeitamente, Pedro. Vou encaminhar o seu contacto para o Rodrigo, o nosso consultor. Ele entrará em contacto consigo brevemente.", timestamp: horasAtras(6.9) },
    ]
  },
  {
    id: "l5", nome: "Sofia Rodrigues", contacto: "sofia.rodrigues@email.pt", canal: "email", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(12), notas: "", imoveisMostrados: ["im5", "im9"],
    mensagens: [
      { id: "m16", de: "cliente", texto: "Boa tarde, gostaria de informações sobre apartamentos T1 em Lisboa.", timestamp: horasAtras(12) },
      { id: "m17", de: "agente", texto: "Boa tarde Sofia! Temos um T1 renovado em Benfica por 175.000€ e um Loft no Cais do Sodré por 310.000€. Qual lhe interessa mais?", timestamp: horasAtras(11.5) },
      { id: "m18", de: "cliente", texto: "O de Benfica parece dentro do meu orçamento. Pode enviar fotos?", timestamp: horasAtras(10) },
    ]
  },
  {
    id: "l6", nome: "Ricardo Mendes", contacto: "+351956789012", canal: "whatsapp", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(3), notas: "", imoveisMostrados: ["im1", "im10"],
    mensagens: [
      { id: "m19", de: "cliente", texto: "Bom dia, procuro T2 na margem sul, preferencialmente Almada ou Setúbal.", timestamp: horasAtras(3) },
      { id: "m20", de: "agente", texto: "Bom dia Ricardo! Tenho um T2 em Almada por 195.000€ com vista Tejo e um T2 em Setúbal por 155.000€. Ambos são ótimas opções!", timestamp: horasAtras(2.8) },
      { id: "m21", de: "cliente", texto: "O de Setúbal interessa-me. Tem garagem?", timestamp: horasAtras(2) },
    ]
  },
  {
    id: "l7", nome: "Catarina Lopes", contacto: "+351967890123", canal: "telegram", estado: "novo", fase: "novos",
    dataEntrada: minAtras(15), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m22", de: "cliente", texto: "Olá! Vi uma moradia em Cascais no vosso site. Ainda está disponível?", timestamp: minAtras(15) },
      { id: "m23", de: "agente", texto: "Olá Catarina! Sim, a moradia T4 em Cascais está disponível. Tem 220m², jardim e piscina. Posso enviar mais informações?", timestamp: minAtras(14) },
    ]
  },
  {
    id: "l8", nome: "Bruno Ferreira", contacto: "+351978901234", canal: "whatsapp", estado: "visita_marcada", fase: "visita_marcada",
    dataEntrada: horasAtras(24), notas: "Visita marcada para quinta-feira às 15h.", imoveisMostrados: ["im3", "im9"],
    mensagens: [
      { id: "m24", de: "cliente", texto: "Quero ver o estúdio no Chiado e o loft no Cais do Sodré.", timestamp: horasAtras(24) },
      { id: "m25", de: "agente", texto: "Olá Bruno! Posso agendar visitas a ambos. Quando tem disponibilidade?", timestamp: horasAtras(23) },
      { id: "m26", de: "cliente", texto: "Quinta-feira à tarde, pode ser?", timestamp: horasAtras(20) },
      { id: "m27", de: "agente", texto: "Perfeito! Visitas agendadas para quinta-feira: 15h no Chiado e 16h no Cais do Sodré. Confirmo a morada no dia.", timestamp: horasAtras(19.5) },
    ]
  },
  {
    id: "l9", nome: "Inês Martins", contacto: "ines.martins@gmail.com", canal: "email", estado: "fechado", fase: "fechados",
    dataEntrada: horasAtras(72), notas: "Comprou o T2 em Oeiras. Processo concluído.", imoveisMostrados: ["im8"],
    mensagens: [
      { id: "m28", de: "cliente", texto: "Gostaria de fazer uma proposta pelo T2 em Oeiras.", timestamp: horasAtras(72) },
      { id: "m29", de: "agente", texto: "Olá Inês! Ótima escolha. Vou passar o seu interesse ao consultor Rodrigo para avançar com a proposta.", timestamp: horasAtras(71) },
      { id: "m30", de: "cliente", texto: "Obrigada, aguardo contacto.", timestamp: horasAtras(70) },
    ]
  },
  {
    id: "l10", nome: "Miguel Almeida", contacto: "+351989012345", canal: "whatsapp", estado: "novo", fase: "novos",
    dataEntrada: minAtras(5), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m31", de: "cliente", texto: "Olá, procuro casa para investimento. O que têm disponível?", timestamp: minAtras(5) },
      { id: "m32", de: "agente", texto: "Olá Miguel! Para investimento temos ótimas opções. Qual é a zona e orçamento que tem em mente?", timestamp: minAtras(4) },
    ]
  },
  {
    id: "l11", nome: "Teresa Oliveira", contacto: "+351990123456", canal: "whatsapp", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(6), notas: "", imoveisMostrados: ["im4"],
    mensagens: [
      { id: "m33", de: "cliente", texto: "Boa tarde, procuro T3 em Sintra para a minha família.", timestamp: horasAtras(6) },
      { id: "m34", de: "agente", texto: "Boa tarde Teresa! Temos um apartamento T3 em Sintra com 120m² por 320.000€. Tem vista para a serra e varanda. Posso agendar uma visita?", timestamp: horasAtras(5.8) },
      { id: "m35", de: "cliente", texto: "Parece ótimo! Tem garagem incluída?", timestamp: horasAtras(5) },
    ]
  },
  {
    id: "l12", nome: "Rui Nunes", contacto: "+351901234567", canal: "telegram", estado: "perdido", fase: "fechados",
    dataEntrada: horasAtras(96), notas: "Desistiu por motivos pessoais.", imoveisMostrados: ["im7"],
    mensagens: [
      { id: "m36", de: "cliente", texto: "Afinal vou adiar a compra. Obrigado pela ajuda.", timestamp: horasAtras(48) },
      { id: "m37", de: "agente", texto: "Compreendo Rui. Quando quiser retomar, estamos aqui. Boa sorte!", timestamp: horasAtras(47) },
    ]
  },
  {
    id: "l13", nome: "Patrícia Gomes", contacto: "+351912345000", canal: "whatsapp", estado: "novo", fase: "novos",
    dataEntrada: minAtras(45), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m38", de: "cliente", texto: "Olá, estou interessada no penthouse do Parque das Nações.", timestamp: minAtras(45) },
      { id: "m39", de: "agente", texto: "Olá Patrícia! O Penthouse T3 no Parque das Nações é uma propriedade fantástica com 150m² e terraço panorâmico. O valor é 495.000€. Quer saber mais?", timestamp: minAtras(44) },
    ]
  },
  {
    id: "l14", nome: "André Sousa", contacto: "andre.sousa@outlook.pt", canal: "email", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(18), notas: "", imoveisMostrados: ["im5", "im1"],
    mensagens: [
      { id: "m40", de: "cliente", texto: "Bom dia, estou a comparar o T1 em Benfica com o T2 em Almada. Pode ajudar-me a decidir?", timestamp: horasAtras(18) },
      { id: "m41", de: "agente", texto: "Bom dia André! Claro. O T1 em Benfica (175k€, 55m²) é ideal para uma pessoa, enquanto o T2 em Almada (195k€, 85m²) tem mais espaço e vista rio. Depende das suas prioridades!", timestamp: horasAtras(17) },
      { id: "m42", de: "cliente", texto: "Acho que prefiro o de Almada. Posso visitar?", timestamp: horasAtras(15) },
    ]
  },
  {
    id: "l15", nome: "Luísa Fernandes", contacto: "+351923456000", canal: "whatsapp", estado: "escalado", fase: "encaminhados",
    dataEntrada: horasAtras(4), notas: "Quer negociar o preço diretamente.", imoveisMostrados: ["im2"],
    mensagens: [
      { id: "m43", de: "cliente", texto: "A moradia de Cascais interessa-me mas preciso de negociar o preço. Posso falar com o responsável?", timestamp: horasAtras(4) },
      { id: "m44", de: "agente", texto: "Claro Luísa, vou encaminhar para o nosso consultor Rodrigo que poderá discutir os detalhes consigo.", timestamp: horasAtras(3.8) },
    ]
  },
  {
    id: "l16", nome: "Carlos Ribeiro", contacto: "+351934567000", canal: "whatsapp", estado: "novo", fase: "novos",
    dataEntrada: horasAtras(1), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m45", de: "cliente", texto: "Boa noite, têm moradias disponíveis na zona de Oeiras?", timestamp: horasAtras(1) },
      { id: "m46", de: "agente", texto: "Boa noite Carlos! De momento temos um T2 com terraço em Oeiras por 275.000€. Posso enviar-lhe os detalhes?", timestamp: horasAtras(0.9) },
    ]
  },
  {
    id: "l17", nome: "Daniela Pinto", contacto: "+351945678000", canal: "telegram", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(10), notas: "", imoveisMostrados: ["im6", "im3"],
    mensagens: [
      { id: "m47", de: "cliente", texto: "Estou à procura de algo moderno em Lisboa, T0 ou T1. O que sugerem?", timestamp: horasAtras(10) },
      { id: "m48", de: "agente", texto: "Olá Daniela! Recomendo o Estúdio T0 no Chiado (245k€) ou o Penthouse T3 no Parque das Nações se quiser algo mais amplo. Qual prefere explorar?", timestamp: horasAtras(9.5) },
      { id: "m49", de: "cliente", texto: "O estúdio no Chiado parece perfeito! Quando posso visitar?", timestamp: horasAtras(8) },
    ]
  },
  {
    id: "l18", nome: "Filipe Cardoso", contacto: "+351956789000", canal: "whatsapp", estado: "visita_marcada", fase: "visita_marcada",
    dataEntrada: horasAtras(36), notas: "Visita segunda-feira às 11h.", imoveisMostrados: ["im7", "im4"],
    mensagens: [
      { id: "m50", de: "cliente", texto: "Quero ver a moradia na Costa da Caparica e o apartamento em Sintra.", timestamp: horasAtras(36) },
      { id: "m51", de: "agente", texto: "Visitas agendadas para segunda-feira: 11h na Costa da Caparica e 14h em Sintra. Envio-lhe as moradas amanhã.", timestamp: horasAtras(35) },
    ]
  },
  {
    id: "l19", nome: "Mariana Baptista", contacto: "mariana.b@email.pt", canal: "email", estado: "a_conversar", fase: "qualificados",
    dataEntrada: horasAtras(20), notas: "", imoveisMostrados: ["im10"],
    mensagens: [
      { id: "m52", de: "cliente", texto: "Estou interessada no T2 em Setúbal para investimento. Qual a rentabilidade esperada?", timestamp: horasAtras(20) },
      { id: "m53", de: "agente", texto: "Olá Mariana! O T2 em Setúbal por 155.000€ tem excelente potencial. Na zona, o arrendamento ronda os 650-750€/mês. Quer mais detalhes?", timestamp: horasAtras(19) },
    ]
  },
  {
    id: "l20", nome: "Tiago Correia", contacto: "+351967890000", canal: "whatsapp", estado: "novo", fase: "novos",
    dataEntrada: minAtras(10), notas: "", imoveisMostrados: [],
    mensagens: [
      { id: "m54", de: "cliente", texto: "Olá! Sou investidor, procuro imóveis até 200k na margem sul.", timestamp: minAtras(10) },
      { id: "m55", de: "agente", texto: "Olá Tiago! Temos ótimas opções para investimento na margem sul. O T2 em Almada (195k€) e o T2 em Setúbal (155k€) são os mais procurados. Interessado?", timestamp: minAtras(9) },
    ]
  },
];

export const tarefasMock: Tarefa[] = [
  { id: "t1", leadId: "l1", leadNome: "Maria Silva", descricao: "Maria quer visitar sábado — Confirmar horário", concluida: false, timestamp: horasAtras(1) },
  { id: "t2", leadId: "l4", leadNome: "Pedro Santos", descricao: "Pedro quer falar contigo — Ligar de volta", concluida: false, timestamp: horasAtras(7) },
  { id: "t3", leadId: "l8", leadNome: "Bruno Ferreira", descricao: "Visita quinta às 15h — Preparar documentação", concluida: false, timestamp: horasAtras(19) },
  { id: "t4", leadId: "l15", leadNome: "Luísa Fernandes", descricao: "Luísa quer negociar preço — Contactar", concluida: false, timestamp: horasAtras(3.8) },
  { id: "t5", leadId: "l14", leadNome: "André Sousa", descricao: "André quer visitar T2 Almada — Agendar", concluida: false, timestamp: horasAtras(15) },
  { id: "t6", leadId: "l10", leadNome: "Miguel Almeida", descricao: "Novo lead investidor — Analisar conversa", concluida: false, timestamp: minAtras(4) },
  { id: "t7", leadId: "l9", leadNome: "Inês Martins", descricao: "Enviar documentos finais da venda", concluida: true, timestamp: horasAtras(48) },
  { id: "t8", leadId: "l2", leadNome: "João Pereira", descricao: "Confirmar visita em Sintra amanhã às 10h", concluida: true, timestamp: horasAtras(3.9) },
];

export const notificacoesMock: Notificacao[] = [
  { id: "n1", tipo: "lead_quente", mensagem: "Novo lead quente: Maria Silva via WhatsApp", leadId: "l1", timestamp: minAtras(2), lida: false },
  { id: "n2", tipo: "visita", mensagem: "João Pereira pediu visita à casa em Sintra", leadId: "l2", timestamp: minAtras(15), lida: false },
  { id: "n3", tipo: "escalado", mensagem: "Lead escalado: Pedro Santos quer falar contigo", leadId: "l4", timestamp: minAtras(30), lida: false },
  { id: "n4", tipo: "lead_quente", mensagem: "Novo lead: Tiago Correia procura investimento", leadId: "l20", timestamp: minAtras(10), lida: false },
  { id: "n5", tipo: "escalado", mensagem: "Luísa Fernandes quer negociar preço directamente", leadId: "l15", timestamp: horasAtras(3.8), lida: true },
];
