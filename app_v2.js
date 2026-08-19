/* ============================================================
   CONTROLE DE TRÂNSITO — VERSÃO 2.0 (OFFLINE-FIRST + SUPABASE)
   ============================================================
   Arquitetura: Salva SEMPRE no localStorage + tenta Supabase.
   Se Supabase falhar, opera normalmente offline.
   syncQueue armazena operações pendentes para sincronizar
   quando a conexão for restabelecida.
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

            await this.loadData();
            await checkSupabaseConnection();
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
            return `<tr>
                <td>${dataFormatada}</td>
                <td>${s.hora || '-'}</td>
                <td><span class="badge badge-${s.tipo}">${tipoLabel}</span></td>
                <td>${this.esc(s.local)}</td>
                <td>${this.esc(s.matricula)}</td>
                <td>${this.esc(s.nome)}</td>
                <td><span class="badge badge-regime">${regimeLabel}</span></td>
                <td>${this.esc(s.viatura) || '-'}</td>
                <td>${this.esc(s.operador?.name) || '-'}</td>
                <td class="actions-cell">
                    ${canEdit ? `<button class="btn-icon" onclick="App.openEdit('${s.id}')" title="Editar">✏️</button>` : ''}
                    ${canEdit ? `<button class="btn-icon" onclick="App.confirmDelete('${s.id}')" title="Excluir">🗑️</button>` : ''}
                </td>
            </tr>`;
        }).join('');
    },

    /* ---------- DASHBOARD ---------- */
    renderDashboard() {
        const all = this.saidas;
        const today = new Date().toISOString().split('T')[0];
        const todaySaidas = all.filter(s => s.data === today);
        const externas = todaySaidas.filter(s => s.tipo === 'externa').length;
        const internas = todaySaidas.filter(s => s.tipo === 'interna').length;

        const elToday = document.getElementById('stat-hoje');
        const elExt = document.getElementById('stat-externas');
        const elInt = document.getElementById('stat-internas');
        const elTotal = document.getElementById('stat-total');

        if (elToday) elToday.textContent = todaySaidas.length;
        if (elExt) elExt.textContent = externas;
        if (elInt) elInt.textContent = internas;
        if (elTotal) elTotal.textContent = all.length;

        // Próximas saídas (hoje e futuras)
        const upcoming = all.filter(s => s.data >= today)
            .sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''))
            .slice(0, 10);

        const upList = document.getElementById('upcoming-list');
        if (upList) {
            if (!upcoming.length) {
                upList.innerHTML = '<li class="upcoming-empty">Nenhuma saída programada</li>';
            } else {
                upList.innerHTML = upcoming.map(s => {
                    const isPast = s.data === today && s.hora < new Date().toTimeString().slice(0, 5);
                    const tipoIcon = s.tipo === 'externa' ? '🔴' : '🟢';
                    return `<li class="upcoming-item ${isPast ? 'past' : ''}">
                        <span class="upcoming-date">${this.formatDate(s.data)} ${s.hora}</span>
                        <span class="upcoming-info">${tipoIcon} ${this.esc(s.nome)} — ${this.esc(s.local)}</span>
                    </li>`;
                }).join('');
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
    setupRelatorio() {
        const btn = document.getElementById('btn-gerar-relatorio');
        if (btn) btn.addEventListener('click', () => this.gerarRelatorio());
        const btnPdf = document.getElementById('btn-exportar-pdf');
        if (btnPdf) btnPdf.addEventListener('click', () => this.exportarPDF());
    },

    gerarRelatorio() {
        const dtIni = document.getElementById('rel-data-ini')?.value || '';
        const dtFim = document.getElementById('rel-data-fim')?.value || '';
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';

        let filtered = this.isAdmin() ? [...this.saidas] : this.getVisibleSaidas();
        if (dtIni) filtered = filtered.filter(s => s.data >= dtIni);
        if (dtFim) filtered = filtered.filter(s => s.data <= dtFim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);

        const container = document.getElementById('relatorio-output');
        if (!container) return;

        if (!filtered.length) {
            container.innerHTML = '<div class="empty-state"><p>Nenhuma saída encontrada para os filtros selecionados.</p></div>';
            return;
        }

        const total = filtered.length;
        const externas = filtered.filter(s => s.tipo === 'externa').length;
        const internas = filtered.filter(s => s.tipo === 'interna').length;
        const porRegime = {};
        filtered.forEach(s => { porRegime[s.regime] = (porRegime[s.regime] || 0) + 1; });

        const porLocal = {};
        filtered.forEach(s => { porLocal[s.local] = (porLocal[s.local] || 0) + 1; });
        const topLocais = Object.entries(porLocal).sort((a, b) => b[1] - a[1]).slice(0, 10);

        container.innerHTML = `
            <div class="report-summary">
                <div class="report-stat"><span class="report-stat-number">${total}</span><span class="report-stat-label">Total de Saídas</span></div>
                <div class="report-stat"><span class="report-stat-number">${externas}</span><span class="report-stat-label">Externas</span></div>
                <div class="report-stat"><span class="report-stat-number">${internas}</span><span class="report-stat-label">Internas</span></div>
                ${Object.entries(porRegime).map(([k, v]) => `<div class="report-stat"><span class="report-stat-number">${v}</span><span class="report-stat-label">${k}</span></div>`).join('')}
            </div>
            <h4>Top 10 Locais</h4>
            <div class="report-locals">
                ${topLocais.map(([local, count]) => `<div class="report-local-item"><span>${this.esc(local)}</span><span class="report-local-count">${count}</span></div>`).join('')}
            </div>
            <h4>Detalhamento</h4>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Data</th><th>Hora</th><th>Tipo</th><th>Local</th><th>Matrícula</th><th>Nome</th><th>Regime</th><th>Operador</th></tr></thead>
                    <tbody>${filtered.sort((a, b) => a.data.localeCompare(b.data)).map(s => {
                        const tipoLabel = s.tipo === 'externa' ? 'Externa' : 'Interna';
                        return `<tr><td>${this.formatDate(s.data)}</td><td>${s.hora || '-'}</td><td>${tipoLabel}</td><td>${this.esc(s.local)}</td><td>${this.esc(s.matricula)}</td><td>${this.esc(s.nome)}</td><td>${s.regime}</td><td>${this.esc(s.operador?.name) || '-'}</td></tr>`;
                    }).join('')}</tbody>
                </table>
            </div>
        `;
    },

    async exportarPDF() {
        if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
            this.toast('Biblioteca jsPDF não carregada. Verifique a conexão com a internet.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const dtIni = document.getElementById('rel-data-ini')?.value || '';
        const dtFim = document.getElementById('rel-data-fim')?.value || '';
        const tipo = document.getElementById('rel-tipo')?.value || '';
        const regime = document.getElementById('rel-regime')?.value || '';

        let filtered = this.isAdmin() ? [...this.saidas] : this.getVisibleSaidas();
        if (dtIni) filtered = filtered.filter(s => s.data >= dtIni);
        if (dtFim) filtered = filtered.filter(s => s.data <= dtFim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);

        filtered.sort((a, b) => a.data.localeCompare(b.data));

        const period = dtIni && dtFim ? `${dtIni} a ${dtFim}` : 'Todos';

        doc.setFontSize(16);
        doc.text('Relatório de Saídas - Complexo Penal de Marília', 14, 15);
        doc.setFontSize(10);
        doc.text(`Período: ${period}`, 14, 22);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 27);
        doc.text(`Operador: ${this.currentOperator.name}`, 14, 32);

        const tableData = filtered.map(s => [
            this.formatDate(s.data), s.hora || '-',
            s.tipo === 'externa' ? 'Externa' : 'Interna',
            s.local || '-', s.matricula || '-', s.nome || '-',
            s.regime || '-', s.operador?.name || '-'
        ]);

        if (tableData.length) {
            doc.autoTable({
                head: [['Data', 'Hora', 'Tipo', 'Local', 'Matrícula', 'Nome', 'Regime', 'Operador']],
                body: tableData,
                startY: 36,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [44, 62, 80] }
            });
        } else {
            doc.text('Nenhuma saída encontrada para o período selecionado.', 14, 40);
        }

        doc.save(`relatorio-saidas-${new Date().toISOString().split('T')[0]}.pdf`);
        this.toast('PDF exportado com sucesso!', 'success');
    },

    /* ---------- CONFIGURAÇÕES (OFFLINE-FIRST) ---------- */
    setupConfiguracoes() {
        const btnSalvar = document.getElementById('btn-salvar-config');
        const btnMigrar = document.getElementById('btn-migrar-supabase');

        if (btnSalvar) btnSalvar.addEventListener('click', () => this.salvarConfiguracoes());
        if (btnMigrar) btnMigrar.addEventListener('click', () => this.migrarLocalStorageParaSupabase());
    },

    loadConfigValues() {
        const container = document.getElementById('admins-container');
        if (!container) return;

        const admins = this.adminList;
        container.innerHTML = admins.map((a, i) => `
            <div class="admin-row" data-index="${i}">
                <input type="text" class="admin-nome" value="${this.esc(a.nome || a.name || '')}" placeholder="Nome">
                <input type="text" class="admin-mat" value="${this.esc(a.matricula || a.mat || '')}" placeholder="Matrícula">
                <button class="btn-icon btn-remove-admin" onclick="App.removeAdminRow(${i})" title="Remover">✖</button>
            </div>
        `).join('');
    },

    removeAdminRow(index) {
        const container = document.getElementById('admins-container');
        if (!container) return;
        const rows = container.querySelectorAll('.admin-row');
        if (rows[index]) rows[index].remove();
    },

    async salvarConfiguracoes() {
        if (!this.isAdmin()) {
            this.toast('Apenas administradores podem alterar configurações.', 'error');
            return;
        }

        const container = document.getElementById('admins-container');
        if (!container) return;

        const newAdmins = [];
        container.querySelectorAll('.admin-row').forEach(row => {
            const nome = row.querySelector('.admin-nome')?.value.trim();
            const mat = row.querySelector('.admin-mat')?.value.trim();
            if (nome && mat) newAdmins.push({ nome, matricula: mat });
        });

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
