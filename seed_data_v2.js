/* ============================================================
   SEED DATA — Controle de Trânsito
   Dados extraídos da planilha Controle_Trânsito_Semanal.xlsx
   Período: junho–agosto 2026
   Gerado automaticamente para popular o sistema com dados reais.
   ============================================================ */

const SEED_SAIDAS = [
  {
    "id": "seed0001",
    "data": "2026-06-07",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL ARMANDO",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-07T11:00:00.000Z"
  },
  {
    "id": "seed0002",
    "data": "2026-06-07",
    "hora": "00:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP (RETIRAR O PRESO NO HC) TEM ESCOLTA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL ANTONIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-07T00:00:00.000Z"
  },
  {
    "id": "seed0003",
    "data": "2026-06-08",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA EXPEDITO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T06:00:00.000Z"
  },
  {
    "id": "seed0004",
    "data": "2026-06-08",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "RAIO-X",
    "viatura": "",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 4",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T13:00:00.000Z"
  },
  {
    "id": "seed0005",
    "data": "2026-06-09",
    "hora": "11:30",
    "tipo": "externa",
    "regime": "CR",
    "local": "HOSPITAL SÃO FRANCISCO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CARDIOLOGIA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-09T11:30:00.000Z"
  },
  {
    "id": "seed0006",
    "data": "2026-06-10",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-10T08:00:00.000Z"
  },
  {
    "id": "seed0007",
    "data": "2026-06-10",
    "hora": "08:15",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "SA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-10T08:15:00.000Z"
  },
  {
    "id": "seed0008",
    "data": "2026-06-10",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-10T11:15:00.000Z"
  },
  {
    "id": "seed0009",
    "data": "2026-06-11",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL ZANONI",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T08:00:00.000Z"
  },
  {
    "id": "seed0010",
    "data": "2026-06-11",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPÍTAL SÃO FRANCISCO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CIRURGIA VASCULAR",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T07:00:00.000Z"
  },
  {
    "id": "seed0011",
    "data": "2026-06-11",
    "hora": "07:30",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "COLANGIORRESSONANCIA",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T07:30:00.000Z"
  },
  {
    "id": "seed0012",
    "data": "2026-06-12",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 6",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-12T13:00:00.000Z"
  },
  {
    "id": "seed0013",
    "data": "2026-06-12",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-12T11:15:00.000Z"
  },
  {
    "id": "seed0014",
    "data": "2026-06-15",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA VANDERLEI",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T06:00:00.000Z"
  },
  {
    "id": "seed0015",
    "data": "2026-06-15",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 4",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T08:00:00.000Z"
  },
  {
    "id": "seed0016",
    "data": "2026-06-15",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "UROLOGIA GERAL",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T12:00:00.000Z"
  },
  {
    "id": "seed0017",
    "data": "2026-06-15",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCII - MATERNO INFANTIL",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "RAIO-X",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T13:00:00.000Z"
  },
  {
    "id": "seed0018",
    "data": "2026-06-16",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "TRANSITO VIA CDP BAURU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CDP BAURU",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-16T07:00:00.000Z"
  },
  {
    "id": "seed0019",
    "data": "2026-06-17",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-17T08:00:00.000Z"
  },
  {
    "id": "seed0020",
    "data": "2026-06-17",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-17T11:15:00.000Z"
  },
  {
    "id": "seed0021",
    "data": "2026-06-18",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "INFECTO GERAL",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-18T12:00:00.000Z"
  },
  {
    "id": "seed0022",
    "data": "2026-06-18",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-18T08:00:00.000Z"
  },
  {
    "id": "seed0023",
    "data": "2026-06-19",
    "hora": "04:30",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL DAS CLÍNICAS DE BOTUCATU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "LITOTRIPSIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T04:30:00.000Z"
  },
  {
    "id": "seed0024",
    "data": "2026-06-19",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T07:00:00.000Z"
  },
  {
    "id": "seed0025",
    "data": "2026-06-19",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T11:15:00.000Z"
  },
  {
    "id": "seed0026",
    "data": "2026-06-21",
    "hora": "23:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP (RETIRAR O PRESO NO HC) TEM ESCOLTA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA - FISIATRA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL Edilson",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-21T23:30:00.000Z"
  },
  {
    "id": "seed0027",
    "data": "2026-06-22",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA EXPEDITO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-22T06:00:00.000Z"
  },
  {
    "id": "seed0028",
    "data": "2026-06-23",
    "hora": "06:30",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "UROLOGIA GERAL",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-23T06:30:00.000Z"
  },
  {
    "id": "seed0029",
    "data": "2026-06-23",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "CR",
    "local": "CHSP",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL GABRIEL FRANCHINI",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-23T07:00:00.000Z"
  },
  {
    "id": "seed0030",
    "data": "2026-06-25",
    "hora": "09:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ECODOPPLER CARDIOGRAMA TRANSTORACICO",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-25T09:30:00.000Z"
  },
  {
    "id": "seed0031",
    "data": "2026-06-26",
    "hora": "06:40",
    "tipo": "externa",
    "regime": "SA",
    "local": "UPA ZONA NORTE",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-26T06:40:00.000Z"
  },
  {
    "id": "seed0032",
    "data": "2026-06-26",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-26T11:15:00.000Z"
  },
  {
    "id": "seed0033",
    "data": "2026-06-29",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-29T06:00:00.000Z"
  },
  {
    "id": "seed0034",
    "data": "2026-06-29",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-29T11:15:00.000Z"
  },
  {
    "id": "seed0035",
    "data": "2026-07-01",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T08:00:00.000Z"
  },
  {
    "id": "seed0036",
    "data": "2026-07-01",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FCW-8I62",
    "motorista": "",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T11:15:00.000Z"
  },
  {
    "id": "seed0037",
    "data": "2026-07-02",
    "hora": "07:50",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO I",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T07:50:00.000Z"
  },
  {
    "id": "seed0038",
    "data": "2026-07-02",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T08:00:00.000Z"
  },
  {
    "id": "seed0039",
    "data": "2026-07-03",
    "hora": "06:30",
    "tipo": "interna",
    "regime": "SA",
    "local": "H. SÃOFRANCISCO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "INFECTOLOGISTA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T06:30:00.000Z"
  },
  {
    "id": "seed0040",
    "data": "2026-07-03",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CR DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T07:00:00.000Z"
  },
  {
    "id": "seed0041",
    "data": "2026-07-03",
    "hora": "07:45",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "FJG-7158",
    "motorista": "",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T07:45:00.000Z"
  },
  {
    "id": "seed0042",
    "data": "2026-07-03",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MISERICORDIA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIALISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T11:15:00.000Z"
  },
  {
    "id": "seed0043",
    "data": "2026-07-03",
    "hora": "13:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "P2 DE ÁLVARO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T13:30:00.000Z"
  },
  {
    "id": "seed0044",
    "data": "2026-07-06",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "TLM-2D25",
    "motorista": "OF. OPERACIONAL MOTORISTA EXPEDITO",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-06T06:00:00.000Z"
  },
  {
    "id": "seed0045",
    "data": "2026-07-06",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA DERMATOLOGISTA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL ARMANDO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-06T11:00:00.000Z"
  },
  {
    "id": "seed0046",
    "data": "2026-07-06",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARILIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-06T11:15:00.000Z"
  },
  {
    "id": "seed0047",
    "data": "2026-07-07",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T08:00:00.000Z"
  },
  {
    "id": "seed0048",
    "data": "2026-07-07",
    "hora": "08:30",
    "tipo": "externa",
    "regime": "CR",
    "local": "CPP II BAURU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "BUSCAR PPL",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T08:30:00.000Z"
  },
  {
    "id": "seed0049",
    "data": "2026-07-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T08:00:00.000Z"
  },
  {
    "id": "seed0050",
    "data": "2026-07-08",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO RETORNO ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "TLM-2D25",
    "motorista": "OF. OPERACIONAL MOTORISTA JOSÉ ROBERTO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T10:00:00.000Z"
  },
  {
    "id": "seed0051",
    "data": "2026-07-08",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARILIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T11:15:00.000Z"
  },
  {
    "id": "seed0052",
    "data": "2026-07-13",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA VANDERLEI",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-13T06:00:00.000Z"
  },
  {
    "id": "seed0053",
    "data": "2026-07-13",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "CR",
    "local": "HOSPITAL DE CLÍNICAS DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-13T11:15:00.000Z"
  },
  {
    "id": "seed0054",
    "data": "2026-07-14",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HEMOCENTRO- MARILIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMOGRAMA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-14T08:00:00.000Z"
  },
  {
    "id": "seed0055",
    "data": "2026-07-14",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "NEURO VASCULAR",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-14T12:00:00.000Z"
  },
  {
    "id": "seed0056",
    "data": "2026-07-15",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "DENTISTA - CR DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-15T08:00:00.000Z"
  },
  {
    "id": "seed0057",
    "data": "2026-07-15",
    "hora": "09:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA                       ( TRATAMENTO AMBULATORIAL)",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-15T09:30:00.000Z"
  },
  {
    "id": "seed0058",
    "data": "2026-07-15",
    "hora": "11:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-15T11:15:00.000Z"
  },
  {
    "id": "seed0059",
    "data": "2026-07-16",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "DENTISTA - CR DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T08:00:00.000Z"
  },
  {
    "id": "seed0060",
    "data": "2026-07-16",
    "hora": "08:15",
    "tipo": "externa",
    "regime": "SA",
    "local": "REMOÇÃO PARA O CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "",
    "observacoes": "Quantidade PPL: 5",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T08:15:00.000Z"
  },
  {
    "id": "seed0061",
    "data": "2026-07-16",
    "hora": "10:45",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL DAS CLÍNICAS DE BOTUCATU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "NEFROLOGIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T10:45:00.000Z"
  },
  {
    "id": "seed0062",
    "data": "2026-07-17",
    "hora": "07:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "CDP BAURU - IMESC",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "EXAME CRIMINOLÓGICO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-17T07:30:00.000Z"
  },
  {
    "id": "seed0063",
    "data": "2026-07-17",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CONSULTA MÉDICA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-17T08:00:00.000Z"
  },
  {
    "id": "seed0064",
    "data": "2026-07-17",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO RETORNO ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA VANDERLEI",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-17T11:00:00.000Z"
  },
  {
    "id": "seed0065",
    "data": "2026-07-17",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-17T11:00:00.000Z"
  },
  {
    "id": "seed0066",
    "data": "2026-07-20",
    "hora": "02:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC – UNICAMP",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-20T02:00:00.000Z"
  },
  {
    "id": "seed0067",
    "data": "2026-07-20",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA EXPEDITO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-20T06:00:00.000Z"
  },
  {
    "id": "seed0068",
    "data": "2026-07-20",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-20T11:00:00.000Z"
  },
  {
    "id": "seed0069",
    "data": "2026-07-21",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CPP I E II BAURU / PEN ITAÍ",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 8",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-21T07:00:00.000Z"
  },
  {
    "id": "seed0070",
    "data": "2026-07-22",
    "hora": "07:30",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-22T07:30:00.000Z"
  },
  {
    "id": "seed0071",
    "data": "2026-07-22",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO I",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-22T08:00:00.000Z"
  },
  {
    "id": "seed0072",
    "data": "2026-07-22",
    "hora": "08:15",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO SA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO I",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-22T08:15:00.000Z"
  },
  {
    "id": "seed0073",
    "data": "2026-07-22",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-22T11:00:00.000Z"
  },
  {
    "id": "seed0074",
    "data": "2026-07-23",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-23T07:00:00.000Z"
  },
  {
    "id": "seed0075",
    "data": "2026-07-23",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-23T08:00:00.000Z"
  },
  {
    "id": "seed0076",
    "data": "2026-07-23",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO SA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 6",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-23T08:00:00.000Z"
  },
  {
    "id": "seed0077",
    "data": "2026-07-24",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MARCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-24T07:00:00.000Z"
  },
  {
    "id": "seed0078",
    "data": "2026-07-24",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO RETORNO ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUW-3J07",
    "motorista": "OF. OPERACIONAL MOTORISTA EXPEDITO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-24T11:00:00.000Z"
  },
  {
    "id": "seed0079",
    "data": "2026-07-24",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FABIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-24T11:00:00.000Z"
  },
  {
    "id": "seed0080",
    "data": "2026-07-25",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CDP I BELÉM - IMESC SÃO PAULO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PERÍCIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL À DEFINIR",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-25T13:00:00.000Z"
  },
  {
    "id": "seed0081",
    "data": "2026-07-27",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "TLM-2D25",
    "motorista": "OF. OPERACIONAL -MOTORISTA VANDERLEI",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-27T06:00:00.000Z"
  },
  {
    "id": "seed0082",
    "data": "2026-07-27",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CENTRO MÉDICO ACONCHEGO - MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ULTRASSON PAREDE ABDOMINAL",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-27T08:00:00.000Z"
  },
  {
    "id": "seed0083",
    "data": "2026-07-27",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-27T11:00:00.000Z"
  },
  {
    "id": "seed0084",
    "data": "2026-07-28",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO I",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T07:00:00.000Z"
  },
  {
    "id": "seed0085",
    "data": "2026-07-28",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "TRÂNSITO VIA CDP BAURU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "TRÂNSITO",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T07:00:00.000Z"
  },
  {
    "id": "seed0086",
    "data": "2026-07-28",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 6",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T08:00:00.000Z"
  },
  {
    "id": "seed0087",
    "data": "2026-07-28",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "RAIO-X",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T13:00:00.000Z"
  },
  {
    "id": "seed0088",
    "data": "2026-07-29",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "TRAUMA DE FACE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T07:00:00.000Z"
  },
  {
    "id": "seed0089",
    "data": "2026-07-29",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T08:00:00.000Z"
  },
  {
    "id": "seed0090",
    "data": "2026-07-29",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PROGRESSÃO RSA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PROGRESSÃO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T08:00:00.000Z"
  },
  {
    "id": "seed0091",
    "data": "2026-07-29",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T10:00:00.000Z"
  },
  {
    "id": "seed0092",
    "data": "2026-07-29",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T11:00:00.000Z"
  },
  {
    "id": "seed0093",
    "data": "2026-07-30",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA GESSO + RX",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T07:00:00.000Z"
  },
  {
    "id": "seed0094",
    "data": "2026-07-30",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T08:00:00.000Z"
  },
  {
    "id": "seed0095",
    "data": "2026-07-30",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T12:00:00.000Z"
  },
  {
    "id": "seed0096",
    "data": "2026-07-31",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO RETORNO -ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "TLM-2D25",
    "motorista": "OF. OPERACIONAL MOTORISTA JOSÉ ROBERTO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-31T11:00:00.000Z"
  },
  {
    "id": "seed0097",
    "data": "2026-07-31",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FÁBIO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-31T11:00:00.000Z"
  },
  {
    "id": "seed0098",
    "data": "2026-08-03",
    "hora": "06:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO PARA ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUQ-3I89",
    "motorista": "OF. OPERACIONAL -MOTORISTA EXPEDITO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T06:00:00.000Z"
  },
  {
    "id": "seed0099",
    "data": "2026-08-03",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T11:00:00.000Z"
  },
  {
    "id": "seed0100",
    "data": "2026-08-03",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "CR",
    "local": "HCI - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "PÓS-CIRURGIA",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T12:00:00.000Z"
  },
  {
    "id": "seed0101",
    "data": "2026-08-03",
    "hora": "13:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "RAIO X",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL FÁBIO AUGUSTO",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T13:00:00.000Z"
  },
  {
    "id": "seed0102",
    "data": "2026-08-04",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "TRÂNSITO CDP BAURU",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "TRÂNSITO",
    "viatura": "FKN-6069",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 15",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-04T07:00:00.000Z"
  },
  {
    "id": "seed0103",
    "data": "2026-08-04",
    "hora": "07:45",
    "tipo": "externa",
    "regime": "FE",
    "local": "FÓRUM DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "JURI",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 2",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-04T07:45:00.000Z"
  },
  {
    "id": "seed0104",
    "data": "2026-08-04",
    "hora": "07:45",
    "tipo": "externa",
    "regime": "FE",
    "local": "FÓRUM DE POMPÉIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "JURI",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FÁBIO AUGUSTO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-04T07:45:00.000Z"
  },
  {
    "id": "seed0105",
    "data": "2026-08-05",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-05T08:00:00.000Z"
  },
  {
    "id": "seed0106",
    "data": "2026-08-05",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FÁBIO AUGUSTO",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-05T11:00:00.000Z"
  },
  {
    "id": "seed0107",
    "data": "2026-08-05",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCI - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "GASTRO CIRURGIA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-05T12:00:00.000Z"
  },
  {
    "id": "seed0108",
    "data": "2026-08-06",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL TURNO III",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T07:00:00.000Z"
  },
  {
    "id": "seed0109",
    "data": "2026-08-06",
    "hora": "08:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "DENTISTA CR MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "DENTISTA",
    "viatura": "FYI-5976",
    "motorista": "POLICIAL PENAL FÁBIO AUGUSTO",
    "observacoes": "Quantidade PPL: 3",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T08:00:00.000Z"
  },
  {
    "id": "seed0110",
    "data": "2026-08-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC III - SÃO FRANCISCO",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "OTORRINO",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T07:00:00.000Z"
  },
  {
    "id": "seed0111",
    "data": "2026-08-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "FCW-8I62",
    "motorista": "POLICIAL PENAL TURNO I",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T07:00:00.000Z"
  },
  {
    "id": "seed0112",
    "data": "2026-08-07",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "TRANSPORTE DE SERVIDORES DA AUTOMAÇÃO RETORNO -ARARAQUARA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "AUTOMAÇÃO",
    "viatura": "CUQ-3I89",
    "motorista": "OF. OPERACIONAL MOTORISTA JOSÉ ROBERTO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T11:00:00.000Z"
  },
  {
    "id": "seed0113",
    "data": "2026-08-07",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "SANTA CASA DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "HEMODIÁLISE",
    "viatura": "FJG-7158",
    "motorista": "POLICIAL PENAL MÁRCIO EDEN",
    "observacoes": "Quantidade PPL: 1",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T11:00:00.000Z"
  },
  {
    "id": "seed0114",
    "data": "2026-06-02",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP",
    "matricula": "1363890",
    "nome": "FABIO SOARES",
    "tipoApresentacao": "CIRURGIA VASCULAR",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-02T08:00:00.000Z"
  },
  {
    "id": "seed0115",
    "data": "2026-06-02",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "1241190-6",
    "nome": "JHONATAN MINEO OLIVEIRA",
    "tipoApresentacao": "CIRURGIA VASCULAR",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-02T07:00:00.000Z"
  },
  {
    "id": "seed0116",
    "data": "2026-06-02",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "826810-4",
    "nome": "ALAN DE JESUS DE ASSIS",
    "tipoApresentacao": "ORTOPEDIA INTERNAÇÃO",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-02T07:00:00.000Z"
  },
  {
    "id": "seed0117",
    "data": "2026-06-03",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "1.278.865-9",
    "nome": "DORIVAL MARCOS DE JESUS JUNIOR",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T07:00:00.000Z"
  },
  {
    "id": "seed0118",
    "data": "2026-06-03",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1280090",
    "nome": "RODRIGO DE OLIVEIRA VARGAS",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T14:00:00.000Z"
  },
  {
    "id": "seed0119",
    "data": "2026-06-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1418182",
    "nome": "GUSTAVO GABRIEL ROCHA DA SILVA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T08:00:00.000Z"
  },
  {
    "id": "seed0120",
    "data": "2026-06-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1337802",
    "nome": "VALDENIR MARQUES SANTANA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T08:00:00.000Z"
  },
  {
    "id": "seed0121",
    "data": "2026-06-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "351442",
    "nome": "DENILSON GONCALVES",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T08:00:00.000Z"
  },
  {
    "id": "seed0122",
    "data": "2026-06-03",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319",
    "matricula": "179.124-3",
    "nome": "GENIVAL APARECIDO DAMASIO",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-03T10:00:00.000Z"
  },
  {
    "id": "seed0123",
    "data": "2026-06-05",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "104.326-4",
    "nome": "LUIZ ROBERTO DUQUE MACIEL",
    "tipoApresentacao": "ELETROCARDIOGRAMA E RAIOX TORAX",
    "viatura": "",
    "motorista": "MARCIO EDEN",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-05T08:00:00.000Z"
  },
  {
    "id": "seed0124",
    "data": "2026-06-08",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "771500",
    "nome": "EDSON DOMINGOS PEREIRA",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T07:00:00.000Z"
  },
  {
    "id": "seed0125",
    "data": "2026-06-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "930376",
    "nome": "LUIS FERNANDO MOREIRA",
    "tipoApresentacao": "PSIQUITRIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T08:00:00.000Z"
  },
  {
    "id": "seed0126",
    "data": "2026-06-08",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1470653-5",
    "nome": "CLEBER DOS SANTOS MARQUES",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T14:00:00.000Z"
  },
  {
    "id": "seed0127",
    "data": "2026-06-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1230874-8",
    "nome": "ROBERTO GONCALVES VICENTE",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T08:00:00.000Z"
  },
  {
    "id": "seed0128",
    "data": "2026-06-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1155624-8",
    "nome": "WALLACE DAVID CIPRIANO RIBEIRO",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T08:00:00.000Z"
  },
  {
    "id": "seed0129",
    "data": "2026-06-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "605226-0",
    "nome": "JAIRO MARTINS DE ARAUJO",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-08T08:00:00.000Z"
  },
  {
    "id": "seed0130",
    "data": "2026-06-09",
    "hora": "11:30",
    "tipo": "externa",
    "regime": "CR",
    "local": "HOSPITAL SÃO FRANCISCO",
    "matricula": "1368180",
    "nome": "RICARDO ALVES DE SOUZA",
    "tipoApresentacao": "CARDIOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-09T11:30:00.000Z"
  },
  {
    "id": "seed0131",
    "data": "2026-06-11",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPÍTAL SÃO FRANCISCO",
    "matricula": "1455980",
    "nome": "RODRIGO PIRES FERREIRA",
    "tipoApresentacao": "CIRURGIA VASCULAR",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T07:00:00.000Z"
  },
  {
    "id": "seed0132",
    "data": "2026-06-11",
    "hora": "07:30",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "590163",
    "nome": "WELINGTON DE BASTIANI PEREIRA",
    "tipoApresentacao": "COLANGIORRESSONANCIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T07:30:00.000Z"
  },
  {
    "id": "seed0133",
    "data": "2026-06-11",
    "hora": "09:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "590163",
    "nome": "",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-11T09:00:00.000Z"
  },
  {
    "id": "seed0134",
    "data": "2026-06-15",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP",
    "matricula": "1062979-8",
    "nome": "LUCAS DE ALMEIDA COSTA (1짧 consulta)",
    "tipoApresentacao": "INFECTOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T07:00:00.000Z"
  },
  {
    "id": "seed0135",
    "data": "2026-06-15",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "104.326-4",
    "nome": "LUIZ ROBERTO DUQUE MACIEL",
    "tipoApresentacao": "UROLOGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T12:00:00.000Z"
  },
  {
    "id": "seed0136",
    "data": "2026-06-15",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCII - MATERNO INFANTIL",
    "matricula": "1177751-3",
    "nome": "WENDEL WILGNER FERREIRA DA SILVA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T14:00:00.000Z"
  },
  {
    "id": "seed0137",
    "data": "2026-06-15",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCII - MATERNO INFANTIL",
    "matricula": "449472-0",
    "nome": "PAULO HENRIQUE DE OLIVEIRA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-15T08:00:00.000Z"
  },
  {
    "id": "seed0138",
    "data": "2026-06-18",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP",
    "matricula": "1056502-6",
    "nome": "ALESSANDRO MATHEUS DOS SANTOS",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-18T07:00:00.000Z"
  },
  {
    "id": "seed0139",
    "data": "2026-06-18",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "771.500-6",
    "nome": "EDSON DOMINGOS PEREIRA",
    "tipoApresentacao": "INFECTO GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-18T12:00:00.000Z"
  },
  {
    "id": "seed0140",
    "data": "2026-06-19",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL DAS CLÍNICAS DE BOTUCATU",
    "matricula": "1190864",
    "nome": "EVANDRO JOSÉ FERREIRA",
    "tipoApresentacao": "LITOTRIPSIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T07:00:00.000Z"
  },
  {
    "id": "seed0141",
    "data": "2026-06-19",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP",
    "matricula": "382900-9",
    "nome": "JOãO CARLOS GRINITI",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T07:00:00.000Z"
  },
  {
    "id": "seed0142",
    "data": "2026-06-19",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "629896",
    "nome": "BRENO PITA DE MAGALHAES",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-19T07:00:00.000Z"
  },
  {
    "id": "seed0143",
    "data": "2026-06-22",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP",
    "matricula": "419766-1",
    "nome": "RODRIGO GOMES DE SOUZA",
    "tipoApresentacao": "FISIATRIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-22T07:00:00.000Z"
  },
  {
    "id": "seed0144",
    "data": "2026-06-23",
    "hora": "06:30",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "104.326-4",
    "nome": "LUIZ ROBERTO DUQUE MACIEL",
    "tipoApresentacao": "UROLOGIA GERAL- CIRURGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-23T06:30:00.000Z"
  },
  {
    "id": "seed0145",
    "data": "2026-06-23",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "CR",
    "local": "CHSP",
    "matricula": "1368180",
    "nome": "RICARDO ALVES DE SOUZA",
    "tipoApresentacao": "CONSULTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-23T10:00:00.000Z"
  },
  {
    "id": "seed0146",
    "data": "2026-06-25",
    "hora": "09:40",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "1311793-2",
    "nome": "LEONARDO VINICIUS DE FREITAS OLIVEIRA",
    "tipoApresentacao": "ECODOPPLERCARDIOGRAMA TRANSTORACICO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-25T09:40:00.000Z"
  },
  {
    "id": "seed0147",
    "data": "2026-06-26",
    "hora": "06:40",
    "tipo": "externa",
    "regime": "SA",
    "local": "UPA ZONA NORTE",
    "matricula": "951160",
    "nome": "WESLEY ROBERT DOS SANTOS",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-26T06:40:00.000Z"
  },
  {
    "id": "seed0148",
    "data": "2026-06-26",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "UPA ZONA NORTE",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-06-26T08:00:00.000Z"
  },
  {
    "id": "seed0149",
    "data": "2026-07-01",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "1341929",
    "nome": "THIEGO DE SOUSA CORREA",
    "tipoApresentacao": "TRAUMA DE FACE",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T07:00:00.000Z"
  },
  {
    "id": "seed0150",
    "data": "2026-07-01",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1092868",
    "nome": "MARCELO JOSE ANIBAL",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T08:00:00.000Z"
  },
  {
    "id": "seed0151",
    "data": "2026-07-01",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1193339",
    "nome": "JOAO VITOR DOS SANTOS",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T08:00:00.000Z"
  },
  {
    "id": "seed0152",
    "data": "2026-07-01",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1280223",
    "nome": "JHONATHAN FRANCISCO",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T08:00:00.000Z"
  },
  {
    "id": "seed0153",
    "data": "2026-07-01",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua: Dr.Joaquim Sampaio Vidal - 319",
    "matricula": "1079076-4",
    "nome": "LUAN CARDOSO MARINHO",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-01T10:00:00.000Z"
  },
  {
    "id": "seed0154",
    "data": "2026-07-02",
    "hora": "07:50",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "1307539",
    "nome": "CARLOS ALBERTO PEREIRA REGINALDO",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T07:50:00.000Z"
  },
  {
    "id": "seed0155",
    "data": "2026-07-02",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1163963",
    "nome": "BRUNO HENRIQUE DIAS",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T08:00:00.000Z"
  },
  {
    "id": "seed0156",
    "data": "2026-07-02",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1230874-8",
    "nome": "ROBERTO GONCALVES VICENTE",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T08:00:00.000Z"
  },
  {
    "id": "seed0157",
    "data": "2026-07-02",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1373228",
    "nome": "JOAO VITOR GONCALVES",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T08:00:00.000Z"
  },
  {
    "id": "seed0158",
    "data": "2026-07-02",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "1056502-6",
    "nome": "ALESSANDRO MATHEUS DOS SANTOS",
    "tipoApresentacao": "FISIOTERAPIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-02T07:00:00.000Z"
  },
  {
    "id": "seed0159",
    "data": "2026-07-03",
    "hora": "07:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "H. SÃOFRANCISCO",
    "matricula": "771.500-6",
    "nome": "EDSON DOMINGOS PEREIRA",
    "tipoApresentacao": "INFECTO GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T07:00:00.000Z"
  },
  {
    "id": "seed0160",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "988163",
    "nome": "ALLEF MONTEIRO MATIAS",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0161",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "1293802",
    "nome": "CAIO EUCLIDES DA SILVA",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0162",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "809966",
    "nome": "LUCAS FERNANDO DA SILVA",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0163",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA",
    "matricula": "1342415",
    "nome": "MURILO APARECIDO LEAL NUNES",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0164",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CR DE MARÍLIA",
    "matricula": "1305834",
    "nome": "LEONARDO CAETANO DA SILVA",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0165",
    "data": "2026-07-03",
    "hora": "08:10",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "1000177-4",
    "nome": "WESLEY HENRIQUE DA SILVA ALVES",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:10:00.000Z"
  },
  {
    "id": "seed0166",
    "data": "2026-07-03",
    "hora": "08:20",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "1311793-2",
    "nome": "LEONARDO VINICIUS DE FREITAS OLIVEIRA",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:20:00.000Z"
  },
  {
    "id": "seed0167",
    "data": "2026-07-03",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PENITENCIÁRIA 2 DE ÁLVARO DE CARVALHO",
    "matricula": "1072223",
    "nome": "FABRICIO APARECIDO RODRIGUES",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T14:00:00.000Z"
  },
  {
    "id": "seed0168",
    "data": "2026-07-03",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "PENITENCIÁRIA 1 DE GÁLIA",
    "matricula": "977523",
    "nome": "ALEX APARECIDO DOS SANTOS",
    "tipoApresentacao": "REMOÇÃO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-03T08:00:00.000Z"
  },
  {
    "id": "seed0169",
    "data": "2026-07-06",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "1206647-8",
    "nome": "PEDRO VANIN BOVO",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-06T07:00:00.000Z"
  },
  {
    "id": "seed0170",
    "data": "2026-07-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CHSP",
    "matricula": "1304538",
    "nome": "MARCOS VICTOR DA SILVA MAURICIO",
    "tipoApresentacao": "DERMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T07:00:00.000Z"
  },
  {
    "id": "seed0171",
    "data": "2026-07-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "1365255-7",
    "nome": "EVERTON LUIS ROMEIRO VALENTIM",
    "tipoApresentacao": "DERMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T07:00:00.000Z"
  },
  {
    "id": "seed0172",
    "data": "2026-07-07",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1280223",
    "nome": "JHONATAN LEAL",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T08:00:00.000Z"
  },
  {
    "id": "seed0173",
    "data": "2026-07-07",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1193339",
    "nome": "JOÃO SILVA",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-07T08:00:00.000Z"
  },
  {
    "id": "seed0174",
    "data": "2026-07-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "1318093",
    "nome": "DENIS COSTA",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T08:00:00.000Z"
  },
  {
    "id": "seed0175",
    "data": "2026-07-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "752064",
    "nome": "JOSÉ PONTES",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T08:00:00.000Z"
  },
  {
    "id": "seed0176",
    "data": "2026-07-08",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "CR DE MARÍLIA - DENTISTA",
    "matricula": "600992",
    "nome": "EVERTON FRANCISCO",
    "tipoApresentacao": "DENTISTA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-08T08:00:00.000Z"
  },
  {
    "id": "seed0177",
    "data": "2026-07-13",
    "hora": "11:00",
    "tipo": "externa",
    "regime": "CR",
    "local": "HOSPITAL DE CLÍNICAS DE MARÍLIA",
    "matricula": "",
    "nome": "",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-13T11:00:00.000Z"
  },
  {
    "id": "seed0178",
    "data": "2026-07-14",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "485077-2",
    "nome": "ANDRE CRISTIANO DOS SANTOS",
    "tipoApresentacao": "UROLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-14T07:00:00.000Z"
  },
  {
    "id": "seed0179",
    "data": "2026-07-14",
    "hora": "08:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HEMOCENTRO- MARILIA",
    "matricula": "629896",
    "nome": "BRENO PITA DE MAGALHAES",
    "tipoApresentacao": "HEMOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-14T08:00:00.000Z"
  },
  {
    "id": "seed0180",
    "data": "2026-07-14",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "1021072",
    "nome": "MARCIO ALVES BARBOSA",
    "tipoApresentacao": "NEURO VASCULAR",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-14T12:00:00.000Z"
  },
  {
    "id": "seed0181",
    "data": "2026-07-15",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319",
    "matricula": "179.124-3",
    "nome": "GENIVAL APARECIDO DAMASIO",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-15T10:00:00.000Z"
  },
  {
    "id": "seed0182",
    "data": "2026-07-16",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "1244182-0",
    "nome": "PRESLEI PEREIRA",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T07:00:00.000Z"
  },
  {
    "id": "seed0183",
    "data": "2026-07-16",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "1225897",
    "nome": "LEONARDO FREIRE FARINELLI",
    "tipoApresentacao": "PSIQUIATRIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T07:00:00.000Z"
  },
  {
    "id": "seed0184",
    "data": "2026-07-16",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL DAS CLÍNICAS DE BOTUCATU",
    "matricula": "1190864",
    "nome": "EVANDRO JOSÉ FERREIRA",
    "tipoApresentacao": "NEFROLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-16T14:00:00.000Z"
  },
  {
    "id": "seed0185",
    "data": "2026-07-17",
    "hora": "08:10",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "1143204-4",
    "nome": "MOISES CARLOS DE OLIVEIRA BELIZARIO",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-17T08:10:00.000Z"
  },
  {
    "id": "seed0186",
    "data": "2026-07-20",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC – UNICAMP",
    "matricula": "1249521",
    "nome": "TIAGO CAIQUE ALMEIDA DE MORAES",
    "tipoApresentacao": "ORTOPEDIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-20T07:00:00.000Z"
  },
  {
    "id": "seed0187",
    "data": "2026-07-22",
    "hora": "08:10",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "1410948",
    "nome": "ROGÉRIO ZANATA",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-22T08:10:00.000Z"
  },
  {
    "id": "seed0188",
    "data": "2026-07-23",
    "hora": "07:20",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC- IMAGEM",
    "matricula": "536017",
    "nome": "PEDRO HENRIQUE RAMOS DA SILVA",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-23T07:20:00.000Z"
  },
  {
    "id": "seed0189",
    "data": "2026-07-24",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "629896",
    "nome": "BRENO PITA DE MAGALHAES",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-24T07:00:00.000Z"
  },
  {
    "id": "seed0190",
    "data": "2026-07-27",
    "hora": "09:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CENTRO MÉDICO ACONCHEGO - MARÍLIA",
    "matricula": "536053",
    "nome": "ARTHUR FLAVIO PORTONI SOUZA",
    "tipoApresentacao": "ULTRASSON PAREDE ABDOMINAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-27T09:00:00.000Z"
  },
  {
    "id": "seed0191",
    "data": "2026-07-28",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "IMESC SÃO PAULO",
    "matricula": "680843-0",
    "nome": "FLAVIO GOMES FERREIRA",
    "tipoApresentacao": "PERÍCIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T07:00:00.000Z"
  },
  {
    "id": "seed0192",
    "data": "2026-07-28",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "629896",
    "nome": "BRENO PITA DE MAGALHAES",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T07:00:00.000Z"
  },
  {
    "id": "seed0193",
    "data": "2026-07-28",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "771.500-6",
    "nome": "CLEBER DOS SANTOS MARQUES",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T14:00:00.000Z"
  },
  {
    "id": "seed0194",
    "data": "2026-07-28",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1230790",
    "nome": "CAIO HENRIQUE COELHO RIBEIRO",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T14:00:00.000Z"
  },
  {
    "id": "seed0195",
    "data": "2026-07-28",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1481987",
    "nome": "JEFFERSON DE SOUZA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-28T14:00:00.000Z"
  },
  {
    "id": "seed0196",
    "data": "2026-07-29",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "1341929",
    "nome": "THIEGO DE SOUSA CORREA",
    "tipoApresentacao": "TRAUMA DE FACE",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T07:00:00.000Z"
  },
  {
    "id": "seed0197",
    "data": "2026-07-29",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319",
    "matricula": "1365255-7",
    "nome": "EVERTON LUIS ROMEIRO VALENTIM",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-29T10:00:00.000Z"
  },
  {
    "id": "seed0198",
    "data": "2026-07-30",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CHSP - via CDP Bauru",
    "matricula": "826810",
    "nome": "ALAN DE JESUS DE ASSIS",
    "tipoApresentacao": "NEUROLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T07:00:00.000Z"
  },
  {
    "id": "seed0199",
    "data": "2026-07-30",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "245202",
    "nome": "ROGERIO MARTINS DE CARVALHO",
    "tipoApresentacao": "ORTOPEDIA GESSO + RX",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T07:00:00.000Z"
  },
  {
    "id": "seed0200",
    "data": "2026-07-30",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "827877",
    "nome": "CASSIO SOUZA SANTOS",
    "tipoApresentacao": "CIRURGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T12:00:00.000Z"
  },
  {
    "id": "seed0201",
    "data": "2026-07-30",
    "hora": "13:10",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "1456981",
    "nome": "JOSÉ HORÁCIO DE OLIVEIRA",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T13:10:00.000Z"
  },
  {
    "id": "seed0202",
    "data": "2026-07-30",
    "hora": "13:20",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "218338",
    "nome": "REGINALDO CESAR SEVERINO",
    "tipoApresentacao": "ELETROCARDIOGRAMA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-07-30T13:20:00.000Z"
  },
  {
    "id": "seed0203",
    "data": "2026-08-03",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "CR",
    "local": "HCI - MÁRIO COVAS",
    "matricula": "1351105",
    "nome": "LUCAS RENAM CLAUDINO BETTI",
    "tipoApresentacao": "PÓS-CIRURGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T12:00:00.000Z"
  },
  {
    "id": "seed0204",
    "data": "2026-08-03",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1056268",
    "nome": "LUCAS FRANCISCO GODOI DE LIMA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T14:00:00.000Z"
  },
  {
    "id": "seed0205",
    "data": "2026-08-03",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "943202",
    "nome": "DANIEL BARBOSA DA SILVA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T14:00:00.000Z"
  },
  {
    "id": "seed0206",
    "data": "2026-08-03",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1106521",
    "nome": "RAFAEL TORRES DE SOUZA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-03T14:00:00.000Z"
  },
  {
    "id": "seed0207",
    "data": "2026-08-05",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCI - MÁRIO COVAS",
    "matricula": "1353312",
    "nome": "ALEXANDRE RICARDO DA SILVA PEREIRA",
    "tipoApresentacao": "GASTRO CIRURGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-05T12:00:00.000Z"
  },
  {
    "id": "seed0208",
    "data": "2026-08-06",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "1021072",
    "nome": "MARCIO ALVES BARBOSA",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T07:00:00.000Z"
  },
  {
    "id": "seed0209",
    "data": "2026-08-06",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "273101",
    "nome": "WELLINGTON ALVES SILVA",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T07:00:00.000Z"
  },
  {
    "id": "seed0210",
    "data": "2026-08-06",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1056268",
    "nome": "LUCAS FRANCISCO GODOI DE LIMA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T14:00:00.000Z"
  },
  {
    "id": "seed0211",
    "data": "2026-08-06",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "943202",
    "nome": "DANIEL BARBOSA DA SILVA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T14:00:00.000Z"
  },
  {
    "id": "seed0212",
    "data": "2026-08-06",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1106521",
    "nome": "RAFAEL TORRES DE SOUZA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T14:00:00.000Z"
  },
  {
    "id": "seed0213",
    "data": "2026-08-06",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL MATERNO INFANTIL",
    "matricula": "1455980",
    "nome": "RAFAEL TORRES DE SOUZA",
    "tipoApresentacao": "RAIO X",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-06T14:00:00.000Z"
  },
  {
    "id": "seed0214",
    "data": "2026-08-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC III - SÃO FRANCISCO",
    "matricula": "1095038",
    "nome": "MATHEUS MOREIRA DOS SANTOS",
    "tipoApresentacao": "OTORRINO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T07:00:00.000Z"
  },
  {
    "id": "seed0215",
    "data": "2026-08-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC III - SÃO FRANCISCO",
    "matricula": "536053",
    "nome": "ARTHUR FLAVIO PORTONI SOUZA",
    "tipoApresentacao": "INFECTOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T07:00:00.000Z"
  },
  {
    "id": "seed0216",
    "data": "2026-08-07",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "811668",
    "nome": "ALAN SOARES FARIA",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-07T07:00:00.000Z"
  },
  {
    "id": "seed0217",
    "data": "2026-08-11",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HCI MARIO COVAS",
    "matricula": "629896",
    "nome": "BRENO PITA DE MAGALHAES",
    "tipoApresentacao": "REUMATOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-11T07:00:00.000Z"
  },
  {
    "id": "seed0218",
    "data": "2026-08-13",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HC I MARIO COVAS",
    "matricula": "245202",
    "nome": "ROGERIO MARTINS DE CARVALHO",
    "tipoApresentacao": "ORTOPEDIA GESSO + RX",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-13T07:00:00.000Z"
  },
  {
    "id": "seed0219",
    "data": "2026-08-13",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC III - SÃO FRANCISCO",
    "matricula": "581859",
    "nome": "LUCIANO JUSTINO DE MATOS",
    "tipoApresentacao": "INFECTOLOGIA",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-13T12:00:00.000Z"
  },
  {
    "id": "seed0220",
    "data": "2026-08-14",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC I - MÁRIO COVAS",
    "matricula": "1271827",
    "nome": "BRUNO BARAUNA SANTOS",
    "tipoApresentacao": "ORTOPEDIA GESSO",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-14T07:00:00.000Z"
  },
  {
    "id": "seed0221",
    "data": "2026-08-17",
    "hora": "12:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HCI MARIO COVAS",
    "matricula": "1199009-0",
    "nome": "WESLEY MATHEUS MOREIRA CORREA",
    "tipoApresentacao": "UROLOGIA GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-17T12:00:00.000Z"
  },
  {
    "id": "seed0222",
    "data": "2026-08-18",
    "hora": "07:00",
    "tipo": "interna",
    "regime": "SA",
    "local": "H. SÃO FRANCISCO",
    "matricula": "771.500-6",
    "nome": "EDSON DOMINGOS PEREIRA",
    "tipoApresentacao": "INFECTO GERAL",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-18T07:00:00.000Z"
  },
  {
    "id": "seed0223",
    "data": "2026-08-19",
    "hora": "10:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "CAPS AD - Rua: Dr.Joaquim Sampaio Vidal - 319",
    "matricula": "1079076-4",
    "nome": "LUAN CARDOSO MARINHO",
    "tipoApresentacao": "MEDIDA DE SEGURANÇA ( TRATAMENTO AMBULATORIAL)",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-19T10:00:00.000Z"
  },
  {
    "id": "seed0224",
    "data": "2026-08-24",
    "hora": "07:00",
    "tipo": "externa",
    "regime": "SA",
    "local": "HOSPITAL ESTADUAL DE BAURU",
    "matricula": "1314231",
    "nome": "ALEX SANDRO ALVES SOARES",
    "tipoApresentacao": "BIÓPSIA DE PELE",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-24T07:00:00.000Z"
  },
  {
    "id": "seed0225",
    "data": "2026-08-25",
    "hora": "14:00",
    "tipo": "externa",
    "regime": "FE",
    "local": "HC – RECEPÇÃO ENDOSCOPIA",
    "matricula": "827877",
    "nome": "CASSIO SOUZA SANTOS",
    "tipoApresentacao": "EXTRAÇÃO CATETER DUPLO J",
    "viatura": "",
    "motorista": "ARMANDO",
    "observacoes": "",
    "operador": {
      "name": "Admin",
      "mat": "000000"
    },
    "createdAt": "2026-08-25T14:00:00.000Z"
  }
];

/* ---------- Função de importação ---------- */
function importSeedData() {
    const existing = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
    
    // Evita duplicatas: só importa se localStorage estiver vazio ou quase vazio
    if (existing.length > 10) {
        const proceed = confirm(
            `Já existem ${existing.length} saídas no sistema.\n` +
