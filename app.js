/* ============================================================
   CONTROLE DE TRÂNSITO — VERSÃO SUPABASE (MULTI-SETOR)
   ============================================================
   Antes de usar, substitua SUPABASE_URL e SUPABASE_ANON_KEY
   pelos valores do seu projeto no dashboard do Supabase.
   ============================================================ */

const SUPABASE_URL     = 'https://SUA_URL.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';

// Cliente Supabase global
let supabaseClient = null;

function initSupabase() {
    if (!window.supabase) {
        console.error('SDK do Supabase não carregado. Verifique o script no HTML.');
        return false;
    }
    if (SUPABASE_URL.includes('SUA_URL') || SUPABASE_ANON_KEY.includes('SUA_ANON_KEY')) {
        console.warn('Configure SUPABASE_URL e SUPABASE_ANON_KEY no topo de app.js');
        return false;
    }
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase inicializado com sucesso');
        return true;
    } catch (e) {
        console.error('Erro ao criar cliente Supabase:', e);
        return false;
    }
}

/* ============================================================
   APP
   ============================================================ */
const App = {
    saidas: [],
    auditLog: [],
    adminList: [],
    currentOperator: null,
    deleteTargetId: null,
    editTargetId: null,
    isLoading: false,

    /* ---------- INICIALIZAÇÃO ---------- */
    async init() {
        console.log('App.init() iniciando...');
        try {
            initSupabase();
            this.bindLoginEvents();
            this.checkSession();
            console.log('App.init() concluído');
        } catch (e) {
            console.error('Erro em App.init():', e);
        }
    },

    checkSession() {
        console.log('Verificando sessão...');
        const saved = sessionStorage.getItem('ct_operator');
        if (saved) {
            try {
                this.currentOperator = JSON.parse(saved);
                console.log('Sessão encontrada:', this.currentOperator.name);
                this.enterApp();
            } catch (e) {
                console.error('Erro ao restaurar sessão:', e);
                sessionStorage.removeItem('ct_operator');
            }
        } else {
            console.log('Nenhuma sessão salva');
        }
    },

    bindLoginEvents() {
        console.log('Vinculando eventos de login...');
        const btnLogin = document.getElementById('btn-login');
        const nameInput = document.getElementById('operator-name');
        const matInput = document.getElementById('operator-mat');
        const btnLogout = document.getElementById('btn-logout');

        if (btnLogin) btnLogin.addEventListener('click', () => this.doLogin());
        if (nameInput) nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doLogin(); });
        if (matInput) matInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doLogin(); });
        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());
    },

    async doLogin() {
        console.log('Iniciando login...');
        const name = document.getElementById('operator-name').value.trim();
        const mat  = document.getElementById('operator-mat').value.trim();
        const err  = document.getElementById('login-error');

        if (!name || !mat) {
            if (err) err.textContent = 'Preencha nome e matrícula.';
            console.warn('Campos de login vazios');
            return;
        }

        console.log(`Tentando login: nome="${name}", mat="${mat}"`);

        let admins = [];
        let supabaseOk = false;

        // Tenta buscar admins do Supabase
        if (supabaseClient) {
            try {
                console.log('Buscando admins no Supabase...');
                const { data, error } = await supabaseClient.from('admins').select('*');
                if (error) {
                    console.error('Erro Supabase ao buscar admins:', error.message);
                } else if (data && data.length > 0) {
                    console.log(`Admins encontrados no Supabase: ${data.length}`);
                    admins = data;
                    supabaseOk = true;
                } else {
                    console.log('Nenhum admin encontrado no Supabase');
                }
            } catch (e) {
                console.error('Exceção ao buscar admins no Supabase:', e);
            }
        } else {
            console.log('Supabase não configurado, usando localStorage');
        }

        // Fallback para localStorage
        if (!supabaseOk) {
            try {
                const localAdmins = JSON.parse(localStorage.getItem('ct_admins') || '[]');
                if (localAdmins.length > 0) {
                    console.log(`Admins encontrados no localStorage: ${localAdmins.length}`);
                    admins = localAdmins;
                } else {
                    console.log('Nenhum admin no localStorage');
                }
            } catch (e) {
                console.error('Erro ao ler admins do localStorage:', e);
            }
        }

        // Verifica se é admin (comparação flexível)
        const isAdmin = admins.some(a => {
            const adminMat = String(a.matricula || a.mat || '').trim();
            const adminNome = String(a.nome || a.name || '').trim().toLowerCase();
            const inputNome = name.toLowerCase();
            const match = adminMat === mat && adminNome === inputNome;
            if (match) console.log(`Admin match: ${adminNome} / ${adminMat}`);
            return match;
        });

        console.log(`É admin? ${isAdmin}`);

        this.currentOperator = { name, mat, isAdmin };
        sessionStorage.setItem('ct_operator', JSON.stringify(this.currentOperator));
        if (err) err.textContent = '';
        this.enterApp();
    },

    logout() {
        console.log('Logout');
        this.currentOperator = null;
        sessionStorage.removeItem('ct_operator');
        const loginScreen = document.getElementById('login-screen');
        const mainScreen = document.getElementById('main-screen');
        if (loginScreen) loginScreen.classList.add('active');
        if (mainScreen) {
            mainScreen.classList.remove('active');
            mainScreen.style.display = 'none';
        }
    },

    /* ---------- ENTRADA NO APP ---------- */
    async enterApp() {
        console.log('Entrando no app...');
        try {
            const loginScreen = document.getElementById('login-screen');
            const mainScreen = document.getElementById('main-screen');
            if (loginScreen) loginScreen.classList.remove('active');
            if (mainScreen) {
                mainScreen.style.display = 'flex';
                setTimeout(() => mainScreen.classList.add('active'), 10);
            }

            const displayName = document.getElementById('display-operator-name');
            const displayMat = document.getElementById('display-operator-mat');
            const avatar = document.getElementById('operator-avatar');

            if (displayName) displayName.textContent = this.currentOperator.name;
            if (displayMat) displayMat.textContent = `Mat: ${this.currentOperator.mat}`;
            if (avatar) avatar.textContent = this.currentOperator.name.charAt(0).toUpperCase();

            const navConfig = document.getElementById('nav-configuracoes');
            const navAudit = document.getElementById('nav-auditoria');
            if (this.isAdmin()) {
                console.log('Usuário é admin, mostrando menus');
                if (navConfig) navConfig.style.display = 'flex';
                if (navAudit) navAudit.style.display = 'flex';
            } else {
                console.log('Usuário é operador comum');
                if (navConfig) navConfig.style.display = 'none';
                if (navAudit) navAudit.style.display = 'none';
            }

            console.log('Configurando navegação...');
            this.setupNavigation();
            console.log('Configurando formulário...');
            this.setupFormCadastro();
            console.log('Configurando filtros...');
            this.setupFiltrosListagem();
            console.log('Configurando relatório...');
            this.setupRelatorio();
            console.log('Configurando configurações...');
            this.setupConfiguracoes();
            console.log('Configurando auditoria...');
            this.setupAuditoria();
            console.log('Configurando modais...');
            this.setupModalEvents();

            console.log('Carregando dados...');
            await this.loadData();
            console.log('Renderizando dashboard...');
            this.renderDashboard();
            console.log('Renderizando saídas...');
            this.renderSaidas();
            console.log('Atualizando badge...');
            this.updateAuditNavBadge();
            console.log('App iniciado com sucesso!');
        } catch (e) {
            console.error('ERRO CRÍTICO em enterApp():', e);
            alert('Erro ao iniciar o aplicativo: ' + e.message + '\n\nVerifique o console (F12) para mais detalhes.');
        }
    },

    /* ---------- SUPABASE: CARREGAR DADOS ---------- */
    async loadData() {
        if (!supabaseClient) {
            console.log('Supabase não configurado. Usando dados locais.');
            this.saidas = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
            this.auditLog = JSON.parse(localStorage.getItem('ct_audit') || '[]');
            this.adminList = JSON.parse(localStorage.getItem('ct_admins') || '[]');
            return;
        }

        this.setLoading(true);
        try {
            console.log('Carregando saídas do Supabase...');
            const { data: saidasData, error: errSaidas } = await supabaseClient
                .from('saidas')
                .select('*')
                .order('data', { ascending: false })
                .order('hora', { ascending: true });
            if (errSaidas) {
                console.error('Erro ao carregar saídas:', errSaidas.message);
                throw errSaidas;
            }
            this.saidas = (saidasData || []).map(s => this.mapSaidaFromDB(s));
            console.log(`${this.saidas.length} saídas carregadas`);

            console.log('Carregando audit logs...');
            const { data: auditData, error: errAudit } = await supabaseClient
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1000);
            if (errAudit) {
                console.error('Erro ao carregar audit logs:', errAudit.message);
                throw errAudit;
            }
            this.auditLog = (auditData || []).map(a => this.mapAuditFromDB(a));
            console.log(`${this.auditLog.length} logs carregados`);

            console.log('Carregando admins...');
            const { data: adminData, error: errAdmin } = await supabaseClient
                .from('admins')
                .select('*');
            if (errAdmin) {
                console.error('Erro ao carregar admins:', errAdmin.message);
                throw errAdmin;
            }
            this.adminList = adminData || [];
            console.log(`${this.adminList.length} admins carregados`);

        } catch (e) {
            console.error('Erro ao carregar do Supabase:', e.message || e);
            this.toast('Erro ao sincronizar com servidor. Usando cache local.', 'error');
            this.saidas = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
            this.auditLog = JSON.parse(localStorage.getItem('ct_audit') || '[]');
            this.adminList = JSON.parse(localStorage.getItem('ct_admins') || '[]');
        } finally {
            this.setLoading(false);
        }
    },

    /* ---------- MAPEAMENTO DB ↔ APP ---------- */
    mapSaidaFromDB(row) {
        return {
            id: row.id,
            data: row.data,
            hora: row.hora,
            tipo: row.tipo,
            local: row.local,
            matricula: row.matricula,
            nome: row.nome,
            tipoApresentacao: row.tipo_apresentacao,
            regime: row.regime,
            viatura: row.viatura,
            motorista: row.motorista,
            observacoes: row.observacoes,
            operador: row.operador || { name: '-', mat: '-' },
            editedAt: row.edited_at,
            editedBy: row.edited_by,
            createdAt: row.created_at
        };
    },

    mapSaidaToDB(s) {
        return {
            id: s.id,
            data: s.data,
            hora: s.hora,
            tipo: s.tipo,
            local: s.local,
            matricula: s.matricula,
            nome: s.nome,
            tipo_apresentacao: s.tipoApresentacao,
            regime: s.regime,
            viatura: s.viatura || '',
            motorista: s.motorista || '',
            observacoes: s.observacoes || '',
            operador: s.operador,
            edited_at: s.editedAt || null,
            edited_by: s.editedBy || null,
            created_at: s.createdAt || new Date().toISOString()
        };
    },

    mapAuditFromDB(row) {
        return {
            id: row.id,
            timestamp: row.timestamp,
            operador: row.operador,
            acao: row.acao,
            targetId: row.target_id,
            oldValues: row.old_values,
            newValues: row.new_values
        };
    },

    mapAuditToDB(a) {
        return {
            id: a.id,
            timestamp: a.timestamp,
            operador: a.operador,
            acao: a.acao,
            target_id: a.targetId,
            old_values: a.oldValues || null,
            new_values: a.newValues || null
        };
    },

    /* ---------- CONTROLE DE ACESSO ---------- */
    isAdmin() {
        if (!this.currentOperator) return false;
        return this.currentOperator.isAdmin === true;
    },

    getVisibleSaidas() {
        if (this.isAdmin()) return this.saidas;
        return this.saidas.filter(s =>
            s.operador &&
            String(s.operador.mat).trim() === String(this.currentOperator.mat).trim()
        );
    },

    canManageSaida(s) {
        if (!s || !this.currentOperator) return false;
        if (this.isAdmin()) return true;
        return String(s.operador?.mat).trim() === String(this.currentOperator.mat).trim();
    },

    /* ---------- NAVEGAÇÃO ---------- */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.id === 'nav-configuracoes' && !this.isAdmin()) return;
                if (item.id === 'nav-auditoria' && !this.isAdmin()) return;
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                const page = item.dataset.page;
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                const pageEl = document.getElementById(`page-${page}`);
                if (pageEl) pageEl.classList.add('active');
                if (page === 'relatorio') this.gerarRelatorio();
                if (page === 'auditoria') this.renderAuditLog();
                if (page === 'configuracoes') this.loadConfigValues();
            });
        });
    },

    /* ---------- CADASTRO ---------- */
    setupFormCadastro() {
        const form = document.getElementById('form-saida');
        const btnLimpar = document.getElementById('btn-limpar');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSaida();
        });
        if (btnLimpar) btnLimpar.addEventListener('click', () => {
            form.reset();
        });
    },

    async saveSaida() {
        const data = document.getElementById('s-data').value;
        const hora = document.getElementById('s-hora').value;
        const tipo = document.getElementById('s-tipo').value;
        const regime = document.getElementById('s-regime').value;
        const local = document.getElementById('s-local').value.trim();
        const matricula = document.getElementById('s-matricula').value.trim();
        const nome = document.getElementById('s-nome').value.trim();
        const tipoApres = document.getElementById('s-tipo-apresentacao').value.trim();
        const viatura = document.getElementById('s-viatura').value.trim();
        const motorista = document.getElementById('s-motorista').value.trim();
        const obs = document.getElementById('s-obs').value.trim();

        if (!data || !hora || !tipo || !regime || !local || !matricula || !nome || !tipoApres) {
            this.toast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const novaSaida = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            data, hora, tipo, regime, local, matricula, nome,
            tipoApresentacao: tipoApres,
            viatura, motorista,
            observacoes: obs,
            operador: { name: this.currentOperator.name, mat: this.currentOperator.mat },
            createdAt: new Date().toISOString()
        };

        this.setLoading(true);
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('saidas').insert(this.mapSaidaToDB(novaSaida));
                if (error) throw error;
            } else {
                this.saidas.push(novaSaida);
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
            }

            await this.loadData();
            this.renderDashboard();
            this.renderSaidas();
            this.toast('Saída cadastrada com sucesso!', 'success');
            const form = document.getElementById('form-saida');
            if (form) form.reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('s-data').value = today;
        } catch (e) {
            console.error(e);
            this.toast('Erro ao salvar saída.', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    /* ---------- LISTAGEM ---------- */
    setupFiltrosListagem() {
        ['filter-data-ini', 'filter-data-fim', 'filter-tipo', 'filter-regime', 'filter-local', 'filter-busca'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.renderSaidas());
        });
        const btnLimpar = document.getElementById('btn-limpar-filtros');
        if (btnLimpar) btnLimpar.addEventListener('click', () => {
            ['filter-data-ini', 'filter-data-fim', 'filter-tipo', 'filter-regime', 'filter-local', 'filter-busca'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.renderSaidas();
        });
    },

    renderSaidas() {
        const tbody = document.getElementById('tbody-saidas');
        if (!tbody) return;
        const ini = document.getElementById('filter-data-ini')?.value || '';
        const fim = document.getElementById('filter-data-fim')?.value || '';
        const tipo = document.getElementById('filter-tipo')?.value || '';
        const regime = document.getElementById('filter-regime')?.value || '';
        const local = (document.getElementById('filter-local')?.value || '').trim().toLowerCase();
        const busca = (document.getElementById('filter-busca')?.value || '').trim().toLowerCase();

        let filtered = this.getVisibleSaidas();
        if (ini) filtered = filtered.filter(s => s.data >= ini);
        if (fim) filtered = filtered.filter(s => s.data <= fim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (local) filtered = filtered.filter(s => (s.local || '').toLowerCase().includes(local));
        if (busca) {
            filtered = filtered.filter(s =>
                (s.nome || '').toLowerCase().includes(busca) ||
                (s.matricula || '').toLowerCase().includes(busca) ||
                (s.tipoApresentacao || '').toLowerCase().includes(busca)
            );
        }
        filtered.sort((a, b) => {
            const d = a.data.localeCompare(b.data);
            return d !== 0 ? d : (a.hora || '').localeCompare(b.hora || '');
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="13" class="empty-cell">Nenhuma saída encontrada com os filtros selecionados.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(s => {
            const recentEdit = this.isEditedRecently(s);
            return `
            <tr class="${recentEdit ? 'row-recent-edit' : ''}">
                <td data-label="Data">${this.fmtDate(s.data)} ${recentEdit ? '<span class="badge badge-recent" title="Editado nas últimas 24h">●</span>' : ''}</td>
                <td data-label="Hora">${s.hora || '-'}</td>
                <td data-label="Local">${s.local || '-'}</td>
                <td data-label="Matrícula">${s.matricula || '-'}</td>
                <td data-label="Nome">${s.nome || '-'}</td>
                <td data-label="Apresentação">${s.tipoApresentacao || '-'}</td>
                <td data-label="Regime"><span class="badge badge-${s.regime}">${s.regime || '-'}</span></td>
                <td data-label="Tipo"><span class="badge badge-tipo-${s.tipo}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span></td>
                <td data-label="Viatura">${s.viatura || '-'}</td>
                <td data-label="Motorista">${s.motorista || '-'}</td>
                <td data-label="Operador"><small style="color:var(--text-secondary)">${s.operador?.name || '-'}<br><span style="color:var(--text-muted)">Mat: ${s.operador?.mat || '-'}</span></small></td>
                <td data-label="Edição">${s.editedAt ? `<small style="color:var(--text-secondary)">${s.editedBy?.name || '-'}<br><span style="color:var(--text-muted)">${this.fmtDateTime(s.editedAt)}</span></small>` : '<small style="color:var(--text-muted)">—</small>'}</td>
                <td data-label="Ações">
                    ${this.canManageSaida(s) ? `<button class="btn-icon" title="Editar" onclick="App.editSaida('${s.id}')">✏️</button>` : ''}
                    ${this.canManageSaida(s) ? `<button class="btn-icon" title="Excluir" onclick="App.deleteSaida('${s.id}')">🗑️</button>` : ''}
                </td>
            </tr>
        `}).join('');
    },

    /* ---------- DASHBOARD ---------- */
    renderDashboard() {
        const visible = this.getVisibleSaidas();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const hoje = visible.filter(s => s.data === today);
        const ext = visible.filter(s => s.tipo === 'externa').length;
        const inte = visible.filter(s => s.tipo === 'interna').length;

        // Semana (domingo a hoje)
        const dayOfWeek = now.getDay();
        const domingo = new Date(now);
        domingo.setDate(now.getDate() - dayOfWeek);
        const domingoStr = domingo.toISOString().split('T')[0];
        const semana = visible.filter(s => s.data >= domingoStr && s.data <= today);

        // Mês
        const mesIni = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        const mes = visible.filter(s => s.data >= mesIni && s.data <= today);

        // Pendentes (sem data/hora de retorno — assumimos que saídas externas sem retorno são pendentes)
        const pendentes = visible.filter(s => s.tipo === 'externa' && !s.retorno && s.data <= today).length;

        // Média diária (dias únicos com saída)
        const diasUnicos = new Set(visible.map(s => s.data)).size;
        const media = diasUnicos ? (visible.length / diasUnicos).toFixed(1) : 0;

        const kpiTotal = document.getElementById('kpi-total');
        const kpiHoje = document.getElementById('kpi-hoje');
        const kpiExt = document.getElementById('kpi-externas');
        const kpiInt = document.getElementById('kpi-internas');
        const kpiSemana = document.getElementById('kpi-semana');
        const kpiMes = document.getElementById('kpi-mes');
        const kpiPendentes = document.getElementById('kpi-pendentes');
        const kpiMedia = document.getElementById('kpi-media');

        if (kpiTotal) kpiTotal.textContent = visible.length;
        if (kpiHoje) kpiHoje.textContent = hoje.length;
        if (kpiExt) kpiExt.textContent = ext;
        if (kpiInt) kpiInt.textContent = inte;
        if (kpiSemana) kpiSemana.textContent = semana.length;
        if (kpiMes) kpiMes.textContent = mes.length;
        if (kpiPendentes) kpiPendentes.textContent = pendentes;
        if (kpiMedia) kpiMedia.textContent = media;

        // Próximas saídas de hoje
        const proximas = hoje.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')).slice(0, 5);
        const divProx = document.getElementById('proximas-saidas');
        if (divProx) {
            if (!proximas.length) {
                divProx.innerHTML = '<p>Nenhuma saída registrada para hoje.</p>';
            } else {
                divProx.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">${proximas.map(s =>
                    `<li style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                        <div><strong>${s.hora || '--:--'}</strong> — ${s.nome || '-'} <small style="color:var(--text-muted)">(${s.local || '-'})</small></div>
                        <span class="badge badge-${s.tipo === 'externa' ? 'tipo-externa' : 'tipo-interna'}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span>
                    </li>`
                ).join('')}</ul>`;
            }
        }

        // Locais mais frequentes
        const locais = {};
        visible.forEach(s => { locais[s.local] = (locais[s.local] || 0) + 1; });
        const topLocais = Object.entries(locais).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const divLocais = document.getElementById('locais-frequentes');
        if (divLocais) {
            if (!topLocais.length) {
                divLocais.innerHTML = '<p>Sem dados suficientes.</p>';
            } else {
                divLocais.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">${topLocais.map(([l, c]) =>
                    `<li style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
                        <span>${l || '-'}</span><span class="badge badge-blue">${c}</span>
                    </li>`
                ).join('')}</ul>`;
            }
        }

        // Últimas saídas (as 5 mais recentes)
        const ultimas = [...visible].sort((a, b) => {
            const d = (b.data || '').localeCompare(a.data || '');
            return d !== 0 ? d : (b.hora || '').localeCompare(a.hora || '');
        }).slice(0, 5);
        const divUltimas = document.getElementById('ultimas-saidas');
        if (divUltimas) {
            if (!ultimas.length) {
                divUltimas.innerHTML = '<p>Sem saídas registradas.</p>';
            } else {
                divUltimas.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">${ultimas.map(s =>
                    `<li style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                        <div><strong>${this.fmtDate(s.data)}</strong> ${s.hora || ''} — ${s.nome || '-'} <small style="color:var(--text-muted)">(${s.local || '-'})</small></div>
                        <span class="badge badge-${s.tipo === 'externa' ? 'tipo-externa' : 'tipo-interna'}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span>
                    </li>`
                ).join('')}</ul>`;
            }
        }

        // Top regimes
        const regimes = {};
        visible.forEach(s => { regimes[s.regime || 'Não informado'] = (regimes[s.regime || 'Não informado'] || 0) + 1; });
        const topRegimes = Object.entries(regimes).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const divRegimes = document.getElementById('top-regimes');
        if (divRegimes) {
            if (!topRegimes.length) {
                divRegimes.innerHTML = '<p>Sem dados suficientes.</p>';
            } else {
                divRegimes.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">${topRegimes.map(([r, c]) =>
                    `<li style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
                        <span>${r}</span><span class="badge badge-${r}">${c}</span>
                    </li>`
                ).join('')}</ul>`;
            }
        }

        // Gráficos do dashboard
        this.drawPieChart('dash-chart-tipo', visible, 'tipo', { externa: 'Externa', interna: 'Interna' });
        // Últimos 7 dias
        const dias7 = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().split('T')[0];
            dias7[ds] = 0;
        }
        visible.forEach(s => { if (dias7[s.data] !== undefined) dias7[s.data]++; });
        const dashDiasCanvas = document.getElementById('dash-chart-dias');
        if (dashDiasCanvas) {
            const ctx = dashDiasCanvas.getContext('2d');
            ctx.clearRect(0, 0, dashDiasCanvas.width, dashDiasCanvas.height);
            const entries = Object.entries(dias7);
            if (!entries.length || entries.every(([,c]) => c === 0)) {
                ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.fillText('Sem dados', dashDiasCanvas.width / 2, dashDiasCanvas.height / 2);
            } else {
                const max = Math.max(...entries.map(([,c]) => c), 1);
                const pad = 30, barW = (dashDiasCanvas.width - pad * 2) / entries.length * 0.6;
                const spacing = (dashDiasCanvas.width - pad * 2) / entries.length;
                entries.forEach(([label, count], i) => {
                    const h = (count / max) * (dashDiasCanvas.height - 40);
                    const x = pad + i * spacing + (spacing - barW) / 2;
                    const y = dashDiasCanvas.height - 20 - h;
                    ctx.fillStyle = '#3b82f6'; ctx.fillRect(x, y, barW, h);
                    ctx.fillStyle = '#1e3a8a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(String(count), x + barW / 2, y - 4);
                    const diaLabel = label.split('-')[2] + '/' + label.split('-')[1];
                    ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(diaLabel, x + barW / 2, dashDiasCanvas.height - 6);
                });
            }
        }
    },

    /* ---------- RELATÓRIO ---------- */
    setupRelatorio() {
        const today = new Date().toISOString().split('T')[0];
        const relDataIni = document.getElementById('rel-data-inicio');
        const relDataFim = document.getElementById('rel-data-fim');
        if (relDataIni) relDataIni.value = today;
        if (relDataFim) relDataFim.value = today;
        const btnGerar = document.getElementById('btn-gerar-relatorio');
        const btnExportPDF = document.getElementById('btn-exportar-pdf');
        const btnExportCSV = document.getElementById('btn-exportar-csv');
        const btnLimpar = document.getElementById('btn-limpar-relatorio');
        if (btnGerar) btnGerar.addEventListener('click', () => this.gerarRelatorio());
        if (btnExportPDF) btnExportPDF.addEventListener('click', () => this.exportarRelatorioPDF());
        if (btnExportCSV) btnExportCSV.addEventListener('click', () => this.exportarRelatorioCSV());
        if (btnLimpar) btnLimpar.addEventListener('click', () => this.limparRelatorio());

        // Preencher select de operadores se admin
        const selOperador = document.getElementById('rel-operador');
        const wrapOperador = document.getElementById('rel-filtro-operador-wrap');
        if (selOperador && wrapOperador) {
            if (this.isAdmin()) {
                wrapOperador.style.display = '';
                selOperador.innerHTML = '<option value="">Todos</option>';
                const ops = [...new Set(this.saidas.map(s => s.operador?.name).filter(Boolean))];
                ops.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; selOperador.appendChild(opt); });
            } else {
                wrapOperador.style.display = 'none';
            }
        }
    },

    limparRelatorio() {
        const today = new Date().toISOString().split('T')[0];
        const relDataIni = document.getElementById('rel-data-inicio');
        const relDataFim = document.getElementById('rel-data-fim');
        const relTipo = document.getElementById('rel-tipo');
        const relRegime = document.getElementById('rel-regime');
        const relLocal = document.getElementById('rel-local');
        const relOperador = document.getElementById('rel-operador');
        if (relDataIni) relDataIni.value = today;
        if (relDataFim) relDataFim.value = today;
        if (relTipo) relTipo.value = '';
        if (relRegime) relRegime.value = '';
        if (relLocal) relLocal.value = '';
        if (relOperador) relOperador.value = '';
        this._lastRelatorioFiltered = [];
        this._lastRelatorioParams = null;
        const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; };
        show('relatorio-kpis', false);
        show('relatorio-charts', false);
        show('relatorio-resumos', false);
        show('relatorio-tabela-card', false);
        const tbody = document.getElementById('tbody-relatorio');
        if (tbody) tbody.innerHTML = `<tr class="empty-row"><td colspan="10" class="empty-cell">Selecione os filtros e clique em Gerar Relatório.</td></tr>`;
    },

    gerarRelatorio() {
        const ini = document.getElementById('rel-data-inicio')?.value;
        const fim = document.getElementById('rel-data-fim')?.value;
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';
        const local = document.getElementById('rel-local')?.value || '';
        const operador = document.getElementById('rel-operador')?.value || '';

        if (!ini || !fim) { this.toast('Selecione data inicial e final.', 'error'); return; }
        if (ini > fim) { this.toast('Data inicial não pode ser maior que a final.', 'error'); return; }

        let filtered = this.getVisibleSaidas().filter(s => s.data >= ini && s.data <= fim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (local) filtered = filtered.filter(s => s.local === local);
        if (operador) filtered = filtered.filter(s => (s.operador?.name || '') === operador || (s.operador?.mat || '') === operador);
        filtered.sort((a, b) => {
            const d = a.data.localeCompare(b.data);
            return d !== 0 ? d : (a.hora || '').localeCompare(b.hora || '');
        });

        this._lastRelatorioFiltered = filtered;
        this._lastRelatorioParams = { ini, fim, tipo, regime, local, operador };

        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;
        const diffDays = Math.max(1, Math.round((new Date(fim) - new Date(ini)) / (1000 * 60 * 60 * 24)) + 1);

        const relDataDisplay = document.getElementById('relatorio-data-display');
        const relTotal = document.getElementById('rel-total');
        const relExt = document.getElementById('rel-ext');
        const relInt = document.getElementById('rel-int');
        const kpiTotal = document.getElementById('rel-kpi-total');
        const kpiExt = document.getElementById('rel-kpi-externas');
        const kpiInt = document.getElementById('rel-kpi-internas');
        const kpiDias = document.getElementById('rel-kpi-dias');

        if (relDataDisplay) relDataDisplay.textContent = `${this.fmtDate(ini)} a ${this.fmtDate(fim)}`;
        if (relTotal) relTotal.textContent = total;
        if (relExt) relExt.textContent = ext;
        if (relInt) relInt.textContent = int;
        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiExt) kpiExt.textContent = ext;
        if (kpiInt) kpiInt.textContent = int;
        if (kpiDias) kpiDias.textContent = diffDays;

        // Mostrar containers
        const show = (id, on) => { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; };
        show('relatorio-kpis', true);
        show('relatorio-charts', true);
        show('relatorio-resumos', true);
        show('relatorio-tabela-card', true);

        // Resumo por Local
        const resumoLocal = document.getElementById('resumo-local');
        if (resumoLocal) {
            const locais = {};
            filtered.forEach(s => { locais[s.local || 'Não informado'] = (locais[s.local || 'Não informado'] || 0) + 1; });
            resumoLocal.innerHTML = Object.entries(locais).sort((a, b) => b[1] - a[1]).map(([l, c]) => `<li><span class="resumo-label">${l}</span><span class="resumo-value">${c}</span></li>`).join('');
        }

        // Resumo por Regime
        const resumoRegime = document.getElementById('resumo-regime');
        if (resumoRegime) {
            const regimes = {};
            filtered.forEach(s => { regimes[s.regime || 'Não informado'] = (regimes[s.regime || 'Não informado'] || 0) + 1; });
            resumoRegime.innerHTML = Object.entries(regimes).sort((a, b) => b[1] - a[1]).map(([r, c]) => `<li><span class="resumo-label">${r}</span><span class="resumo-value">${c}</span></li>`).join('');
        }

        // Resumo por Operador
        const resumoOperador = document.getElementById('resumo-operador');
        if (resumoOperador) {
            const ops = {};
            filtered.forEach(s => { const k = s.operador?.name || 'Desconhecido'; ops[k] = (ops[k] || 0) + 1; });
            resumoOperador.innerHTML = Object.entries(ops).sort((a, b) => b[1] - a[1]).map(([o, c]) => `<li><span class="resumo-label">${o}</span><span class="resumo-value">${c}</span></li>`).join('');
        }

        // Resumo por Tipo Apresentação
        const resumoApres = document.getElementById('resumo-apresentacao');
        if (resumoApres) {
            const apres = {};
            filtered.forEach(s => { apres[s.tipoApresentacao || 'Não informado'] = (apres[s.tipoApresentacao || 'Não informado'] || 0) + 1; });
            resumoApres.innerHTML = Object.entries(apres).sort((a, b) => b[1] - a[1]).map(([a, c]) => `<li><span class="resumo-label">${a}</span><span class="resumo-value">${c}</span></li>`).join('');
        }

        // Tabela
        const tbody = document.getElementById('tbody-relatorio');
        if (!tbody) return;
        if (!filtered.length) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="10" class="empty-cell">Nenhuma saída encontrada no período selecionado.</td></tr>`;
            return;
        }
        tbody.innerHTML = filtered.map((s, idx) => `
            <tr>
                <td data-label="#">${idx + 1}</td>
                <td data-label="Data">${this.fmtDate(s.data)}</td>
                <td data-label="Hora">${s.hora || '-'}</td>
                <td data-label="Local">${s.local || '-'}</td>
                <td data-label="Quantidade">1</td>
                <td data-label="Apresentação">${s.tipoApresentacao || '-'}</td>
                <td data-label="Regime"><span class="badge badge-${s.regime}">${s.regime || '-'}</span></td>
                <td data-label="Tipo"><span class="badge badge-tipo-${s.tipo}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span></td>
                <td data-label="Viatura">${s.viatura || '-'}</td>
                <td data-label="Motorista">${s.motorista || '-'}</td>
            </tr>
        `).join('');

        // Gráficos
        this.drawPieChart('chart-tipo', filtered, 'tipo', { externa: 'Externa', interna: 'Interna' });
        this.drawBarChart('chart-regime', filtered, 'regime');
        this.drawBarChart('chart-local', filtered, 'local');
        this.drawLineChart('chart-dia', filtered, 'data');
    },

    async getBase64Image(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async exportarRelatorioPDF() {
        const params = this._lastRelatorioParams;
        let filtered = this._lastRelatorioFiltered;
        if (!params) { this.toast('Gere o relatório primeiro.', 'error'); return; }
        if (!filtered || !filtered.length) { this.toast('Nenhum dado para exportar.', 'error'); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const periodoLabel = `${this.fmtDateLong(params.ini)} a ${this.fmtDateLong(params.fim)}`;
        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;
        const now = new Date();
        const nowStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        try {
            const imgData = await this.getBase64Image('logo.jpg');
            doc.addImage(imgData, 'JPEG', 14, 6, 22, 22);
        } catch (e) { /* sem logo */ }

        doc.setFontSize(14);
        doc.text('COMPLEXO PENAL DE MARÍLIA', 40, 13);
        doc.setFontSize(16);
        doc.text('RELATÓRIO DE SAÍDAS', 40, 19);
        doc.setFontSize(11);
        doc.text(periodoLabel, 40, 25);
        doc.setFontSize(9);
        doc.text(`Total: ${total} | Externas: ${ext} | Internas: ${int} | Impresso em: ${nowStr}`, 40, 30);

        const bodyRows = filtered.map((s, idx) => [
            idx + 1, this.fmtDate(s.data), s.hora || '-', s.local || '-', 1,
            s.tipoApresentacao || '-', s.regime || '-',
            s.tipo === 'externa' ? 'Externa' : 'Interna',
            s.viatura || '-', s.motorista || '-'
        ]);

        doc.autoTable({
            startY: 36,
            head: [['#', 'Data', 'Horário', 'Local', 'Qtd', 'Apresentação', 'Regime', 'Tipo', 'Viatura', 'Motorista']],
            body: bodyRows,
            theme: 'grid',
            headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 8 }, 1: { cellWidth: 18 }, 2: { cellWidth: 14 }, 3: { cellWidth: 'auto' },
                4: { cellWidth: 10 }, 5: { cellWidth: 'auto' }, 6: { cellWidth: 14 },
                7: { cellWidth: 16 }, 8: { cellWidth: 18 }, 9: { cellWidth: 'auto' }
            }
        });
        const safeFile = `Relatorio_${params.ini.replace(/-/g,'')}_${params.fim.replace(/-/g,'')}.pdf`;
        doc.save(safeFile);
        this.toast('PDF exportado com sucesso!', 'success');
    },

    exportarRelatorioCSV() {
        const params = this._lastRelatorioParams;
        let filtered = this._lastRelatorioFiltered;
        if (!params) { this.toast('Gere o relatório primeiro.', 'error'); return; }
        if (!filtered || !filtered.length) { this.toast('Nenhum dado para exportar.', 'error'); return; }

        const header = ['#', 'Data', 'Hora', 'Local', 'Quantidade', 'Tipo Apresentacao', 'Regime', 'Tipo', 'Viatura', 'Motorista', 'Operador'];
        const rows = filtered.map((s, idx) => [
            idx + 1, s.data, s.hora || '', s.local || '', 1,
            s.tipoApresentacao || '', s.regime || '', s.tipo || '', s.viatura || '', s.motorista || '',
            s.operador?.name || ''
        ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Relatorio_${params.ini.replace(/-/g,'')}_${params.fim.replace(/-/g,'')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.toast('CSV exportado com sucesso!', 'success');
    },

    drawPieChart(canvasId, data, field, labelsMap) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const counts = {};
        data.forEach(s => { const v = s[field] || 'Não informado'; counts[v] = (counts[v] || 0) + 1; });
        const entries = Object.entries(counts);
        if (!entries.length) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.fillText('Sem dados', canvas.width / 2, canvas.height / 2); return; }
        const total = entries.reduce((a, [, c]) => a + c, 0);
        const colors = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1', '#64748b', '#f59e0b', '#ef4444'];
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) * 0.75;
        let start = -Math.PI / 2;
        entries.forEach(([label, count], i) => {
            const slice = (count / total) * 2 * Math.PI;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start + slice); ctx.closePath();
            ctx.fillStyle = colors[i % colors.length]; ctx.fill();
            const mid = start + slice / 2;
            const tx = cx + Math.cos(mid) * (r * 0.6);
            const ty = cy + Math.sin(mid) * (r * 0.6);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round((count / total) * 100)}%`, tx, ty);
            start += slice;
        });
        // Legend
        let ly = 12;
        entries.forEach(([label, count], i) => {
            ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(canvas.width - 100, ly - 8, 10, 10);
            ctx.fillStyle = '#334155'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(`${labelsMap?.[label] || label} (${count})`, canvas.width - 86, ly);
            ly += 16;
        });
    },

    drawBarChart(canvasId, data, field) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const counts = {};
        data.forEach(s => { const v = s[field] || 'Não informado'; counts[v] = (counts[v] || 0) + 1; });
        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (!entries.length) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.fillText('Sem dados', canvas.width / 2, canvas.height / 2); return; }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pad = 30, bottom = 20, top = 10, right = 10;
        const chartW = canvas.width - pad - right;
        const chartH = canvas.height - bottom - top;
        const max = Math.max(...entries.map(([, c]) => c));
        const barW = chartW / entries.length * 0.6;
        const gap = chartW / entries.length * 0.4;
        const colors = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1', '#64748b', '#f59e0b', '#ef4444'];
        entries.forEach(([label, count], i) => {
            const h = (count / max) * chartH;
            const x = pad + i * (barW + gap) + gap / 2;
            const y = canvas.height - bottom - h;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, barW, h);
            ctx.fillStyle = '#334155'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(String(count), x + barW / 2, y - 12);
            ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(label.length > 10 ? label.slice(0, 10) + '…' : label, x + barW / 2, canvas.height - bottom + 4);
        });
        // Axis line
        ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(pad, canvas.height - bottom); ctx.lineTo(canvas.width - right, canvas.height - bottom); ctx.stroke();
    },

    drawLineChart(canvasId, data, field) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const counts = {};
        data.forEach(s => { const v = s[field] || 'Não informado'; counts[v] = (counts[v] || 0) + 1; });
        const entries = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
        if (!entries.length) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.fillText('Sem dados', canvas.width / 2, canvas.height / 2); return; }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pad = 30, bottom = 20, top = 10, right = 10;
        const chartW = canvas.width - pad - right;
        const chartH = canvas.height - bottom - top;
        const max = Math.max(...entries.map(([, c]) => c));
        const stepX = chartW / (entries.length - 1 || 1);
        const points = entries.map(([label, count], i) => ({
            x: pad + i * stepX,
            y: canvas.height - bottom - ((count / max) * chartH)
        }));
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.beginPath();
        points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
        points.forEach((p, i) => {
            ctx.fillStyle = '#1e3a8a'; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#64748b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            const label = entries[i][0];
            ctx.fillText(label.length > 8 ? label.slice(0, 8) + '…' : label, p.x, canvas.height - bottom + 4);
            ctx.fillStyle = '#334155'; ctx.font = '10px sans-serif'; ctx.textBaseline = 'bottom';
            ctx.fillText(String(entries[i][1]), p.x, p.y - 6);
        });
        ctx.strokeStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(pad, canvas.height - bottom); ctx.lineTo(canvas.width - right, canvas.height - bottom); ctx.stroke();
    },

    /* ---------- EDIÇÃO ---------- */
    editSaida(id) {
        const s = this.saidas.find(x => x.id === id);
        if (!s) return;
        if (!this.canManageSaida(s)) {
            this.toast('Você não tem permissão para editar esta saída.', 'error');
            return;
        }
        this.editTargetId = id;
        const editData = document.getElementById('edit-s-data');
        const editHora = document.getElementById('edit-s-hora');
        const editTipo = document.getElementById('edit-s-tipo');
        const editRegime = document.getElementById('edit-s-regime');
        const editLocal = document.getElementById('edit-s-local');
        const editMat = document.getElementById('edit-s-matricula');
        const editNome = document.getElementById('edit-s-nome');
        const editTipoApres = document.getElementById('edit-s-tipo-apresentacao');
        const editViatura = document.getElementById('edit-s-viatura');
        const editMotorista = document.getElementById('edit-s-motorista');
        const editObs = document.getElementById('edit-s-obs');
        const modal = document.getElementById('modal-edit');

        if (editData) editData.value = s.data;
        if (editHora) editHora.value = s.hora;
        if (editTipo) editTipo.value = s.tipo;
        if (editRegime) editRegime.value = s.regime;
        if (editLocal) editLocal.value = s.local;
        if (editMat) editMat.value = s.matricula;
        if (editNome) editNome.value = s.nome;
        if (editTipoApres) editTipoApres.value = s.tipoApresentacao;
        if (editViatura) editViatura.value = s.viatura || '';
        if (editMotorista) editMotorista.value = s.motorista || '';
        if (editObs) editObs.value = s.observacoes || '';
        if (modal) modal.classList.add('active');
    },

    async saveEditSaida() {
        if (!this.editTargetId) return;
        const idx = this.saidas.findIndex(s => s.id === this.editTargetId);
        if (idx === -1) return;
        const oldValues = { ...this.saidas[idx] };
        delete oldValues.editedAt;
        delete oldValues.editedBy;

        const updated = {
            ...this.saidas[idx],
            data: document.getElementById('edit-s-data')?.value,
            hora: document.getElementById('edit-s-hora')?.value,
            tipo: document.getElementById('edit-s-tipo')?.value,
            regime: document.getElementById('edit-s-regime')?.value,
            local: document.getElementById('edit-s-local')?.value?.trim(),
            matricula: document.getElementById('edit-s-matricula')?.value?.trim(),
            nome: document.getElementById('edit-s-nome')?.value?.trim(),
            tipoApresentacao: document.getElementById('edit-s-tipo-apresentacao')?.value?.trim(),
            viatura: document.getElementById('edit-s-viatura')?.value?.trim(),
            motorista: document.getElementById('edit-s-motorista')?.value?.trim(),
            observacoes: document.getElementById('edit-s-obs')?.value?.trim(),
            editedAt: new Date().toISOString(),
            editedBy: { name: this.currentOperator.name, mat: this.currentOperator.mat }
        };

        this.setLoading(true);
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('saidas').upsert(this.mapSaidaToDB(updated));
                if (error) throw error;
            } else {
                this.saidas[idx] = updated;
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
            }

            await this.logAudit('EDIT', this.editTargetId, {
                oldValues,
                newValues: {
                    data: updated.data, hora: updated.hora, tipo: updated.tipo, regime: updated.regime,
                    local: updated.local, matricula: updated.matricula, nome: updated.nome,
                    tipoApresentacao: updated.tipoApresentacao, viatura: updated.viatura,
                    motorista: updated.motorista, observacoes: updated.observacoes
                }
            });

            await this.loadData();
            this.closeEditModal();
            this.renderSaidas();
            this.renderDashboard();
            this.updateAuditNavBadge();
            this.toast('Saída atualizada com sucesso!', 'success');
        } catch (e) {
            console.error(e);
            this.toast('Erro ao atualizar saída.', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    closeEditModal() {
        const modal = document.getElementById('modal-edit');
        if (modal) modal.classList.remove('active');
        this.editTargetId = null;
    },

    /* ---------- EXCLUSÃO ---------- */
    setupModalEvents() {
        const btnCancelEdit = document.getElementById('btn-cancel-edit');
        const btnSaveEdit = document.getElementById('btn-save-edit');
        const btnCancelDel = document.getElementById('btn-cancel-delete');
        const btnConfirmDel = document.getElementById('btn-confirm-delete');

        if (btnCancelEdit) btnCancelEdit.addEventListener('click', () => this.closeEditModal());
        if (btnSaveEdit) btnSaveEdit.addEventListener('click', () => this.saveEditSaida());
        if (btnCancelDel) btnCancelDel.addEventListener('click', () => {
            const modal = document.getElementById('modal-confirm');
            if (modal) modal.classList.remove('active');
            this.deleteTargetId = null;
        });
        if (btnConfirmDel) btnConfirmDel.addEventListener('click', () => this.confirmDelete());
    },

    deleteSaida(id) {
        const s = this.saidas.find(x => x.id === id);
        if (!s) return;
        if (!this.canManageSaida(s)) {
            this.toast('Você não tem permissão para excluir esta saída.', 'error');
            return;
        }
        this.deleteTargetId = id;
        const modalText = document.getElementById('modal-detail-text');
        const modal = document.getElementById('modal-confirm');
        if (modalText) modalText.textContent = `${s.nome || '-'} | ${this.fmtDate(s.data)} ${s.hora || ''} | ${s.local || ''}`;
        if (modal) modal.classList.add('active');
    },

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        const s = this.saidas.find(x => x.id === this.deleteTargetId);
        if (!s) return;

        this.setLoading(true);
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('saidas').delete().eq('id', this.deleteTargetId);
                if (error) throw error;
            } else {
                this.saidas = this.saidas.filter(x => x.id !== this.deleteTargetId);
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
            }

            await this.logAudit('DELETE', this.deleteTargetId, { oldValues: { ...s } });
            await this.loadData();
            this.renderSaidas();
            this.renderDashboard();
            this.updateAuditNavBadge();
            this.toast('Saída excluída com sucesso!', 'success');
        } catch (e) {
            console.error(e);
            this.toast('Erro ao excluir saída.', 'error');
        } finally {
            this.setLoading(false);
            const modal = document.getElementById('modal-confirm');
            if (modal) modal.classList.remove('active');
            this.deleteTargetId = null;
        }
    },

    /* ---------- AUDITORIA ---------- */
    async logAudit(acao, targetId, values) {
        const entry = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            operador: `${this.currentOperator.name} (Mat: ${this.currentOperator.mat})`,
            acao,
            targetId,
            oldValues: values.oldValues || null,
            newValues: values.newValues || null
        };

        if (supabaseClient) {
            try {
                await supabaseClient.from('audit_logs').insert(this.mapAuditToDB(entry));
            } catch (e) {
                console.error('Erro ao gravar auditoria no Supabase:', e);
            }
        }
        this.auditLog.push(entry);
        localStorage.setItem('ct_audit', JSON.stringify(this.auditLog));
    },

    setupAuditoria() {
        const btnReset = document.getElementById('btn-audit-reset');
        if (btnReset) btnReset.addEventListener('click', () => this.resetAuditFilters());
        ['audit-filter-data-inicio', 'audit-filter-data-fim', 'audit-filter-operador', 'audit-filter-acao'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.renderAuditLog());
        });
    },

    renderAuditLog() {
        const tbody = document.getElementById('audit-table-body');
        const emptyState = document.getElementById('audit-empty');
        if (!tbody) return;
        const filtros = {
            dataInicio: document.getElementById('audit-filter-data-inicio')?.value || '',
            dataFim: document.getElementById('audit-filter-data-fim')?.value || '',
            operador: (document.getElementById('audit-filter-operador')?.value || '').trim().toLowerCase(),
            acao: document.getElementById('audit-filter-acao')?.value || ''
        };

        let logs = [...this.auditLog].reverse();
        if (filtros.dataInicio) {
            const di = new Date(filtros.dataInicio + 'T00:00:00');
            logs = logs.filter(l => new Date(l.timestamp) >= di);
        }
        if (filtros.dataFim) {
            const df = new Date(filtros.dataFim + 'T23:59:59');
            logs = logs.filter(l => new Date(l.timestamp) <= df);
        }
        if (filtros.operador) logs = logs.filter(l => (l.operador || '').toLowerCase().includes(filtros.operador));
        if (filtros.acao) logs = logs.filter(l => l.acao === filtros.acao);

        tbody.innerHTML = '';
        if (!logs.length) { if (emptyState) emptyState.style.display = 'block'; return; }
        if (emptyState) emptyState.style.display = 'none';

        const acaoBadge = (acao) => {
            const cls = acao === 'DELETE' ? 'badge-red' : (acao === 'EDIT' ? 'badge-yellow' : 'badge-blue');
            const lbl = acao === 'DELETE' ? 'Exclusão' : (acao === 'EDIT' ? 'Edição' : acao);
            return `<span class="badge ${cls}">${lbl}</span>`;
        };

        logs.forEach(l => {
            let detalhes = '';
            if (l.acao === 'DELETE' && l.oldValues) {
                const s = l.oldValues;
                detalhes = `Excluída saída: ${s.nome || '-'} | ${this.fmtDate(s.data)} ${s.hora || ''} | ${s.local || ''}`;
            } else if (l.acao === 'EDIT' && l.oldValues && l.newValues) {
                const o = l.oldValues, n = l.newValues;
                const changes = [];
                if (o.nome !== n.nome) changes.push(`Nome: "${o.nome || '-'}" → "${n.nome || '-'}"`);
                if (o.data !== n.data) changes.push(`Data: ${this.fmtDate(o.data)} → ${this.fmtDate(n.data)}`);
                if (o.hora !== n.hora) changes.push(`Hora: ${o.hora || '-'} → ${n.hora || '-'}`);
                if (o.local !== n.local) changes.push(`Local: "${o.local || '-'}" → "${n.local || '-'}"`);
                if (o.tipo !== n.tipo) changes.push(`Tipo: ${o.tipo || '-'} → ${n.tipo || '-'}`);
                if (o.regime !== n.regime) changes.push(`Regime: ${o.regime || '-'} → ${n.regime || '-'}`);
                if (o.tipoApresentacao !== n.tipoApresentacao) changes.push(`Apresentação alterada`);
                if (o.viatura !== n.viatura) changes.push(`Viatura alterada`);
                if (o.motorista !== n.motorista) changes.push(`Motorista alterado`);
                detalhes = changes.length ? changes.join(' | ') : 'Nenhuma alteração detectada';
            } else {
                detalhes = JSON.stringify(l.oldValues || l.newValues || {});
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Data/Hora">${this.fmtDateTime(l.timestamp)}</td>
                <td data-label="Operador">${l.operador || '-'}</td>
                <td data-label="Ação">${acaoBadge(l.acao)}</td>
                <td data-label="Detalhes" title="${detalhes.replace(/"/g, '&quot;')}">${detalhes}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    resetAuditFilters() {
        const ids = ['audit-filter-data-inicio', 'audit-filter-data-fim', 'audit-filter-operador', 'audit-filter-acao'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        this.renderAuditLog();
    },

    isEditedRecently(s) {
        if (!s || !s.editedAt) return false;
        const edited = new Date(s.editedAt);
        const now = new Date();
        return ((now - edited) / (1000 * 60 * 60)) <= 24;
    },

    updateAuditNavBadge() {
        const navAud = document.getElementById('nav-auditoria');
        if (!navAud) return;
        const count = this.saidas.filter(s => this.isEditedRecently(s)).length;
        const existing = navAud.querySelector('.nav-badge');
        if (existing) existing.remove();
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'nav-badge';
            badge.textContent = count;
            navAud.appendChild(badge);
        }
    },

    /* ---------- CONFIGURAÇÕES ---------- */
    setupConfiguracoes() {
        const btnSalvar = document.getElementById('btn-salvar-configs');
        if (btnSalvar) btnSalvar.addEventListener('click', () => this.salvarConfiguracoes());
    },

    loadConfigValues() {
        const admins = this.adminList;
        const a1name = document.getElementById('cfg-admin1-name');
        const a1mat = document.getElementById('cfg-admin1-mat');
        const a2name = document.getElementById('cfg-admin2-name');
        const a2mat = document.getElementById('cfg-admin2-mat');

        if (admins[0]) {
            if (a1name) a1name.value = admins[0].nome || '';
            if (a1mat) a1mat.value = admins[0].matricula || '';
        }
        if (admins[1]) {
            if (a2name) a2name.value = admins[1].nome || '';
            if (a2mat) a2mat.value = admins[1].matricula || '';
        }
    },

    async salvarConfiguracoes() {
        if (!this.isAdmin()) {
            this.toast('Apenas administradores podem alterar configurações.', 'error');
            return;
        }
        const a1 = {
            nome: document.getElementById('cfg-admin1-name')?.value?.trim(),
            matricula: document.getElementById('cfg-admin1-mat')?.value?.trim()
        };
        const a2 = {
            nome: document.getElementById('cfg-admin2-name')?.value?.trim(),
            matricula: document.getElementById('cfg-admin2-mat')?.value?.trim()
        };
        const novos = [a1, a2].filter(a => a.nome && a.matricula);

        this.setLoading(true);
        try {
            if (supabaseClient) {
                await supabaseClient.from('admins').delete().neq('id', 0);
                if (novos.length) {
                    const { error } = await supabaseClient.from('admins').insert(novos);
                    if (error) throw error;
                }
            }
            this.adminList = novos;
            localStorage.setItem('ct_admins', JSON.stringify(novos));
            this.toast('Configurações salvas com sucesso!', 'success');
        } catch (e) {
            console.error(e);
            this.toast('Erro ao salvar configurações.', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    /* ---------- UTILS ---------- */
    fmtDate(iso) {
        if (!iso) return '-';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    },

    fmtDateLong(iso) {
        if (!iso) return '-';
        const [y, m, d] = iso.split('-');
        const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        return `${d} de ${meses[parseInt(m)-1]} de ${y}`;
    },

    fmtDateTime(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    },

    toast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-message');
        if (!toast || !icon || !msg) return;
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        icon.textContent = icons[type] || icons.info;
        msg.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    setLoading(on) {
        this.isLoading = on;
        let el = document.getElementById('app-loading-overlay');
        if (on) {
            if (!el) {
                el = document.createElement('div');
                el.id = 'app-loading-overlay';
                el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.25);z-index:9999;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem;font-weight:600;';
                el.innerHTML = '<span>⏳ Sincronizando…</span>';
                document.body.appendChild(el);
            } else {
                el.style.display = 'flex';
            }
        } else if (el) {
            el.style.display = 'none';
        }
    }
};

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando App...');
    App.init().catch(e => console.error('Erro ao iniciar App:', e));
});
