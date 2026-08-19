/* ============================================================
   CONTROLE DE TRÂNSITO — VERSÃO SUPABASE (MULTI-SETOR)
   ============================================================
   Antes de usar, substitua SUPABASE_URL e SUPABASE_ANON_KEY
   pelos valores do seu projeto no dashboard do Supabase.
   ============================================================ */

const SUPABASE_URL     = 'https://ddaforxeehdsjxabwder.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LIPVOqAe63rLUQYbVEEvKQ_NTxyE40o';

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
                <td>${this.fmtDate(s.data)} ${recentEdit ? '<span class="badge badge-recent" title="Editado nas últimas 24h">●</span>' : ''}</td>
                <td>${s.hora || '-'}</td>
                <td>${s.local || '-'}</td>
                <td>${s.matricula || '-'}</td>
                <td>${s.nome || '-'}</td>
                <td>${s.tipoApresentacao || '-'}</td>
                <td><span class="badge badge-${s.regime}">${s.regime || '-'}</span></td>
                <td><span class="badge badge-tipo-${s.tipo}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span></td>
                <td>${s.viatura || '-'}</td>
                <td>${s.motorista || '-'}</td>
                <td><small style="color:var(--text-secondary)">${s.operador?.name || '-'}<br><span style="color:var(--text-muted)">Mat: ${s.operador?.mat || '-'}</span></small></td>
                <td>${s.editedAt ? `<small style="color:var(--text-secondary)">${s.editedBy?.name || '-'}<br><span style="color:var(--text-muted)">${this.fmtDateTime(s.editedAt)}</span></small>` : '<small style="color:var(--text-muted)">—</small>'}</td>
                <td>
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
        const hoje = visible.filter(s => s.data === today);
        const ext = visible.filter(s => s.tipo === 'externa').length;
        const inte = visible.filter(s => s.tipo === 'interna').length;

        const kpiTotal = document.getElementById('kpi-total');
        const kpiHoje = document.getElementById('kpi-hoje');
        const kpiExt = document.getElementById('kpi-externas');
        const kpiInt = document.getElementById('kpi-internas');

        if (kpiTotal) kpiTotal.textContent = visible.length;
        if (kpiHoje) kpiHoje.textContent = hoje.length;
        if (kpiExt) kpiExt.textContent = ext;
        if (kpiInt) kpiInt.textContent = inte;

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
    },

    /* ---------- RELATÓRIO ---------- */
    setupRelatorio() {
        const today = new Date().toISOString().split('T')[0];
        const relData = document.getElementById('rel-data');
        if (relData) relData.value = today;
        const btnGerar = document.getElementById('btn-gerar-relatorio');
        const btnExport = document.getElementById('btn-exportar-pdf');
        if (btnGerar) btnGerar.addEventListener('click', () => this.gerarRelatorio());
        if (btnExport) btnExport.addEventListener('click', () => this.exportarRelatorioPDF());
    },

    gerarRelatorio() {
        const data = document.getElementById('rel-data')?.value;
        const tipo = document.getElementById('rel-tipo')?.value;
        if (!data) { this.toast('Selecione uma data.', 'error'); return; }

        let filtered = this.getVisibleSaidas().filter(s => s.data === data);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        filtered.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;

        const relDataDisplay = document.getElementById('relatorio-data-display');
        const relTotal = document.getElementById('rel-total');
        const relExt = document.getElementById('rel-ext');
        const relInt = document.getElementById('rel-int');

        if (relDataDisplay) relDataDisplay.textContent = this.fmtDateLong(data);
        if (relTotal) relTotal.textContent = total;
        if (relExt) relExt.textContent = ext;
        if (relInt) relInt.textContent = int;

        const tbody = document.getElementById('tbody-relatorio');
        if (!tbody) return;
        if (!filtered.length) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="9" class="empty-cell">Nenhuma saída registrada nesta data.</td></tr>`;
            this._lastRelatorioFiltered = [];
            return;
        }
        tbody.innerHTML = filtered.map((s, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${s.hora || '-'}</td>
                <td>${s.local || '-'}</td>
                <td>1</td>
                <td>${s.tipoApresentacao || '-'}</td>
                <td><span class="badge badge-${s.regime}">${s.regime || '-'}</span></td>
                <td><span class="badge badge-tipo-${s.tipo}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span></td>
                <td>${s.viatura || '-'}</td>
                <td>${s.motorista || '-'}</td>
            </tr>
        `).join('');
        this._lastRelatorioFiltered = filtered;
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
        const data = document.getElementById('rel-data')?.value;
        if (!data) { this.toast('Selecione uma data.', 'error'); return; }
        let filtered = this._lastRelatorioFiltered;
        if (!filtered || !filtered.length) {
            filtered = this.getVisibleSaidas().filter(s => s.data === data);
            const tipo = document.getElementById('rel-tipo')?.value;
            if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
            filtered.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
        }
        if (!filtered || !filtered.length) { this.toast('Nenhum dado para exportar.', 'error'); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const dataLabel = this.fmtDateLong(data);
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
        doc.text('RELATÓRIO DIÁRIO DE SAÍDAS', 40, 19);
        doc.setFontSize(11);
        doc.text(dataLabel, 40, 25);
        doc.setFontSize(9);
        doc.text(`Total: ${total} | Externas: ${ext} | Internas: ${int} | Impresso em: ${nowStr}`, 40, 30);

        const bodyRows = filtered.map((s, idx) => [
            idx + 1, s.hora || '-', s.local || '-', '1',
            s.tipoApresentacao || '-', s.regime || '-',
            s.tipo === 'externa' ? 'Externa' : 'Interna',
            s.viatura || '-', s.motorista || '-'
        ]);

        doc.autoTable({
            startY: 36,
            head: [['#', 'Horário', 'Local', 'Qtd', 'Tipo Apresentação', 'Regime', 'Tipo Saída', 'Viatura', 'Motorista']],
            body: bodyRows,
            theme: 'grid',
            headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 8 }, 1: { cellWidth: 15 }, 2: { cellWidth: 'auto' },
                3: { cellWidth: 10 }, 4: { cellWidth: 'auto' }, 5: { cellWidth: 12 },
                6: { cellWidth: 18 }, 7: { cellWidth: 20 }, 8: { cellWidth: 25 }
            }
        });
        doc.save(`Relatorio_Diario_${data.replace(/-/g,'')}.pdf`);
        this.toast('PDF exportado com sucesso!', 'success');
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
                <td>${this.fmtDateTime(l.timestamp)}</td>
                <td>${l.operador || '-'}</td>
                <td>${acaoBadge(l.acao)}</td>
                <td title="${detalhes.replace(/"/g, '&quot;')}">${detalhes}</td>
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
