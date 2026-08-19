/* ============================================================
   CONTROLE DE TRÂNSITO — VERSÃO 2.1 (OFFLINE-FIRST + SUPABASE)
   ============================================================
   Arquitetura: Salva SEMPRE no localStorage + tenta Supabase.
   Se Supabase falhar, opera normalmente offline.
   syncQueue armazena operações pendentes para sincronizar
   quando a conexão for restabelecida.
   
   CORREÇÕES v2:
   - BUG5:  renderDashboard usa IDs kpi-*, proximas-saidas, locais-frequentes, ultimas-saidas
   - BUG6:  renderSaidas 13 colunas (Data, Hora, Local, Matrícula, Nome, Tipo Apres., Regime, Tipo Saída, Viatura, Motorista, Cadastrado por, Última Edição, Ações)
   - BUG7:  gerarRelatorio popula relatorio-kpis, relatorio-resumos, relatorio-tabela-card com IDs corretos
   - BUG8:  exportarPDF 11 colunas + filtros rel-local/rel-operador
   - BUG9:  exportarCSV NOVO (Blob + download .csv)
   - BUG10: setupConfiguracoes btn-salvar-configs, inputs fixos cfg-admin1/2
   - BUG11: setupRelatorio handlers completos (limpar, imprimir, csv, pdf)
   - BUG12: seed IIFE removida; auto-import em enterApp se ct_seed_imported não existe
   - BUG13: meta viewport já removida no HTML
   - BUG14: setupFiltrosListagem SEM filter-local
   ============================================================ */

const SUPABASE_URL      = 'https://ddaforxeehdsjxabwder.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LIPVOqAe63rLUQYbBEEvKQ_NTxyE40o';

// Cliente Supabase global
let supabaseClient = null;
let isOnline = false;
let syncInProgress = false;

function initSupabase() {
    if (!window.supabase) {
        console.error('SDK do Supabase não carregado. Verifique o script no HTML.');
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

/* ---------- SYNC QUEUE ---------- */
const SyncQueue = {
    KEY: 'ct_sync_queue',

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch { return []; }
    },

    add(operation, table, data) {
        const queue = this.getAll();
        queue.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            operation,
            table,
            data,
            createdAt: new Date().toISOString(),
            retries: 0
        });
        localStorage.setItem(this.KEY, JSON.stringify(queue));
        this.updateBadge();
    },

    remove(id) {
        const queue = this.getAll().filter(q => q.id !== id);
        localStorage.setItem(this.KEY, JSON.stringify(queue));
        this.updateBadge();
    },

    clear() {
        localStorage.setItem(this.KEY, '[]');
        this.updateBadge();
    },

    count() {
        return this.getAll().length;
    },

    updateBadge() {
        const badge = document.getElementById('sync-queue-badge');
        if (badge) {
            const c = this.count();
            badge.textContent = c;
            badge.style.display = c > 0 ? 'inline-flex' : 'none';
        }
    },

    async processQueue() {
        if (syncInProgress || !supabaseClient || !isOnline) return;
        const queue = this.getAll();
        if (!queue.length) return;

        syncInProgress = true;
        console.log(`Processando fila de sincronização: ${queue.length} itens`);

        for (const item of [...queue]) {
            try {
                let result;
                if (item.operation === 'INSERT') {
                    result = await supabaseClient.from(item.table).insert(item.data);
                } else if (item.operation === 'UPDATE') {
                    result = await supabaseClient.from(item.table).upsert(item.data);
                } else if (item.operation === 'DELETE') {
                    if (item.data.id) {
                        result = await supabaseClient.from(item.table).delete().eq('id', item.data.id);
                    }
                }
                if (result && result.error) {
                    console.error(`Erro ao sincronizar ${item.operation} em ${item.table}:`, result.error);
                    if (result.error.code === '23505') {
                        this.remove(item.id);
                    } else {
                        const q = this.getAll();
                        const idx = q.findIndex(x => x.id === item.id);
                        if (idx !== -1) {
                            q[idx].retries = (q[idx].retries || 0) + 1;
                            if (q[idx].retries >= 5) {
                                console.error(`Item ${item.id} excedeu 5 tentativas, removendo.`);
                                this.remove(item.id);
                            } else {
                                localStorage.setItem(this.KEY, JSON.stringify(q));
                            }
                        }
                    }
                } else {
                    this.remove(item.id);
                    console.log(`Sincronizado: ${item.operation} em ${item.table}`);
                }
            } catch (e) {
                console.error('Exceção ao processar item da fila:', e);
            }
        }

        syncInProgress = false;
        this.updateBadge();
    }
};

/* ---------- STATUS INDICATOR ---------- */
function updateStatusIndicator(online) {
    isOnline = online;
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (dot) dot.className = online ? 'status-dot online' : 'status-dot offline';
    if (text) text.textContent = online ? 'Conectado' : 'Offline (local)';
    SyncQueue.updateBadge();
}

async function checkSupabaseConnection() {
    if (!supabaseClient) {
        updateStatusIndicator(false);
        return false;
    }
    try {
        const { error } = await supabaseClient.from('admins').select('id').limit(1);
        const online = !error;
        updateStatusIndicator(online);
        if (online) await SyncQueue.processQueue();
        return online;
    } catch {
        updateStatusIndicator(false);
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
            this.setupConnectionListeners();
            console.log('App.init() concluído');
        } catch (e) {
            console.error('Erro em App.init():', e);
        }
    },

    setupConnectionListeners() {
        window.addEventListener('online', async () => {
            console.log('Navegador voltou online, verificando Supabase...');
            await checkSupabaseConnection();
        });
        window.addEventListener('offline', () => {
            console.log('Navegador ficou offline');
            updateStatusIndicator(false);
        });
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden && isOnline) await SyncQueue.processQueue();
        });
        setInterval(async () => { await checkSupabaseConnection(); }, 60000);
    },

    checkSession() {
        const saved = sessionStorage.getItem('ct_operator');
        if (saved) {
            try {
                this.currentOperator = JSON.parse(saved);
                this.enterApp();
            } catch (e) {
                sessionStorage.removeItem('ct_operator');
            }
        }
    },

    bindLoginEvents() {
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
        const name = document.getElementById('operator-name').value.trim();
        const mat  = document.getElementById('operator-mat').value.trim();
        const err  = document.getElementById('login-error');

        if (!name || !mat) {
            if (err) err.textContent = 'Preencha nome e matrícula.';
            return;
        }

        let admins = [];
        let supabaseOk = false;

        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient.from('admins').select('*');
                if (!error && data && data.length > 0) {
                    admins = data;
                    supabaseOk = true;
                    localStorage.setItem('ct_admins', JSON.stringify(admins));
                }
            } catch (e) {
                console.error('Exceção ao buscar admins no Supabase:', e);
            }
        }

        if (!supabaseOk) {
            try {
                const localAdmins = JSON.parse(localStorage.getItem('ct_admins') || '[]');
                if (localAdmins.length > 0) admins = localAdmins;
            } catch (e) {
                console.error('Erro ao ler admins do localStorage:', e);
            }
        }

        const isAdmin = admins.some(a => {
            const adminMat = String(a.matricula || a.mat || '').trim();
            const adminNome = String(a.nome || a.name || '').trim().toLowerCase();
            return adminMat === mat && adminNome === name.toLowerCase();
        });

        this.currentOperator = { name, mat, isAdmin };
        sessionStorage.setItem('ct_operator', JSON.stringify(this.currentOperator));
        if (err) err.textContent = '';
        this.enterApp();
    },

    logout() {
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
                if (navConfig) navConfig.style.display = 'flex';
                if (navAudit) navAudit.style.display = 'flex';
            } else {
                if (navConfig) navConfig.style.display = 'none';
                if (navAudit) navAudit.style.display = 'none';
            }

            this.setupNavigation();
            this.setupFormCadastro();
            this.setupFiltrosListagem();
            this.setupRelatorio();
            this.setupConfiguracoes();
            this.setupAuditoria();
            this.setupModalEvents();
            this.setupSeedDataUI();

            await this.loadData();
            await checkSupabaseConnection();

            // BUG12: Auto-import seed se nunca importado e SEED_SAIDAS disponível
            if (!localStorage.getItem('ct_seed_imported') && typeof SEED_SAIDAS !== 'undefined' && this.saidas.length === 0) {
                const existingIds = new Set(this.saidas.map(s => s.id));
                const newItems = SEED_SAIDAS.filter(s => !existingIds.has(s.id));
                this.saidas = [...this.saidas, ...newItems];
                this.saidas.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
                localStorage.setItem('ct_seed_imported', new Date().toISOString());
                console.log(`Auto-import: ${newItems.length} registros seed importados`);
            }

            this.renderDashboard();
            this.renderSaidas();
            this.updateAuditNavBadge();
        } catch (e) {
            console.error('ERRO CRÍTICO em enterApp():', e);
            alert('Erro ao iniciar o aplicativo: ' + e.message);
        }
    },

    /* ---------- CARREGAR DADOS (OFFLINE-FIRST) ---------- */
    async loadData() {
        // SEMPRE carrega do localStorage primeiro
        this.saidas = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
        this.auditLog = JSON.parse(localStorage.getItem('ct_audit') || '[]');
        this.adminList = JSON.parse(localStorage.getItem('ct_admins') || '[]');

        // Se Supabase disponível e online, sincroniza dados mais recentes
        if (supabaseClient && isOnline) {
            this.setLoading(true);
            try {
                const { data: saidasData, error: errSaidas } = await supabaseClient
                    .from('saidas').select('*')
                    .order('data', { ascending: false })
                    .order('hora', { ascending: true });
                if (errSaidas) throw errSaidas;
                this.saidas = (saidasData || []).map(s => this.mapSaidaFromDB(s));
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));

                const { data: auditData, error: errAudit } = await supabaseClient
                    .from('audit_logs').select('*')
                    .order('timestamp', { ascending: false }).limit(1000);
                if (errAudit) throw errAudit;
                this.auditLog = (auditData || []).map(a => this.mapAuditFromDB(a));
                localStorage.setItem('ct_audit', JSON.stringify(this.auditLog));

                const { data: adminData, error: errAdmin } = await supabaseClient
                    .from('admins').select('*');
                if (errAdmin) throw errAdmin;
                this.adminList = adminData || [];
                localStorage.setItem('ct_admins', JSON.stringify(this.adminList));

            } catch (e) {
                console.error('Erro ao sincronizar com Supabase:', e.message || e);
                this.toast('Usando dados locais (sem conexão com servidor).', 'warning');
            } finally {
                this.setLoading(false);
            }
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
        return this.currentOperator?.isAdmin === true;
    },

    getVisibleSaidas() {
        if (this.isAdmin()) return this.saidas;
        return this.saidas.filter(s =>
            s.operador && String(s.operador.mat).trim() === String(this.currentOperator.mat).trim()
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

    /* ---------- CADASTRO (OFFLINE-FIRST) ---------- */
    setupFormCadastro() {
        const form = document.getElementById('form-saida');
        const btnLimpar = document.getElementById('btn-limpar');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.saveSaida(); });
        if (btnLimpar) btnLimpar.addEventListener('click', () => form.reset());
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
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            data, hora, tipo, regime, local, matricula, nome,
            tipoApresentacao: tipoApres,
            viatura, motorista, observacoes: obs,
            operador: { name: this.currentOperator.name, mat: this.currentOperator.mat },
            createdAt: new Date().toISOString()
        };

        // 1) SALVA SEMPRE no localStorage
        this.saidas.push(novaSaida);
        localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));

        // 2) Tenta salvar no Supabase
        if (supabaseClient && isOnline) {
            this.setLoading(true);
            try {
                const { error } = await supabaseClient.from('saidas').insert(this.mapSaidaToDB(novaSaida));
                if (error) throw error;
                console.log('Saída salva no Supabase');
            } catch (e) {
                console.error('Erro ao salvar no Supabase, adicionando à fila:', e);
                SyncQueue.add('INSERT', 'saidas', this.mapSaidaToDB(novaSaida));
                this.toast('Salvo localmente. Será sincronizado quando a conexão retornar.', 'warning');
            } finally {
                this.setLoading(false);
            }
        } else if (supabaseClient) {
            SyncQueue.add('INSERT', 'saidas', this.mapSaidaToDB(novaSaida));
            this.toast('Salvo localmente (offline). Será sincronizado depois.', 'warning');
        }

        await this.loadData();
        this.renderDashboard();
        this.renderSaidas();
        if (!SyncQueue.count()) this.toast('Saída cadastrada com sucesso!', 'success');
        const form = document.getElementById('form-saida');
        if (form) form.reset();
        document.getElementById('s-data').value = new Date().toISOString().split('T')[0];
    },

    /* ---------- LISTAGEM ---------- */
    // BUG14: REMOVIDO filter-local do array (ID não existe no HTML)
    setupFiltrosListagem() {
        ['filter-data-ini', 'filter-data-fim', 'filter-tipo', 'filter-regime', 'filter-busca'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.renderSaidas());
        });
        const btnLimpar = document.getElementById('btn-limpar-filtros');
        if (btnLimpar) btnLimpar.addEventListener('click', () => {
            ['filter-data-ini', 'filter-data-fim', 'filter-tipo', 'filter-regime', 'filter-busca'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.renderSaidas();
        });
    },

    // BUG6: 13 colunas na ordem do HTML: Data, Hora, Local, Matrícula, Nome, Tipo Apresentação,
    //        Regime, Tipo Saída, Viatura, Motorista, Cadastrado por, Última Edição, Ações
    renderSaidas() {
        const tbody = document.getElementById('tbody-saidas');
        if (!tbody) return;
        const ini = document.getElementById('filter-data-ini')?.value || '';
        const fim = document.getElementById('filter-data-fim')?.value || '';
        const tipo = document.getElementById('filter-tipo')?.value || '';
        const regime = document.getElementById('filter-regime')?.value || '';
        const busca = (document.getElementById('filter-busca')?.value || '').trim().toLowerCase();

        let filtered = this.getVisibleSaidas();
        if (ini) filtered = filtered.filter(s => s.data >= ini);
        if (fim) filtered = filtered.filter(s => s.data <= fim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (busca) {
            filtered = filtered.filter(s =>
                (s.nome || '').toLowerCase().includes(busca) ||
                (s.matricula || '').toLowerCase().includes(busca) ||
                (s.local || '').toLowerCase().includes(busca) ||
                (s.observacoes || '').toLowerCase().includes(busca)
            );
        }

        filtered.sort((a, b) => {
            if (a.data !== b.data) return b.data.localeCompare(a.data);
            return (a.hora || '').localeCompare(b.hora || '');
        });

        const emptyEl = document.getElementById('saidas-empty');
        if (!filtered.length) {
            tbody.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        tbody.innerHTML = filtered.map(s => {
            const canEdit = this.canManageSaida(s);
            const tipoLabel = s.tipo === 'externa' ? '🔴 Externa' : '🟢 Interna';
            const regimeLabel = { SA: 'Semiaberto', FE: 'Fechado', CR: 'Cela Regime' }[s.regime] || s.regime;
            const dataFormatada = this.formatDate(s.data);
            const nomeDisplay = s.nome ? this.esc(s.nome) : (s.observacoes || '-');
            const matriculaDisplay = s.matricula || '-';
            // Cadastrado por = operador.name (mat)
            const cadastradoPor = s.operador ? `${this.esc(s.operador.name)} (${this.esc(s.operador.mat)})` : '-';
            // Última Edição = editedBy + formatDate(editedAt) se existir, senão '-'
            const ultimaEdicao = s.editedBy && s.editedAt
                ? `${this.esc(s.editedBy)} ${this.formatDate(s.editedAt.split('T')[0])}`
                : '-';
            return `<tr>
                <td>${dataFormatada}</td>
                <td>${s.hora || '-'}</td>
                <td>${this.esc(s.local)}</td>
                <td>${this.esc(matriculaDisplay)}</td>
                <td>${nomeDisplay}</td>
                <td>${this.esc(s.tipoApresentacao) || '-'}</td>
                <td><span class="badge badge-regime">${regimeLabel}</span></td>
                <td><span class="badge badge-${s.tipo}">${tipoLabel}</span></td>
                <td>${this.esc(s.viatura) || '-'}</td>
                <td>${this.esc(s.motorista) || '-'}</td>
                <td>${cadastradoPor}</td>
                <td>${ultimaEdicao}</td>
                <td class="actions-cell">
                    ${canEdit ? `<button class="btn-icon" onclick="App.openEdit('${s.id}')" title="Editar">✏️</button>` : ''}
                    ${canEdit ? `<button class="btn-icon" onclick="App.confirmDelete('${s.id}')" title="Excluir">🗑️</button>` : ''}
                </td>
            </tr>`;
        }).join('');
    },

    /* ---------- DASHBOARD ---------- */
    // BUG5: Usa IDs corretos do HTML: kpi-total, kpi-hoje, kpi-externas, kpi-internas,
    //        kpi-semana, kpi-mes, kpi-pendentes, kpi-media,
    //        proximas-saidas (ul), locais-frequentes (div), ultimas-saidas (div)
    renderDashboard() {
        const all = this.saidas;
        const today = new Date().toISOString().split('T')[0];
        const todayStr = today;
        const todaySaidas = all.filter(s => s.data === today);
        const externasHoje = todaySaidas.filter(s => s.tipo === 'externa').length;
        const internasHoje = todaySaidas.filter(s => s.tipo === 'interna').length;

        // Semana: últimos 7 dias
        const semanaAtras = new Date();
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        const semanaStr = semanaAtras.toISOString().split('T')[0];
        const semanaSaidas = all.filter(s => s.data >= semanaStr && s.data <= todayStr);

        // Mês: mês atual
        const mesAtual = todayStr.substring(0, 7); // YYYY-MM
        const mesSaidas = all.filter(s => s.data && s.data.startsWith(mesAtual));

        // Pendentes: saídas futuras ou hoje com horário ainda não passado
        const nowTime = new Date().toTimeString().slice(0, 5);
        const pendentes = all.filter(s => {
            if (s.data > todayStr) return true;
            if (s.data === todayStr && s.hora && s.hora > nowTime) return true;
            return false;
        });

        // Média/dia (últimos 30 dias)
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        const trintaStr = trintaDiasAtras.toISOString().split('T')[0];
        const ultimos30 = all.filter(s => s.data >= trintaStr && s.data <= todayStr);
        const diasComSaida = new Set(ultimos30.map(s => s.data)).size;
        const mediaDia = diasComSaida > 0 ? (ultimos30.length / diasComSaida).toFixed(1) : '0';

        // Popular KPIs
        const elTotal = document.getElementById('kpi-total');
        const elHoje = document.getElementById('kpi-hoje');
        const elExternas = document.getElementById('kpi-externas');
        const elInternas = document.getElementById('kpi-internas');
        const elSemana = document.getElementById('kpi-semana');
        const elMes = document.getElementById('kpi-mes');
        const elPendentes = document.getElementById('kpi-pendentes');
        const elMedia = document.getElementById('kpi-media');

        if (elTotal) elTotal.textContent = all.length;
        if (elHoje) elHoje.textContent = todaySaidas.length;
        if (elExternas) elExternas.textContent = externasHoje;
        if (elInternas) elInternas.textContent = internasHoje;
        if (elSemana) elSemana.textContent = semanaSaidas.length;
        if (elMes) elMes.textContent = mesSaidas.length;
        if (elPendentes) elPendentes.textContent = pendentes.length;
        if (elMedia) elMedia.textContent = mediaDia;

        // Próximas saídas (hoje e futuras) → proximas-saidas (ul)
        const upcoming = all.filter(s => s.data >= todayStr)
            .sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''))
            .slice(0, 10);

        const upList = document.getElementById('proximas-saidas');
        if (upList) {
            if (!upcoming.length) {
                upList.innerHTML = '<li class="upcoming-empty">Nenhuma saída programada</li>';
            } else {
                upList.innerHTML = upcoming.map(s => {
                    const isPast = s.data === todayStr && s.hora < nowTime;
                    const tipoIcon = s.tipo === 'externa' ? '🔴' : '🟢';
                    return `<li class="upcoming-item ${isPast ? 'past' : ''}">
                        <span class="upcoming-date">${this.formatDate(s.data)} ${s.hora}</span>
                        <span class="upcoming-info">${tipoIcon} ${this.esc(s.nome)} — ${this.esc(s.local)}</span>
                    </li>`;
                }).join('');
            }
        }

        // Locais frequentes (top 5) → locais-frequentes (div)
        const porLocal = {};
        all.forEach(s => { porLocal[s.local] = (porLocal[s.local] || 0) + 1; });
        const top5Locais = Object.entries(porLocal).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const locaisDiv = document.getElementById('locais-frequentes');
        if (locaisDiv) {
            if (!top5Locais.length) {
                locaisDiv.innerHTML = '<p style="color:var(--text-secondary);">Nenhum local registrado</p>';
            } else {
                const maxCount = top5Locais[0][1];
                locaisDiv.innerHTML = '<ul class="local-freq-list">' +
                    top5Locais.map(([local, count]) =>
                        `<li class="local-freq-item">
                            <span class="local-freq-name">${this.esc(local)}</span>
                            <span class="local-freq-count">${count}</span>
                            <div class="local-freq-bar" style="width:${Math.round(count/maxCount*100)}%"></div>
                        </li>`
                    ).join('') + '</ul>';
            }
        }

        // Últimas saídas (5 mais recentes) → ultimas-saidas (div)
        const recentes = [...all].sort((a, b) => {
            if (a.data !== b.data) return b.data.localeCompare(a.data);
            return (b.hora || '').localeCompare(a.hora || '');
        }).slice(0, 5);

        const ultimasDiv = document.getElementById('ultimas-saidas');
        if (ultimasDiv) {
            if (!recentes.length) {
                ultimasDiv.innerHTML = '<p style="color:var(--text-secondary);">Nenhuma saída registrada</p>';
            } else {
                ultimasDiv.innerHTML = '<ul class="ultimas-list">' +
                    recentes.map(s => {
                        const tipoIcon = s.tipo === 'externa' ? '🔴' : '🟢';
                        return `<li class="ultimas-item">
                            <div class="ultimas-date">${tipoIcon} ${this.formatDate(s.data)} ${s.hora || ''}</div>
                            <div class="ultimas-detail">${this.esc(s.nome)} → ${this.esc(s.local)}</div>
                            <div class="ultimas-type">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</div>
                        </li>`;
                    }).join('') + '</ul>';
            }
        }
    },

    /* ---------- EDIÇÃO (OFFLINE-FIRST) ---------- */
    setupModalEvents() {
        const btnCancelEdit = document.getElementById('btn-cancel-edit');
        const btnSaveEdit = document.getElementById('btn-save-edit');
        const btnCancelDelete = document.getElementById('btn-cancel-delete');
        const btnConfirmDelete = document.getElementById('btn-confirm-delete');

        if (btnCancelEdit) btnCancelEdit.addEventListener('click', () => this.closeModal('modal-edit'));
        if (btnSaveEdit) btnSaveEdit.addEventListener('click', () => this.saveEditSaida());
        if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => this.closeModal('modal-confirm'));
        if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', () => this.doDelete());

        // Fechar modais clicando fora
        document.querySelectorAll('.modal').forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) this.closeModal(m.id);
            });
        });
    },

    openEdit(id) {
        const s = this.saidas.find(x => x.id === id);
        if (!s) return;
        this.editTargetId = id;

        document.getElementById('edit-s-data').value = s.data || '';
        document.getElementById('edit-s-hora').value = s.hora || '';
        document.getElementById('edit-s-tipo').value = s.tipo || '';
        document.getElementById('edit-s-regime').value = s.regime || '';
        document.getElementById('edit-s-local').value = s.local || '';
        document.getElementById('edit-s-matricula').value = s.matricula || '';
        document.getElementById('edit-s-nome').value = s.nome || '';
        document.getElementById('edit-s-tipo-apresentacao').value = s.tipoApresentacao || '';
        document.getElementById('edit-s-viatura').value = s.viatura || '';
        document.getElementById('edit-s-motorista').value = s.motorista || '';
        document.getElementById('edit-s-obs').value = s.observacoes || '';

        this.openModal('modal-edit');
    },

    async saveEditSaida() {
        const id = this.editTargetId;
        if (!id) return;

        const oldSaida = this.saidas.find(s => s.id === id);
        if (!oldSaida) return;

        const updatedSaida = {
            ...oldSaida,
            data: document.getElementById('edit-s-data').value,
            hora: document.getElementById('edit-s-hora').value,
            tipo: document.getElementById('edit-s-tipo').value,
            regime: document.getElementById('edit-s-regime').value,
            local: document.getElementById('edit-s-local').value.trim(),
            matricula: document.getElementById('edit-s-matricula').value.trim(),
            nome: document.getElementById('edit-s-nome').value.trim(),
            tipoApresentacao: document.getElementById('edit-s-tipo-apresentacao').value.trim(),
            viatura: document.getElementById('edit-s-viatura').value.trim(),
            motorista: document.getElementById('edit-s-motorista').value.trim(),
            observacoes: document.getElementById('edit-s-obs').value.trim(),
            editedAt: new Date().toISOString(),
            editedBy: this.currentOperator.name
        };

        // 1) SALVA SEMPRE no localStorage
        const idx = this.saidas.findIndex(s => s.id === id);
        if (idx !== -1) {
            this.saidas[idx] = updatedSaida;
            localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
        }

        // 2) Log de auditoria (SEMPRE local + tenta Supabase)
        this.logAudit('EDIT', id, oldSaida, updatedSaida);

        // 3) Tenta salvar no Supabase
        if (supabaseClient && isOnline) {
            this.setLoading(true);
            try {
                const dbData = this.mapSaidaToDB(updatedSaida);
                const { error } = await supabaseClient.from('saidas').upsert(dbData);
                if (error) throw error;
                console.log('Edição salva no Supabase');
            } catch (e) {
                console.error('Erro ao salvar edição no Supabase:', e);
                SyncQueue.add('UPDATE', 'saidas', this.mapSaidaToDB(updatedSaida));
                this.toast('Editado localmente. Será sincronizado depois.', 'warning');
            } finally {
                this.setLoading(false);
            }
        } else if (supabaseClient) {
            SyncQueue.add('UPDATE', 'saidas', this.mapSaidaToDB(updatedSaida));
        }

        this.closeModal('modal-edit');
        await this.loadData();
        this.renderDashboard();
        this.renderSaidas();
        if (!SyncQueue.count()) this.toast('Saída editada com sucesso!', 'success');
    },

    confirmDelete(id) {
        const s = this.saidas.find(x => x.id === id);
        if (!s) return;
        this.deleteTargetId = id;
        const detail = document.getElementById('modal-detail-text');
        if (detail) detail.textContent = `Saída de ${s.nome} em ${this.formatDate(s.data)} às ${s.hora}`;
        this.openModal('modal-confirm');
    },

    async doDelete() {
        const id = this.deleteTargetId;
        if (!id) return;

        const oldSaida = this.saidas.find(s => s.id === id);

        // 1) REMOVE SEMPRE do localStorage
        this.saidas = this.saidas.filter(s => s.id !== id);
        localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));

        // 2) Log de auditoria
        if (oldSaida) this.logAudit('DELETE', id, oldSaida, null);

        // 3) Tenta deletar no Supabase
        if (supabaseClient && isOnline) {
            this.setLoading(true);
            try {
                const { error } = await supabaseClient.from('saidas').delete().eq('id', id);
                if (error) throw error;
                console.log('Saída deletada no Supabase');
            } catch (e) {
                console.error('Erro ao deletar no Supabase:', e);
                SyncQueue.add('DELETE', 'saidas', { id });
                this.toast('Excluído localmente. Será sincronizado depois.', 'warning');
            } finally {
                this.setLoading(false);
            }
        } else if (supabaseClient) {
            SyncQueue.add('DELETE', 'saidas', { id });
        }

        this.deleteTargetId = null;
        this.closeModal('modal-confirm');
        await this.loadData();
        this.renderDashboard();
        this.renderSaidas();
        if (!SyncQueue.count()) this.toast('Saída excluída com sucesso!', 'success');
    },

    /* ---------- AUDITORIA (SEMPRE LOCAL + TENTA SUPABASE) ---------- */
    logAudit(acao, targetId, oldValues, newValues) {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            operador: this.currentOperator.name + ' (' + this.currentOperator.mat + ')',
            acao,
            targetId,
            oldValues: oldValues || null,
            newValues: newValues || null
        };

        // SEMPRE salva localmente
        this.auditLog.unshift(entry);
        localStorage.setItem('ct_audit', JSON.stringify(this.auditLog));

        // Tenta salvar no Supabase
        if (supabaseClient && isOnline) {
            supabaseClient.from('audit_logs').insert(this.mapAuditToDB(entry))
                .then(({ error }) => {
                    if (error) {
                        console.error('Erro ao salvar audit no Supabase:', error);
                        SyncQueue.add('INSERT', 'audit_logs', this.mapAuditToDB(entry));
                    }
                })
                .catch(e => {
                    console.error('Exceção ao salvar audit no Supabase:', e);
                    SyncQueue.add('INSERT', 'audit_logs', this.mapAuditToDB(entry));
                });
        } else if (supabaseClient) {
            SyncQueue.add('INSERT', 'audit_logs', this.mapAuditToDB(entry));
        }

        this.updateAuditNavBadge();
    },

    updateAuditNavBadge() {
        const badge = document.getElementById('audit-nav-badge');
        if (badge) {
            const recent = this.auditLog.filter(a => {
                const ts = new Date(a.timestamp);
                const dayMs = 24 * 60 * 60 * 1000;
                return (Date.now() - ts.getTime()) < dayMs;
            }).length;
            badge.textContent = recent;
            badge.style.display = recent > 0 ? 'inline-flex' : 'none';
        }
    },

    setupAuditoria() {
        const btnReset = document.getElementById('btn-audit-reset');
        if (btnReset) btnReset.addEventListener('click', () => {
            ['audit-filter-data-inicio', 'audit-filter-data-fim', 'audit-filter-operador', 'audit-filter-acao'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.renderAuditLog();
        });
        ['audit-filter-data-inicio', 'audit-filter-data-fim', 'audit-filter-operador', 'audit-filter-acao'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.renderAuditLog());
        });
    },

    renderAuditLog() {
        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;

        const dtIni = document.getElementById('audit-filter-data-inicio')?.value || '';
        const dtFim = document.getElementById('audit-filter-data-fim')?.value || '';
        const oper = (document.getElementById('audit-filter-operador')?.value || '').trim().toLowerCase();
        const acao = document.getElementById('audit-filter-acao')?.value || '';

        let filtered = [...this.auditLog];
        if (dtIni) filtered = filtered.filter(a => a.timestamp >= dtIni);
        if (dtFim) filtered = filtered.filter(a => a.timestamp <= dtFim + 'T23:59:59');
        if (oper) filtered = filtered.filter(a => (a.operador || '').toLowerCase().includes(oper));
        if (acao) filtered = filtered.filter(a => a.acao === acao);

        const emptyEl = document.getElementById('audit-empty');
        if (!filtered.length) {
            tbody.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        tbody.innerHTML = filtered.map(a => {
            const ts = this.formatDateTime(a.timestamp);
            const acaoLabel = a.acao === 'EDIT' ? '<span class="badge badge-edit">✏️ Edição</span>'
                            : a.acao === 'DELETE' ? '<span class="badge badge-delete">🗑️ Exclusão</span>' : a.acao;
            let details = '';
            if (a.acao === 'DELETE' && a.oldValues) {
                details = `Excluído: ${a.oldValues.nome || '-'} — ${a.oldValues.local || '-'}`;
            } else if (a.acao === 'EDIT' && a.newValues) {
                const changes = [];
                if (a.oldValues && a.newValues) {
                    const fields = ['data','hora','tipo','local','matricula','nome','tipoApresentacao','regime','viatura','motorista','observacoes'];
                    fields.forEach(f => {
                        if (JSON.stringify(a.oldValues[f]) !== JSON.stringify(a.newValues[f])) {
                            changes.push(`${f}: "${a.oldValues[f] || '-'}" → "${a.newValues[f] || '-'}"`);
                        }
                    });
                }
                details = changes.length ? changes.join(', ') : 'Sem alterações detectadas';
            }
            return `<tr>
                <td>${ts}</td>
                <td>${this.esc(a.operador)}</td>
                <td>${acaoLabel}</td>
                <td>${this.esc(details)}</td>
            </tr>`;
        }).join('');
    },

    /* ---------- RELATÓRIO ---------- */
    // BUG11: Handlers completos (gerar, limpar, imprimir, PDF, CSV)
    setupRelatorio() {
        const btnGerar = document.getElementById('btn-gerar-relatorio');
        if (btnGerar) btnGerar.addEventListener('click', () => this.gerarRelatorio());

        const btnLimpar = document.getElementById('btn-limpar-relatorio');
        if (btnLimpar) btnLimpar.addEventListener('click', () => {
            ['rel-data-inicio', 'rel-data-fim', 'rel-tipo', 'rel-regime', 'rel-local', 'rel-operador'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.gerarRelatorio();
        });

        const btnImprimir = document.getElementById('btn-imprimir-relatorio');
        if (btnImprimir) btnImprimir.addEventListener('click', () => this.imprimirRelatorio());

        const btnPdf = document.getElementById('btn-exportar-pdf');
        if (btnPdf) btnPdf.addEventListener('click', () => this.exportarPDF());

        const btnCsv = document.getElementById('btn-exportar-csv');
        if (btnCsv) btnCsv.addEventListener('click', () => this.exportarCSV());
    },

    // BUG7: Popular relatorio-kpis, relatorio-resumos, relatorio-tabela-card
    //        IDs: rel-kpi-total/externas/internas/dias, resumo-local/regime/operador/apresentacao
    //        Filtros: rel-data-inicio (NÃO rel-data-ini!), rel-data-fim, rel-tipo, rel-regime, rel-local, rel-operador
    gerarRelatorio() {
        const dtIni = document.getElementById('rel-data-inicio')?.value || '';
        const dtFim = document.getElementById('rel-data-fim')?.value || '';
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';
        const local = (document.getElementById('rel-local')?.value || '').trim().toLowerCase();
        const operador = (document.getElementById('rel-operador')?.value || '').trim().toLowerCase();

        let filtered = this.isAdmin() ? [...this.saidas] : this.getVisibleSaidas();
        if (dtIni) filtered = filtered.filter(s => s.data >= dtIni);
        if (dtFim) filtered = filtered.filter(s => s.data <= dtFim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (local) filtered = filtered.filter(s => (s.local || '').toLowerCase().includes(local));
        if (operador) filtered = filtered.filter(s =>
            (s.operador?.name || '').toLowerCase().includes(operador) ||
            (s.operador?.mat || '').includes(operador)
        );

        filtered.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));

        // KPIs
        const kpisDiv = document.getElementById('relatorio-kpis');
        if (kpisDiv) {
            kpisDiv.style.display = 'flex';
            const total = filtered.length;
            const externas = filtered.filter(s => s.tipo === 'externa').length;
            const internas = filtered.filter(s => s.tipo === 'interna').length;
            // Dias no período
            const diasSet = new Set(filtered.map(s => s.data));
            const dias = diasSet.size;

            const elKpiTotal = document.getElementById('rel-kpi-total');
            const elKpiExt = document.getElementById('rel-kpi-externas');
            const elKpiInt = document.getElementById('rel-kpi-internas');
            const elKpiDias = document.getElementById('rel-kpi-dias');
            if (elKpiTotal) elKpiTotal.textContent = total;
            if (elKpiExt) elKpiExt.textContent = externas;
            if (elKpiInt) elKpiInt.textContent = internas;
            if (elKpiDias) elKpiDias.textContent = dias;
        }

        // Resumos
        const resumosDiv = document.getElementById('relatorio-resumos');
        if (resumosDiv) {
            resumosDiv.classList.remove('hidden');
            resumosDiv.style.display = '';

            // Resumo por Local
            const porLocal = {};
            filtered.forEach(s => { porLocal[s.local] = (porLocal[s.local] || 0) + 1; });
            const topLocais = Object.entries(porLocal).sort((a, b) => b[1] - a[1]);
            const resumoLocal = document.getElementById('resumo-local');
            if (resumoLocal) {
                resumoLocal.innerHTML = topLocais.length
                    ? topLocais.map(([l, c]) => `<li>${this.esc(l)}: <strong>${c}</strong></li>`).join('')
                    : '<li>Nenhum local</li>';
            }

            // Resumo por Regime
            const porRegime = {};
            filtered.forEach(s => { porRegime[s.regime] = (porRegime[s.regime] || 0) + 1; });
            const regimeLabels = { SA: 'Semiaberto', FE: 'Fechado', CR: 'Cela Regime' };
            const topRegimes = Object.entries(porRegime).sort((a, b) => b[1] - a[1]);
            const resumoRegime = document.getElementById('resumo-regime');
            if (resumoRegime) {
                resumoRegime.innerHTML = topRegimes.length
                    ? topRegimes.map(([r, c]) => `<li>${regimeLabels[r] || r}: <strong>${c}</strong></li>`).join('')
                    : '<li>Nenhum regime</li>';
            }

            // Resumo por Operador
            const porOperador = {};
            filtered.forEach(s => {
                const opKey = s.operador ? `${s.operador.name} (${s.operador.mat})` : 'Desconhecido';
                porOperador[opKey] = (porOperador[opKey] || 0) + 1;
            });
            const topOperadores = Object.entries(porOperador).sort((a, b) => b[1] - a[1]);
            const resumoOperador = document.getElementById('resumo-operador');
            if (resumoOperador) {
                resumoOperador.innerHTML = topOperadores.length
                    ? topOperadores.map(([o, c]) => `<li>${this.esc(o)}: <strong>${c}</strong></li>`).join('')
                    : '<li>Nenhum operador</li>';
            }

            // Resumo por Tipo de Apresentação
            const porApresentacao = {};
            filtered.forEach(s => { porApresentacao[s.tipoApresentacao] = (porApresentacao[s.tipoApresentacao] || 0) + 1; });
            const topApresentacao = Object.entries(porApresentacao).sort((a, b) => b[1] - a[1]);
            const resumoApresentacao = document.getElementById('resumo-apresentacao');
            if (resumoApresentacao) {
                resumoApresentacao.innerHTML = topApresentacao.length
                    ? topApresentacao.map(([a, c]) => `<li>${this.esc(a)}: <strong>${c}</strong></li>`).join('')
                    : '<li>Nenhum tipo</li>';
            }
        }

        // Tabela de resultados
        const tabelaCard = document.getElementById('relatorio-tabela-card');
        if (tabelaCard) {
            if (!filtered.length) {
                tabelaCard.style.display = 'none';
                return;
            }
            tabelaCard.style.display = 'block';

            // Footer KPIs
            const elRelTotal = document.getElementById('rel-total');
            const elRelExt = document.getElementById('rel-ext');
            const elRelInt = document.getElementById('rel-int');
            const elRelDisplay = document.getElementById('relatorio-data-display');
            if (elRelTotal) elRelTotal.textContent = filtered.length;
            if (elRelExt) elRelExt.textContent = filtered.filter(s => s.tipo === 'externa').length;
            if (elRelInt) elRelInt.textContent = filtered.filter(s => s.tipo === 'interna').length;
            if (elRelDisplay) elRelDisplay.textContent = `Período: ${dtIni || 'Início'} a ${dtFim || 'Fim'}`;

            // Tbody 11 colunas: #, Data, Horário, Local, Matrícula, Nome, Tipo Apres., Regime, Tipo Saída, Viatura, Motorista
            const tbody = document.getElementById('tbody-relatorio');
            if (tbody) {
                tbody.innerHTML = filtered.map((s, i) => {
                    const tipoLabel = s.tipo === 'externa' ? 'Externa' : 'Interna';
                    const regimeLabel = { SA: 'Semiaberto', FE: 'Fechado', CR: 'Cela Regime' }[s.regime] || s.regime;
                    const nomeDisplay = s.nome ? this.esc(s.nome) : (s.observacoes || '-');
                    return `<tr>
                        <td>${i + 1}</td>
                        <td>${this.formatDate(s.data)}</td>
                        <td>${s.hora || '-'}</td>
                        <td>${this.esc(s.local)}</td>
                        <td>${this.esc(s.matricula)}</td>
                        <td>${nomeDisplay}</td>
                        <td>${this.esc(s.tipoApresentacao) || '-'}</td>
                        <td>${regimeLabel}</td>
                        <td>${tipoLabel}</td>
                        <td>${this.esc(s.viatura) || '-'}</td>
                        <td>${this.esc(s.motorista) || '-'}</td>
                    </tr>`;
                }).join('');
            }
        }
    },

    // Imprimir relatório (window.print focado na seção)
    imprimirRelatorio() {
        const tabelaCard = document.getElementById('relatorio-tabela-card');
        if (tabelaCard && tabelaCard.style.display !== 'none') {
            window.print();
        } else {
            this.toast('Gere o relatório antes de imprimir.', 'warning');
        }
    },

    // BUG8: exportarPDF com 11 colunas + filtros rel-local/rel-operador
    async exportarPDF() {
        if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
            this.toast('Biblioteca jsPDF não carregada. Verifique a conexão com a internet.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        // BUG7/8: Usa IDs corretos rel-data-inicio, rel-local, rel-operador
        const dtIni = document.getElementById('rel-data-inicio')?.value || '';
        const dtFim = document.getElementById('rel-data-fim')?.value || '';
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';
        const local = (document.getElementById('rel-local')?.value || '').trim().toLowerCase();
        const operador = (document.getElementById('rel-operador')?.value || '').trim().toLowerCase();

        let filtered = this.isAdmin() ? [...this.saidas] : this.getVisibleSaidas();
        if (dtIni) filtered = filtered.filter(s => s.data >= dtIni);
        if (dtFim) filtered = filtered.filter(s => s.data <= dtFim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (local) filtered = filtered.filter(s => (s.local || '').toLowerCase().includes(local));
        if (operador) filtered = filtered.filter(s =>
            (s.operador?.name || '').toLowerCase().includes(operador) ||
            (s.operador?.mat || '').includes(operador)
        );

        filtered.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));

        const period = dtIni && dtFim ? `${this.formatDate(dtIni)} a ${this.formatDate(dtFim)}` : 'Todos';

        doc.setFontSize(16);
        doc.text('Relatório de Saídas - Complexo Penal de Marília', 14, 15);
        doc.setFontSize(10);
        doc.text(`Período: ${period}`, 14, 22);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 27);
        doc.text(`Operador: ${this.currentOperator.name}`, 14, 32);

        // BUG8: 11 colunas no PDF
        const tableData = filtered.map(s => [
            this.formatDate(s.data),
            s.hora || '-',
            s.local || '-',
            s.matricula || '-',
            s.nome || '-',
            s.tipoApresentacao || '-',
            { SA: 'SA', FE: 'FE', CR: 'CR' }[s.regime] || s.regime || '-',
            s.tipo === 'externa' ? 'Ext' : 'Int',
            s.viatura || '-',
            s.motorista || '-',
            s.operador?.name || '-'
        ]);

        if (tableData.length) {
            doc.autoTable({
                head: [['Data', 'Hora', 'Local', 'Matrícula', 'Nome', 'Tp Apres.', 'Reg', 'Tipo', 'Viatura', 'Motorista', 'Operador']],
                body: tableData,
                startY: 36,
                styles: { fontSize: 7 },
                headStyles: { fillColor: [44, 62, 80] }
            });
        } else {
            doc.text('Nenhuma saída encontrada para o período selecionado.', 14, 40);
        }

        doc.save(`relatorio-saidas-${new Date().toISOString().split('T')[0]}.pdf`);
        this.toast('PDF exportado com sucesso!', 'success');
    },

    // BUG9: exportarCSV NOVO - 11 colunas + filtros completos
    exportarCSV() {
        const dtIni = document.getElementById('rel-data-inicio')?.value || '';
        const dtFim = document.getElementById('rel-data-fim')?.value || '';
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';
        const local = (document.getElementById('rel-local')?.value || '').trim().toLowerCase();
        const operador = (document.getElementById('rel-operador')?.value || '').trim().toLowerCase();

        let filtered = this.isAdmin() ? [...this.saidas] : this.getVisibleSaidas();
        if (dtIni) filtered = filtered.filter(s => s.data >= dtIni);
        if (dtFim) filtered = filtered.filter(s => s.data <= dtFim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (local) filtered = filtered.filter(s => (s.local || '').toLowerCase().includes(local));
        if (operador) filtered = filtered.filter(s =>
            (s.operador?.name || '').toLowerCase().includes(operador) ||
            (s.operador?.mat || '').includes(operador)
        );

        filtered.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));

        if (!filtered.length) {
            this.toast('Nenhum dado para exportar.', 'warning');
            return;
        }

        // Cabeçalho 11 colunas
        const header = ['Data', 'Horário', 'Local', 'Matrícula', 'Nome', 'Tipo Apresentação', 'Regime', 'Tipo Saída', 'Viatura', 'Motorista', 'Operador'];
        const regimeLabels = { SA: 'Semiaberto', FE: 'Fechado', CR: 'Cela Regime' };

        const rows = filtered.map(s => [
            this.formatDate(s.data),
            s.hora || '',
            s.local || '',
            s.matricula || '',
            s.nome || '',
            s.tipoApresentacao || '',
            regimeLabels[s.regime] || s.regime || '',
            s.tipo === 'externa' ? 'Externa' : 'Interna',
            s.viatura || '',
            s.motorista || '',
            s.operador ? `${s.operador.name} (${s.operador.mat})` : ''
        ]);

        // Montar CSV com escape de aspas
        const csvEscape = (val) => {
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        const csvContent = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
        const BOM = '\uFEFF'; // UTF-8 BOM para Excel
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-saidas-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.toast('CSV exportado com sucesso!', 'success');
    },

    /* ---------- CONFIGURAÇÕES (OFFLINE-FIRST) ---------- */
    // BUG10: btn-salvar-configs (NÃO btn-salvar-config), inputs fixos cfg-admin1-name/mat, cfg-admin2-name/mat
    setupConfiguracoes() {
        const btnSalvar = document.getElementById('btn-salvar-configs');
        const btnMigrar = document.getElementById('btn-migrar-supabase');

        if (btnSalvar) btnSalvar.addEventListener('click', () => this.salvarConfiguracoes());
        if (btnMigrar) btnMigrar.addEventListener('click', () => this.migrarLocalStorageParaSupabase());
    },

    // BUG10: loadConfigValues lê/escreve nos 4 inputs fixos (NÃO innerHTML dinâmico)
    loadConfigValues() {
        const a1Name = document.getElementById('cfg-admin1-name');
        const a1Mat = document.getElementById('cfg-admin1-mat');
        const a2Name = document.getElementById('cfg-admin2-name');
        const a2Mat = document.getElementById('cfg-admin2-mat');

        if (!this.adminList.length) return;

        const admin1 = this.adminList[0] || {};
        const admin2 = this.adminList[1] || {};

        if (a1Name) a1Name.value = admin1.nome || admin1.name || '';
        if (a1Mat) a1Mat.value = admin1.matricula || admin1.mat || '';
        if (a2Name) a2Name.value = admin2.nome || admin2.name || '';
        if (a2Mat) a2Mat.value = admin2.matricula || admin2.mat || '';
    },

    // BUG10: salvarConfiguracoes lê dos 4 inputs fixos, monta adminList com 2 objetos
    async salvarConfiguracoes() {
        if (!this.isAdmin()) {
            this.toast('Apenas administradores podem alterar configurações.', 'error');
            return;
        }

        const a1Nome = document.getElementById('cfg-admin1-name')?.value.trim();
        const a1Mat = document.getElementById('cfg-admin1-mat')?.value.trim();
        const a2Nome = document.getElementById('cfg-admin2-name')?.value.trim();
        const a2Mat = document.getElementById('cfg-admin2-mat')?.value.trim();

        const newAdmins = [];
        if (a1Nome && a1Mat) newAdmins.push({ nome: a1Nome, matricula: a1Mat });
        if (a2Nome && a2Mat) newAdmins.push({ nome: a2Nome, matricula: a2Mat });

        if (!newAdmins.length) {
            this.toast('Preencha ao menos um administrador.', 'error');
            return;
        }

        // 1) SALVA SEMPRE no localStorage
        this.adminList = newAdmins;
        localStorage.setItem('ct_admins', JSON.stringify(this.adminList));

        // 2) Tenta salvar no Supabase (delete all + insert)
        if (supabaseClient && isOnline) {
            this.setLoading(true);
            try {
                // Deletar todos os admins existentes
                const { error: delErr } = await supabaseClient.from('admins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (delErr) throw delErr;
                // Inserir novos admins
                if (newAdmins.length) {
                    const { error: insErr } = await supabaseClient.from('admins').insert(newAdmins);
                    if (insErr) throw insErr;
                }
                console.log('Configurações salvas no Supabase');
            } catch (e) {
                console.error('Erro ao salvar configs no Supabase:', e);
                this.toast('Salvo localmente. Erro ao sincronizar com o servidor.', 'warning');
            } finally {
                this.setLoading(false);
            }
        }

        this.toast('Configurações salvas com sucesso!', 'success');
    },

    async migrarLocalStorageParaSupabase() {
        if (!this.isAdmin()) {
            this.toast('Apenas administradores podem migrar dados.', 'error');
            return;
        }
        if (!supabaseClient) {
            this.toast('Supabase não configurado. Verifique as credenciais.', 'error');
            return;
        }

        const btnMigrar = document.getElementById('btn-migrar-supabase');
        if (btnMigrar) {
            btnMigrar.disabled = true;
            btnMigrar.textContent = '⏳ Migrando...';
        }

        this.setLoading(true);
        try {
            // Migrar saídas
            const localSaidas = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
            if (localSaidas.length) {
                console.log(`Migrando ${localSaidas.length} saídas...`);
                for (const s of localSaidas) {
                    try {
                        const dbData = this.mapSaidaToDB(s);
                        await supabaseClient.from('saidas').upsert(dbData, { onConflict: 'id' });
                    } catch (e) {
                        console.error('Erro ao migrar saída:', s.id, e);
                    }
                }
                this.toast(`${localSaidas.length} saídas migradas!`, 'success');
            }

            // Migrar audit logs
            const localAudit = JSON.parse(localStorage.getItem('ct_audit') || '[]');
            if (localAudit.length) {
                console.log(`Migrando ${localAudit.length} audit logs...`);
                for (const a of localAudit) {
                    try {
                        const dbData = this.mapAuditToDB(a);
                        await supabaseClient.from('audit_logs').upsert(dbData, { onConflict: 'id' });
                    } catch (e) {
                        console.error('Erro ao migrar audit:', a.id, e);
                    }
                }
                this.toast(`${localAudit.length} logs migrados!`, 'success');
            }

            // Migrar admins
            const localAdmins = JSON.parse(localStorage.getItem('ct_admins') || '[]');
            if (localAdmins.length) {
                console.log(`Migrando ${localAdmins.length} admins...`);
                for (const a of localAdmins) {
                    try {
                        await supabaseClient.from('admins').upsert({ nome: a.nome || a.name, matricula: a.matricula || a.mat }, { onConflict: 'matricula' });
                    } catch (e) {
                        console.error('Erro ao migrar admin:', e);
                    }
                }
                this.toast(`${localAdmins.length} admins migrados!`, 'success');
            }

            // Limpar fila de sincronização (dados já foram migrados manualmente)
            SyncQueue.clear();

            await this.loadData();
            this.renderDashboard();
            this.renderSaidas();

        } catch (e) {
            console.error('Erro na migração:', e);
            this.toast('Erro durante a migração. Verifique o console.', 'error');
        } finally {
            this.setLoading(false);
            if (btnMigrar) {
                btnMigrar.disabled = false;
                btnMigrar.textContent = '🚀 Migrar dados para Supabase';
            }
        }
    },

    /* ---------- SEED DATA / DEMO DATA ---------- */
    setupSeedDataUI() {
        const btnImport = document.getElementById('btn-import-seed');
        const btnReset = document.getElementById('btn-reset-seed');
        const seedLabel = document.getElementById('seed-count-label');
        const existingLabel = document.getElementById('existing-count-label');

        // Atualizar labels
        if (seedLabel && typeof SEED_SAIDAS !== 'undefined') {
            seedLabel.textContent = SEED_SAIDAS.length;
        }
        if (existingLabel) {
            existingLabel.textContent = this.saidas.length;
        }

        if (btnImport) {
            btnImport.addEventListener('click', () => {
                if (typeof SEED_SAIDAS === 'undefined') {
                    this.toast('Seed data não disponível. Verifique se seed_data_v2.js está carregado.', 'error');
                    return;
                }
                const existing = this.saidas.length;
                if (existing > 10) {
                    if (!confirm(
                        `Já existem ${existing} saídas no sistema.\n` +
                        `Deseja importar mais ${SEED_SAIDAS.length} registros?\n` +
                        `Isso pode criar duplicatas.`
                    )) return;
                }
                const existingIds = new Set(this.saidas.map(s => s.id));
                const newItems = SEED_SAIDAS.filter(s => !existingIds.has(s.id));
                this.saidas = [...this.saidas, ...newItems];
                this.saidas.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));
                localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
                localStorage.setItem('ct_seed_imported', new Date().toISOString());
                this.renderDashboard();
                this.renderSaidas();
                if (existingLabel) existingLabel.textContent = this.saidas.length;
                this.toast(`${newItems.length} registros importados da planilha! (Total: ${this.saidas.length})`, 'success');
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (!this.isAdmin()) {
                    this.toast('Apenas administradores podem limpar dados.', 'error');
                    return;
                }
                if (!confirm(
                    '⚠️ ATENÇÃO\n\n' +
                    'Isso apagará TODOS os dados de saídas do sistema (local e Supabase).\n' +
                    'Esta ação não pode ser desfeita.\n\n' +
                    'Deseja continuar?'
                )) return;
                if (!confirm('Última chance: realmente apagar TUDO?')) return;

                this.saidas = [];
                localStorage.setItem('ct_saidas', '[]');
                localStorage.removeItem('ct_seed_imported');
                this.auditLog = [];
                localStorage.setItem('ct_audit', '[]');

                // Tentar limpar Supabase também
                if (supabaseClient && isOnline) {
                    this.setLoading(true);
                    supabaseClient.from('saidas').delete().neq('id', '00000000').then(() => {
                        this.setLoading(false);
                        this.toast('Todos os dados apagados (local + Supabase).', 'success');
                    }).catch(e => {
                        this.setLoading(false);
                        console.error('Erro ao limpar Supabase:', e);
                        this.toast('Dados locais apagados. Erro ao limpar Supabase.', 'warning');
                    });
                } else {
                    this.toast('Todos os dados locais apagados.', 'success');
                }

                this.renderDashboard();
                this.renderSaidas();
                if (existingLabel) existingLabel.textContent = 0;
            });
        }
    },

    /* ---------- UTILITÁRIOS ---------- */
    setLoading(loading) {
        this.isLoading = loading;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = loading ? 'flex' : 'none';
    },

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    },

    toast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-message');
        if (!toast || !msg) return;

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        if (icon) icon.textContent = icons[type] || icons.info;
        msg.textContent = message;

        toast.className = `toast toast-${type} active`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    },

    formatDateTime(isoStr) {
        if (!isoStr) return '-';
        try {
            const d = new Date(isoStr);
            return d.toLocaleString('pt-BR');
        } catch {
            return isoStr;
        }
    },

    esc(str) {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }
};

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});