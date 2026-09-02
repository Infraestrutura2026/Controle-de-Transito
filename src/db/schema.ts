import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Tabela mantida apenas para preservar a integridade referencial do histórico
 * de saídas. O sistema não cria nem gerencia mais contas de usuários — o
 * cadastro é feito apenas com Nome + RS (matrícula) na tela inicial.
 */
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  usuario: text("usuario").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  perfil: text("perfil").notNull().default("operador"), // admin | operador
  ativo: boolean("ativo").default(true).notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

/**
 * Sessões simplificadas: cada (nome, rs) gera um token httpOnly com 7 dias de
 * validade, sem necessidade de criar conta. O login é só informar nome + RS.
 */
export const sessoes = pgTable("sessoes", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  nome: text("nome").notNull(),
  rs: text("rs").notNull(),
  expiraEm: timestamp("expira_em").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

/**
 * Registro de saídas: data, hora, local, matrícula, nome, motivo, regime e
 * o par (criadoPorNome, criadoPorRs) que identifica quem fez o cadastro.
 * As APIs filtram por (criadoPorNome, criadoPorRs) para mostrar ao usuário
 * apenas as saídas registradas por ele.
 */
export const saidas = pgTable("saidas", {
  id: serial("id").primaryKey(),
  data: text("data").notNull(), // YYYY-MM-DD
  hora: text("hora").notNull(), // HH:mm
  local: text("local").notNull(), // hospital / unidade de destino
  matricula: text("matricula").notNull(), // matrícula do servidor que vai sair
  nome: text("nome").notNull(),
  motivo: text("motivo").notNull().default(""), // procedimento / motivo
  regime: text("regime").notNull().default("FE"), // RSA | FE | CR | OUTRO
  regimeOutro: text("regime_outro").notNull().default(""), // descrição quando regime = OUTRO (máx. 50)
  veiculo: text("veiculo").notNull().default(""), // veículo do serviço (admin)
  motorista: text("motorista").notNull().default(""), // motorista do serviço (admin)
  horarioEmbarque: text("horario_embarque").notNull().default(""), // HORÁRIO DE EMBARQUE (admin, HH:mm)
  naoRealizada: boolean("nao_realizada").notNull().default(false), // saída não foi realizada
  justificativa: text("justificativa").notNull().default(""), // motivo da não realização (máx. 50)
  criadoPorNome: text("criado_por_nome").notNull().default("Sistema"),
  criadoPorRs: text("criado_por_rs").notNull().default(""),
  criadoPorId: integer("criado_por_id").references(() => usuarios.id, { onDelete: "set null" }),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export type Saida = typeof saidas.$inferSelect;
export type SaidaInput = typeof saidas.$inferInsert;
export type Sessao = typeof sessoes.$inferSelect;
export type Usuario = typeof usuarios.$inferSelect;
export type UsuarioInput = typeof usuarios.$inferInsert;
