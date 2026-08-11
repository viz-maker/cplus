-- =============================================================================
-- Construct+ — PROPOSTA de esquema Oracle
--
-- ⚠️ Não validado contra a base de dados oficial. Este ficheiro deriva do
--    modelo em src/domain/types.ts e existe para ser comparado com o esquema
--    real quando houver acesso. Se o esquema oficial divergir, é este ficheiro
--    e o adaptador (src/server/oracle-repository.ts) que mudam — nunca os
--    ecrãs.
--
-- Convenções assumidas: identificadores em maiúsculas, prefixo CP_,
-- ids VARCHAR2 (o modelo já trata ids como strings opacas).
-- =============================================================================

-- ── Árvore de aprovisionamento ───────────────────────────────────────────────

CREATE TABLE CP_SUBGRUPO (
  ID    VARCHAR2(32)  NOT NULL,
  NOME  VARCHAR2(200) NOT NULL,
  CONSTRAINT PK_CP_SUBGRUPO PRIMARY KEY (ID)
);

CREATE TABLE CP_GRUPO (
  ID    VARCHAR2(32)  NOT NULL,
  NOME  VARCHAR2(200) NOT NULL,
  CONSTRAINT PK_CP_GRUPO PRIMARY KEY (ID)
);

CREATE TABLE CP_CATEGORIA (
  ID    VARCHAR2(32)  NOT NULL,
  NOME  VARCHAR2(200) NOT NULL,
  CONSTRAINT PK_CP_CATEGORIA PRIMARY KEY (ID)
);

-- Associações N:N. A UI ordena pela ordem de inserção, daí ORDEM.
CREATE TABLE CP_CATEGORIA_GRUPO (
  CATEGORIA_ID VARCHAR2(32) NOT NULL,
  GRUPO_ID     VARCHAR2(32) NOT NULL,
  ORDEM        NUMBER(5)    DEFAULT 0 NOT NULL,
  CONSTRAINT PK_CP_CAT_GRP PRIMARY KEY (CATEGORIA_ID, GRUPO_ID),
  CONSTRAINT FK_CP_CAT_GRP_CAT FOREIGN KEY (CATEGORIA_ID)
    REFERENCES CP_CATEGORIA (ID) ON DELETE CASCADE,
  CONSTRAINT FK_CP_CAT_GRP_GRP FOREIGN KEY (GRUPO_ID)
    REFERENCES CP_GRUPO (ID) ON DELETE CASCADE
);

CREATE TABLE CP_GRUPO_SUBGRUPO (
  GRUPO_ID    VARCHAR2(32) NOT NULL,
  SUBGRUPO_ID VARCHAR2(32) NOT NULL,
  ORDEM       NUMBER(5)    DEFAULT 0 NOT NULL,
  CONSTRAINT PK_CP_GRP_SUB PRIMARY KEY (GRUPO_ID, SUBGRUPO_ID),
  CONSTRAINT FK_CP_GRP_SUB_GRP FOREIGN KEY (GRUPO_ID)
    REFERENCES CP_GRUPO (ID) ON DELETE CASCADE,
  CONSTRAINT FK_CP_GRP_SUB_SUB FOREIGN KEY (SUBGRUPO_ID)
    REFERENCES CP_SUBGRUPO (ID) ON DELETE CASCADE
);

-- ── Parceiros (cliente e/ou fornecedor no mesmo registo) ─────────────────────

CREATE TABLE CP_PARCEIRO (
  ID          VARCHAR2(32)  NOT NULL,
  NOME        VARCHAR2(200) NOT NULL,
  NIF         VARCHAR2(32),
  EMAIL       VARCHAR2(200),
  TELEFONE    VARCHAR2(64),
  LOCALIDADE  VARCHAR2(120),
  CONSTRAINT PK_CP_PARCEIRO PRIMARY KEY (ID)
);

CREATE TABLE CP_PARCEIRO_TIPO (
  PARCEIRO_ID VARCHAR2(32) NOT NULL,
  TIPO        VARCHAR2(16) NOT NULL,
  CONSTRAINT PK_CP_PARC_TIPO PRIMARY KEY (PARCEIRO_ID, TIPO),
  CONSTRAINT FK_CP_PARC_TIPO FOREIGN KEY (PARCEIRO_ID)
    REFERENCES CP_PARCEIRO (ID) ON DELETE CASCADE,
  CONSTRAINT CK_CP_PARC_TIPO CHECK (TIPO IN ('Cliente', 'Fornecedor'))
);

-- ── Catálogo ─────────────────────────────────────────────────────────────────

CREATE TABLE CP_ARTIGO (
  ID             VARCHAR2(32)   NOT NULL,
  NOME           VARCHAR2(300)  NOT NULL,
  CATEGORIA_ID   VARCHAR2(32)   NOT NULL,
  SKU            VARCHAR2(64),
  CODIGO_BARRAS  VARCHAR2(64),
  NCM            VARCHAR2(32),
  UNIDADE        VARCHAR2(16)   NOT NULL,
  STOCK          NUMBER(14, 2)  DEFAULT 0 NOT NULL,
  STOCK_MIN      NUMBER(14, 2)  DEFAULT 0 NOT NULL,
  PRECO_UNIT     NUMBER(14, 2)  DEFAULT 0 NOT NULL,
  MARKUP         NUMBER(7, 2)   DEFAULT 0 NOT NULL,
  CUSTO_MEDIO    NUMBER(14, 2)  DEFAULT 0 NOT NULL,
  FORNECEDOR_ID  VARCHAR2(32),
  ATIVO          NUMBER(1)      DEFAULT 1 NOT NULL,
  DESCRICAO      CLOB,
  NOTAS          CLOB,
  IMAGEM         VARCHAR2(400),
  CONSTRAINT PK_CP_ARTIGO PRIMARY KEY (ID),
  CONSTRAINT FK_CP_ARTIGO_CAT FOREIGN KEY (CATEGORIA_ID) REFERENCES CP_CATEGORIA (ID),
  CONSTRAINT FK_CP_ARTIGO_FORN FOREIGN KEY (FORNECEDOR_ID) REFERENCES CP_PARCEIRO (ID),
  CONSTRAINT CK_CP_ARTIGO_ATIVO CHECK (ATIVO IN (0, 1)),
  CONSTRAINT CK_CP_ARTIGO_UNID CHECK (
    UNIDADE IN ('un', 'saco', 'balde', 'm', 'm²', 'm³', 'kg', 'L', 'caixa')
  )
);

CREATE INDEX IX_CP_ARTIGO_CAT  ON CP_ARTIGO (CATEGORIA_ID);
CREATE INDEX IX_CP_ARTIGO_FORN ON CP_ARTIGO (FORNECEDOR_ID);

-- ── Agenda ───────────────────────────────────────────────────────────────────
-- A UI trabalha com data (YYYY-MM-DD) e hora (HH:MM) separadas. Guardar como
-- dois TIMESTAMP e formatar no adaptador mantém as consultas por intervalo
-- eficientes sem contaminar os componentes.

CREATE TABLE CP_MARCACAO (
  ID         VARCHAR2(32)  NOT NULL,
  DESCRICAO  VARCHAR2(400) NOT NULL,
  ESTADO     VARCHAR2(24)  NOT NULL,
  INICIO     TIMESTAMP     NOT NULL,
  FIM        TIMESTAMP     NOT NULL,
  DETALHES   CLOB,
  CONSTRAINT PK_CP_MARCACAO PRIMARY KEY (ID),
  CONSTRAINT CK_CP_MARCACAO_EST CHECK (
    ESTADO IN ('Em espera', 'Adiado', 'Em revisão', 'Em curso', 'Concluído', 'Cancelado')
  ),
  CONSTRAINT CK_CP_MARCACAO_INT CHECK (FIM >= INICIO)
);

CREATE INDEX IX_CP_MARCACAO_INICIO ON CP_MARCACAO (INICIO);

-- ── Orçamentos (agregado: orçamento → ambiente → linha) ──────────────────────

CREATE TABLE CP_ORCAMENTO (
  ID             VARCHAR2(32)  NOT NULL,
  REF            VARCHAR2(64)  NOT NULL,
  CLIENTE_ID     VARCHAR2(32)  NOT NULL,
  OBRA           VARCHAR2(300),
  DATA_EMISSAO   DATE          NOT NULL,
  DATA_VALIDADE  DATE          NOT NULL,
  ESTADO         VARCHAR2(24)  NOT NULL,
  CONSTRAINT PK_CP_ORCAMENTO PRIMARY KEY (ID),
  CONSTRAINT UQ_CP_ORCAMENTO_REF UNIQUE (REF),
  CONSTRAINT FK_CP_ORC_CLIENTE FOREIGN KEY (CLIENTE_ID) REFERENCES CP_PARCEIRO (ID)
);

CREATE TABLE CP_ORC_AMBIENTE (
  ID            VARCHAR2(32)  NOT NULL,
  ORCAMENTO_ID  VARCHAR2(32)  NOT NULL,
  NOME          VARCHAR2(200) NOT NULL,
  ORDEM         NUMBER(5)     DEFAULT 0 NOT NULL,
  CONSTRAINT PK_CP_ORC_AMB PRIMARY KEY (ID),
  CONSTRAINT FK_CP_ORC_AMB FOREIGN KEY (ORCAMENTO_ID)
    REFERENCES CP_ORCAMENTO (ID) ON DELETE CASCADE
);

CREATE TABLE CP_ORC_LINHA (
  ID           VARCHAR2(32)  NOT NULL,
  AMBIENTE_ID  VARCHAR2(32)  NOT NULL,
  ARTIGO_ID    VARCHAR2(32)  NOT NULL,
  QTD          NUMBER(14, 3) DEFAULT 0 NOT NULL,
  -- Preço copiado do artigo no momento da linha: o orçamento não pode mudar
  -- retroativamente quando o catálogo é atualizado.
  PRECO        NUMBER(14, 2) DEFAULT 0 NOT NULL,
  NOTA         VARCHAR2(400),
  ORDEM        NUMBER(5)     DEFAULT 0 NOT NULL,
  CONSTRAINT PK_CP_ORC_LINHA PRIMARY KEY (ID),
  CONSTRAINT FK_CP_ORC_LIN_AMB FOREIGN KEY (AMBIENTE_ID)
    REFERENCES CP_ORC_AMBIENTE (ID) ON DELETE CASCADE,
  CONSTRAINT FK_CP_ORC_LIN_ART FOREIGN KEY (ARTIGO_ID) REFERENCES CP_ARTIGO (ID)
);

CREATE INDEX IX_CP_ORC_AMB_ORC ON CP_ORC_AMBIENTE (ORCAMENTO_ID);
CREATE INDEX IX_CP_ORC_LIN_AMB ON CP_ORC_LINHA (AMBIENTE_ID);

-- ── Notas de implementação ───────────────────────────────────────────────────
--
-- 1. Gravar uma categoria/grupo é uma transação: UPDATE da linha-pai seguido de
--    DELETE + INSERT das associações. Nunca em pedidos separados.
-- 2. Gravar um orçamento é uma transação sobre as três tabelas. Ler um
--    orçamento devolve a forma aninhada que a UI espera — remontar no adaptador.
-- 3. O IVA (23%) é calculado na aplicação (src/domain/selectors.ts) e não é
--    persistido; se passar a ser variável por linha, acrescentar TAXA_IVA a
--    CP_ORC_LINHA e mover o cálculo para o mesmo sítio.
-- 4. ATIVO usa NUMBER(1) 0/1; o adaptador converte para boolean.
