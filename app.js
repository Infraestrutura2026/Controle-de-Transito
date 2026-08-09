/* ============================================================
   CONTROLE DE TRÂNSITO — VERSÃO SUPABASE (MULTI-SETOR)
   ============================================================
   Antes de usar, substitua SUPABASE_URL e SUPABASE_ANON_KEY
   pelos valores do seu projeto no dashboard do Supabase.
   ============================================================ */

const SUPABASE_URL     = 'https://ddaforxeehdsjxabwder.supabase.co;
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
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
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
        initSupabase();
        this.bindLoginEvents();
        this.checkSession();
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
        document.getElementById('btn-login').addEventListener('click', () => this.doLogin());
        document.getElementById('operator-name').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doLogin(); });
        document.getElementById('operator-mat').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.doLogin(); });
        document.getElementById('btn-logout').addEventListener('click', () => this.logout());
    },

    async doLogin() {
        const name = document.getElementById('operator-name').value.trim();
        const mat  = document.getElementById('operator-mat').value.trim();
        const err  = document.getElementById('login-error');

        if (!name || !mat) {
            err.textContent = 'Preencha nome e matrícula.';
            return;
        }

        // Tenta carregar admins do Supabase; se falhar, usa localStorage como fallback
        let admins = [];
        if (supabaseClient) {
            const { data, error } = await supabaseClient.from('admins').select('*');
            if (!error && data) admins = data;
        }
        if (!admins.length) {
            admins = JSON.parse(localStorage.getItem('ct_admins') || '[]');
        }

        const isAdmin = admins.some(a =>
            String(a.matricula).trim() === mat &&
            (a.nome || '').toLowerCase() === name.toLowerCase()
        );

        this.currentOperator = { name, mat, isAdmin };
        sessionStorage.setItem('ct_operator', JSON.stringify(this.currentOperator));
        err.textContent = '';
        this.enterApp();
    },

    logout() {
        this.currentOperator = null;
        sessionStorage.removeItem('ct_operator');
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('main-screen').style.display = 'none';
    },

    /* ---------- ENTRADA NO APP ---------- */
    async enterApp() {
        document.getElementById('login-screen').classList.remove('active');
        const main = document.getElementById('main-screen');
        main.style.display = 'flex';
        setTimeout(() => main.classList.add('active'), 10);

        document.getElementById('display-operator-name').textContent = this.currentOperator.name;
        document.getElementById('display-operator-mat').textContent = `Mat: ${this.currentOperator.mat}`;
        document.getElementById('operator-avatar').textContent = this.currentOperator.name.charAt(0).toUpperCase();

        if (this.isAdmin()) {
            document.getElementById('nav-configuracoes').style.display = 'flex';
            document.getElementById('nav-auditoria').style.display = 'flex';
        }

        this.setupNavigation();
        this.setupFormCadastro();
        this.setupFiltrosListagem();
        this.setupRelatorio();
        this.setupConfiguracoes();
        this.setupAuditoria();
        this.setupModalEvents();

        await this.loadData();
        this.renderDashboard();
        this.renderSaidas();
        this.updateAuditNavBadge();
    },

    /* ---------- SUPABASE: CARREGAR DADOS ---------- */
    async loadData() {
        if (!supabaseClient) {
            this.toast('Supabase não configurado. Usando dados locais.', 'error');
            this.saidas = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
            this.auditLog = JSON.parse(localStorage.getItem('ct_audit') || '[]');
            this.adminList = JSON.parse(localStorage.getItem('ct_admins') || '[]');
            return;
        }

        this.setLoading(true);
        try {
            // Carrega saídas
            const { data: saidasData, error: errSaidas } = await supabaseClient
                .from('saidas')
                .select('*')
                .order('data', { ascending: false })
                .order('hora', { ascending: true });
            if (errSaidas) throw errSaidas;
            this.saidas = (saidasData || []).map(s => this.mapSaidaFromDB(s));

            // Carrega audit_logs
            const { data: auditData, error: errAudit } = await supabaseClient
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1000);
            if (errAudit) throw errAudit;
            this.auditLog = (auditData || []).map(a => this.mapAuditFromDB(a));

            // Carrega admins
            const { data: adminData, error: errAdmin } = await supabaseClient
                .from('admins')
                .select('*');
            if (errAdmin) throw errAdmin;
            this.adminList = adminData || [];

        } catch (e) {
            console.error('Erro ao carregar do Supabase:', e);
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
                document.getElementById(`page-${page}`).classList.add('active');
                if (page === 'relatorio') this.gerarRelatorio();
                if (page === 'auditoria') this.renderAuditLog();
                if (page === 'configuracoes') this.loadConfigValues();
            });
        });
    },

    /* ---------- CADASTRO ---------- */
    setupFormCadastro() {
        document.getElementById('form-saida').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSaida();
        });
        document.getElementById('btn-limpar').addEventListener('click', () => {
            document.getElementById('form-saida').reset();
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

            await this.loadData(); // Recarrega para ter o estado atualizado
            this.renderDashboard();
            this.renderSaidas();
            this.toast('Saída cadastrada com sucesso!', 'success');
            document.getElementById('form-saida').reset();

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
            document.getElementById(id)?.addEventListener('input', () => this.renderSaidas());
        });
        document.getElementById('btn-limpar-filtros')?.addEventListener('click', () => {
            ['filter-data-ini', 'filter-data-fim', 'filter-tipo', 'filter-regime', 'filter-local', 'filter-busca'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.renderSaidas();
        });
    },

    renderSaidas() {
        const tbody = document.getElementById('tbody-saidas');
        const ini = document.getElementById('filter-data-ini').value;
        const fim = document.getElementById('filter-data-fim').value;
        const tipo = document.getElementById('filter-tipo').value;
        const regime = document.getElementById('filter-regime').value;
        const local = document.getElementById('filter-local').value.trim().toLowerCase();
        const busca = document.getElementById('filter-busca').value.trim().toLowerCase();

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

        document.getElementById('kpi-total').textContent = visible.length;
        document.getElementById('kpi-hoje').textContent = hoje.length;
        document.getElementById('kpi-externas').textContent = ext;
        document.getElementById('kpi-internas').textContent = inte;

        const proximas = hoje.sort((a, b) => (a.hora || '').localeCompare(b.hora || '')).slice(0, 5);
        const divProx = document.getElementById('proximas-saidas');
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

        const locais = {};
        visible.forEach(s => { locais[s.local] = (locais[s.local] || 0) + 1; });
        const topLocais = Object.entries(locais).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const divLocais = document.getElementById('locais-frequentes');
        if (!topLocais.length) {
            divLocais.innerHTML = '<p>Sem dados suficientes.</p>';
        } else {
            divLocais.innerHTML = `<ul style="list-style:none;padding:0;margin:0;">${topLocais.map(([l, c]) =>
                `<li style="padding:0.5rem 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
                    <span>${l || '-'}</span><span class="badge badge-blue">${c}</span>
                </li>`
            ).join('')}</ul>`;
        }
    },

    /* ---------- RELATÓRIO ---------- */
    setupRelatorio() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('rel-data').value = today;
        document.getElementById('btn-gerar-relatorio')?.addEventListener('click', () => this.gerarRelatorio());
        document.getElementById('btn-exportar-pdf')?.addEventListener('click', () => this.exportarRelatorioPDF());
    },

    gerarRelatorio() {
        const data = document.getElementById('rel-data').value;
        const tipo = document.getElementById('rel-tipo').value;
        if (!data) { this.toast('Selecione uma data.', 'error'); return; }

        let filtered = this.getVisibleSaidas().filter(s => s.data === data);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        filtered.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;

        document.getElementById('relatorio-data-display').textContent = this.fmtDateLong(data);
        document.getElementById('rel-total').textContent = total;
        document.getElementById('rel-ext').textContent = ext;
        document.getElementById('rel-int').textContent = int;

        const tbody = document.getElementById('tbody-relatorio');
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
        const data = document.getElementById('rel-data').value;
        if (!data) { this.toast('Selecione uma data.', 'error'); return; }
        let filtered = this._lastRelatorioFiltered;
        if (!filtered || !filtered.length) {
            filtered = this.getVisibleSaidas().filter(s => s.data === data);
            const tipo = document.getElementById('rel-tipo').value;
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
        document.getElementById('edit-s-data').value = s.data;
        document.getElementById('edit-s-hora').value = s.hora;
        document.getElementById('edit-s-tipo').value = s.tipo;
        document.getElementById('edit-s-regime').value = s.regime;
        document.getElementById('edit-s-local').value = s.local;
        document.getElementById('edit-s-matricula').value = s.matricula;
        document.getElementById('edit-s-nome').value = s.nome;
        document.getElementById('edit-s-tipo-apresentacao').value = s.tipoApresentacao;
        document.getElementById('edit-s-viatura').value = s.viatura || '';
        document.getElementById('edit-s-motorista').value = s.motorista || '';
        document.getElementById('edit-s-obs').value = s.observacoes || '';
        document.getElementById('modal-edit').classList.add('active');
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
        document.getElementById('modal-edit').classList.remove('active');
        this.editTargetId = null;
    },

    /* ---------- EXCLUSÃO ---------- */
    setupModalEvents() {
        document.getElementById('btn-cancel-edit')?.addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-save-edit')?.addEventListener('click', () => this.saveEditSaida());
        document.getElementById('btn-cancel-delete')?.addEventListener('click', () => {
            document.getElementById('modal-confirm').classList.remove('active');
            this.deleteTargetId = null;
        });
        document.getElementById('btn-confirm-delete')?.addEventListener('click', () => this.confirmDelete());
    },

    deleteSaida(id) {
        const s = this.saidas.find(x => x.id === id);
        if (!s) return;
        if (!this.canManageSaida(s)) {
            this.toast('Você não tem permissão para excluir esta saída.', 'error');
            return;
        }
        this.deleteTargetId = id;
        document.getElementById('modal-detail-text').textContent =
            `${s.nome || '-'} | ${this.fmtDate(s.data)} ${s.hora || ''} | ${s.local || ''}`;
        document.getElementById('modal-confirm').classList.add('active');
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
            document.getElementById('modal-confirm').classList.remove('active');
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
        // Sempre guarda local também como backup
        this.auditLog.push(entry);
        localStorage.setItem('ct_audit', JSON.stringify(this.auditLog));
    },

    setupAuditoria() {
        document.getElementById('btn-audit-reset')?.addEventListener('click', () => this.resetAuditFilters());
        ['audit-filter-data-inicio', 'audit-filter-data-fim', 'audit-filter-operador', 'audit-filter-acao'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.renderAuditLog());
        });
    },

    renderAuditLog() {
        const tbody = document.getElementById('audit-table-body');
        const emptyState = document.getElementById('audit-empty');
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
        if (!logs.length) { emptyState.style.display = 'block'; return; }
        emptyState.style.display = 'none';

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
        document.getElementById('audit-filter-data-inicio').value = '';
        document.getElementById('audit-filter-data-fim').value = '';
        document.getElementById('audit-filter-operador').value = '';
        document.getElementById('audit-filter-acao').value = '';
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
        document.getElementById('btn-salvar-configs')?.addEventListener('click', () => this.salvarConfiguracoes());
    },

    loadConfigValues() {
        const admins = this.adminList;
        if (admins[0]) {
            document.getElementById('cfg-admin1-name').value = admins[0].nome || '';
            document.getElementById('cfg-admin1-mat').value = admins[0].matricula || '';
        }
        if (admins[1]) {
            document.getElementById('cfg-admin2-name').value = admins[1].nome || '';
            document.getElementById('cfg-admin2-mat').value = admins[1].matricula || '';
        }
    },

    async salvarConfiguracoes() {
        if (!this.isAdmin()) {
            this.toast('Apenas administradores podem alterar configurações.', 'error');
            return;
        }
        const a1 = {
            nome: document.getElementById('cfg-admin1-name').value.trim(),
            matricula: document.getElementById('cfg-admin1-mat').value.trim()
        };
        const a2 = {
            nome: document.getElementById('cfg-admin2-name').value.trim(),
            matricula: document.getElementById('cfg-admin2-mat').value.trim()
        };
        const novos = [a1, a2].filter(a => a.nome && a.matricula);

        this.setLoading(true);
        try {
            if (supabaseClient) {
                // Limpa admins existentes e insere novos (simples para poucos registros)
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
   IMPORTAÇÃO DE DADOS DA PLANILHA (one-time)
   ============================================================ */
async function importarDadosPlanilha() {
    if (localStorage.getItem('ct_imported_v1')) return;

    const registros = [
        [46175,"08:00","CR DE MARÍLIA - DENTISTA","-","03 PPL","ODONTOLOGIA","SA",""],
        [46175,"08:00","CHSP","1363890","FABIO SOARES","CIRURGIA VASCULAR","FE","MARCIO EDEN"],
        [46175,"07:00","CHSP","1241190-6","JHONATAN MINEO OLIVEIRA","CIRURGIA VASCULAR","SA",""],
        [46175,"07:00","HC I - MÁRIO COVAS","826810-4","ALAN DE JESUS DE ASSIS","ORTOPEDIA INTERNAÇÃO","FE",""],
        [46176,"07:00","HC I - MÁRIO COVAS","1.278.865-9","DORIVAL MARCOS DE JESUS JUNIOR","ORTOPEDIA GESSO","FE",""],
        [46176,"08:00","CR DE MARÍLIA - DENTISTA","-","03 PPL","ODONTOLOGIA","SA",""],
        [46176,"14:00","HOSPITAL MATERNO INFANTIL","1280090","RODRIGO DE OLIVEIRA VARGAS","RAIO X","SA",""],
        [46176,"","","1418182","GUSTAVO GABRIEL ROCHA DA SILVA","","SA",""],
        [46176,"","","1337802","VALDENIR MARQUES SANTANA","","SA",""],
        [46176,"","","351442","DENILSON GONCALVES","","SA",""],
        [46176,"10:00","CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319","179.124-3","GENIVAL APARECIDO DAMASIO","MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)","FE",""],
        [46178,"08:00","HCI MARIO COVAS","104.326-4","LUIZ ROBERTO DUQUE MACIEL","ELETROCARDIOGRAMA E RAIOX TORAX","SA",""],
        [46181,"07:00","CHSP","771500","EDSON DOMINGOS PEREIRA","CIRURGIA GERAL","SA","ARMANDO"],
        [46181,"","","930376","LUIS FERNANDO MOREIRA","PSIQUITRIA","",""],
        [46181,"14:00","HOSPITAL MATERNO INFANTIL","1470653-5","CLEBER DOS SANTOS MARQUES","RAIO X","SA",""],
        [46181,"","","1230874-8","ROBERTO GONCALVES VICENTE","","",""],
        [46181,"","","1155624-8","WALLACE DAVID CIPRIANO RIBEIRO","","",""],
        [46181,"","","605226-0","JAIRO MARTINS DE ARAUJO","","",""],
        [46182,"11:30","HOSPITAL SÃO FRANCISCO","1368180","RICARDO ALVES DE SOUZA","CARDIOLOGIA","CR",""],
        [46184,"07:00","HOSPÍTAL SÃO FRANCISCO","1455980","RODRIGO PIRES FERREIRA","CIRURGIA VASCULAR","SA",""],
        [46184,"07:30","HCI MARIO COVAS","590163","WELINGTON DE BASTIANI PEREIRA","COLANGIORRESSONANCIA","SA",""],
        [46184,"09:00","","590163","","ELETROCARDIOGRAMA","",""],
        [46188,"07:00","CHSP","1062979-8","LUCAS DE ALMEIDA COSTA","INFECTOLOGIA","FE",""],
        [46188,"12:00","HCI MARIO COVAS","104.326-4","LUIZ ROBERTO DUQUE MACIEL","UROLOGIA GERAL","SA",""],
        [46188,"14:00","HCII - MATERNO INFANTIL","1177751-3","WENDEL WILGNER FERREIRA DA SILVA","RAIO X","FE",""],
        [46188,"","","449472-0","PAULO HENRIQUE DE OLIVEIRA","","",""],
        [46191,"07:00","CHSP","1056502-6","ALESSANDRO MATHEUS DOS SANTOS","ORTOPEDIA","FE",""],
        [46191,"12:00","HCI MARIO COVAS","771.500-6","EDSON DOMINGOS PEREIRA","INFECTO GERAL","SA",""],
        [46192,"07:00","HOSPITAL DAS CLÍNICAS DE BOTUCATU","1190864","EVANDRO JOSÉ FERREIRA","LITOTRIPSIA","",""],
        [46192,"07:00","CHSP","382900-9","JOÃO CARLOS GRINITI","ORTOPEDIA","FE",""],
        [46192,"07:00","HCI MARIO COVAS","629896","BRENO PITA DE MAGALHAES","REUMATOLOGIA","SA",""],
        [46195,"07:00","CHSP","419766-1","RODRIGO GOMES DE SOUZA","FISIATRIA","FE",""],
        [46196,"06:30","HCI MARIO COVAS","104.326-4","LUIZ ROBERTO DUQUE MACIEL","UROLOGIA GERAL- CIRURGIA","SA",""],
        [46196,"10:00","CHSP","1368180","RICARDO ALVES DE SOUZA","CONSULTA","CR",""],
        [46198,"09:40","HC I - MÁRIO COVAS","1311793-2","LEONARDO VINICIUS DE FREITAS OLIVEIRA","ECODOPPLERCARDIOGRAMA TRANSTORACICO","FE",""],
        [46199,"06:40","UPA ZONA NORTE","951160","WESLEY ROBERT DOS SANTOS","ORTOPEDIA","SA",""],
        [46204,"07:00","HCI MARIO COVAS","1341929","THIEGO DE SOUSA CORREA","TRAUMA DE FACE","SA",""],
        [46204,"08:00","CR DE MARÍLIA - DENTISTA","1092868","MARCELO JOSE ANIBAL","DENTISTA","SA",""],
        [46204,"","","1193339","JOAO VITOR DOS SANTOS","","",""],
        [46204,"","","1280223","JHONATHAN FRANCISCO","","",""],
        [46204,"10:00","CAPS AD - Rua: Dr.Joaquim Sampaio Vidal - 319","1079076-4","LUAN CARDOSO MARINHO","MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)","FE",""],
        [46205,"07:50","HC I MARIO COVAS","1307539","CARLOS ALBERTO PEREIRA REGINALDO","ELETROCARDIOGRAMA","SA",""],
        [46205,"08:00","CR DE MARÍLIA - DENTISTA","1163963","BRUNO HENRIQUE DIAS","DENTISTA","SA",""],
        [46205,"","","1230874-8","ROBERTO GONCALVES VICENTE","","",""],
        [46205,"","","1373228","JOAO VITOR GONCALVES","","",""],
        [46205,"07:00","CHSP - via CDP Bauru","1056502-6","ALESSANDRO MATHEUS DOS SANTOS","FISIOTERAPIA","FE",""],
        [46206,"07:00","H. SÃO FRANCISCO","771.500-6","EDSON DOMINGOS PEREIRA","INFECTO GERAL","SA",""],
        [46206,"08:00","CR DE MARÍLIA","988163","ALLEF MONTEIRO MATIAS","REMOÇÃO","SA",""],
        [46206,"","","1293802","CAIO EUCLIDES DA SILVA","","",""],
        [46206,"","","809966","LUCAS FERNANDO DA SILVA","","",""],
        [46206,"","","1342415","MURILO APARECIDO LEAL NUNES","","",""],
        [46206,"","","1305834","LEONARDO CAETANO DA SILVA","REMOÇÃO","FE",""],
        [46206,"08:10","HC- IMAGEM","1000177-4","WESLEY HENRIQUE DA SILVA ALVES","ELETROCARDIOGRAMA","FE",""],
        [46206,"08:20","HC- IMAGEM","1311793-2","LEONARDO VINICIUS DE FREITAS OLIVEIRA","ELETROCARDIOGRAMA","FE",""],
        [46206,"14:00","PENITENCIÁRIA 2 DE ÁLVARO DE CARVALHO","1072223","FABRICIO APARECIDO RODRIGUES","REMOÇÃO","FE",""],
        [46206,"","PENITENCIÁRIA 1 DE GÁLIA","977523","ALEX APARECIDO DOS SANTOS","REMOÇÃO","FE",""],
        [46209,"07:00","CHSP - via CDP Bauru","1206647-8","PEDRO VANIN BOVO","CIRURGIA GERAL","FE",""],
        [46210,"07:00","CHSP","1304538","MARCOS VICTOR DA SILVA MAURICIO","DERMATOLOGIA","SA",""],
        [46210,"07:00","CHSP - via CDP Bauru","1365255-7","EVERTON LUIS ROMEIRO VALENTIM","DERMATOLOGIA","FE",""],
        [46210,"08:00","CR DE MARÍLIA - DENTISTA","1280223","JHONATAN LEAL","DENTISTA","SA",""],
        [46210,"","","1193339","JOÃO SILVA","","",""],
        [46211,"08:00","CR DE MARÍLIA - DENTISTA","1318093","DENIS COSTA","DENTISTA","SA",""],
        [46211,"","","752064","JOSÉ PONTES","","",""],
        [46211,"","","600992","EVERTON FRANCISCO","","",""],
        [46216,"11:00","HOSPITAL DE CLÍNICAS DE MARÍLIA","-","-","CIRURGIA GERAL","CR",""],
        [46217,"07:00","CHSP - via CDP Bauru","485077-2","ANDRE CRISTIANO DOS SANTOS","UROLOGIA","FE",""],
        [46217,"08:00","HEMOCENTRO- MARILIA","629896","BRENO PITA DE MAGALHAES","HEMOGRAMA","SA",""],
        [46217,"12:00","HC I - MÁRIO COVAS","1021072","MARCIO ALVES BARBOSA","NEURO VASCULAR","FE",""],
        [46218,"10:00","CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319","179.124-3","GENIVAL APARECIDO DAMASIO","MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)","",""],
        [46219,"07:00","CHSP - via CDP Bauru","1244182-0","PRESLEI PEREIRA","ORTOPEDIA","",""],
        [46219,"07:00","CHSP - via CDP Bauru","1225897","LEONARDO FREIRE FARINELLI","PSIQUIATRIA","",""],
        [46219,"14:00","HOSPITAL DAS CLÍNICAS DE BOTUCATU","1190864","EVANDRO JOSÉ FERREIRA","NEFROLOGIA","SA",""],
        [46220,"08:10","HC- IMAGEM","1143204-4","MOISES CARLOS DE OLIVEIRA BELIZARIO","ELETROCARDIOGRAMA","FE",""],
        [46223,"07:00","HC – UNICAMP","1249521","TIAGO CAIQUE ALMEIDA DE MORAES","ORTOPEDIA","FE",""],
        [46225,"08:10","HC- IMAGEM","1410948","ROGÉRIO ZANATA","ELETROCARDIOGRAMA","FE",""],
        [46226,"07:20","HC- IMAGEM","536017","PEDRO HENRIQUE RAMOS DA SILVA","ELETROCARDIOGRAMA","FE",""],
        [46227,"07:00","HCI MARIO COVAS","629896","BRENO PITA DE MAGALHAES","REUMATOLOGIA","SA",""],
        [46230,"09:00","CENTRO MÉDICO ACONCHEGO - MARÍLIA","536053","ARTHUR FLAVIO PORTONI SOUZA","ULTRASSON PAREDE ABDOMINAL","FE",""],
        [46231,"07:00","IMESC SÃO PAULO","680843-0","FLAVIO GOMES FERREIRA","PERÍCIA","FE",""],
        [46231,"07:00","HCI MARIO COVAS","629896","BRENO PITA DE MAGALHAES","REUMATOLOGIA","SA",""],
        [46231,"14:00","HOSPITAL MATERNO INFANTIL","771.500-6","CLEBER DOS SANTOS MARQUES","RAIO X","SA",""],
        [46231,"14:00","HOSPITAL MATERNO INFANTIL","1230790","CAIO HENRIQUE COELHO RIBEIRO","RAIO X","",""],
        [46231,"14:00","HOSPITAL MATERNO INFANTIL","1481987","JEFFERSON DE SOUZA","RAIO X","",""],
        [46232,"07:00","HCI MARIO COVAS","1341929","THIEGO DE SOUSA CORREA","TRAUMA DE FACE","SA",""],
        [46232,"10:00","CAPS AD - Rua. Dr. Joaquim de Abreu S. Vidal -319","1365255-7","EVERTON LUIS ROMEIRO VALENTIM","MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)","FE",""],
        [46233,"07:00","CHSP - via CDP Bauru","826810","ALAN DE JESUS DE ASSIS","NEUROLOGIA","FE",""],
        [46233,"07:00","HC I MARIO COVAS","245202","ROGERIO MARTINS DE CARVALHO","ORTOPEDIA GESSO + RX","SA",""],
        [46233,"12:00","HC I - MÁRIO COVAS","827877","CASSIO SOUZA SANTOS","CIRURGIA GERAL","FE",""],
        [46233,"13:10","HC I MARIO COVAS","1456981","JOSÉ HORÁCIO DE OLIVEIRA","ELETROCARDIOGRAMA","SA",""],
        [46233,"13:20","HC I MARIO COVAS","218338","REGINALDO CESAR SEVERINO","ELETROCARDIOGRAMA","SA",""],
        [46237,"12:00","HCI - MÁRIO COVAS","1351105","LUCAS RENAM CLAUDINO BETTI","PÓS-CIRURGIA","CR",""],
        [46237,"14:00","HOSPITAL MATERNO INFANTIL","1056268","LUCAS FRANCISCO GODOI DE LIMA","RAIO X","SA",""],
        [46237,"14:00","HOSPITAL MATERNO INFANTIL","943202","DANIEL BARBOSA DA SILVA","RAIO X","SA",""],
        [46237,"14:00","HOSPITAL MATERNO INFANTIL","1106521","RAFAEL TORRES DE SOUZA","RAIO X","SA",""],
        [46239,"12:00","HCI - MÁRIO COVAS","1353312","ALEXANDRE RICARDO DA SILVA PEREIRA","GASTRO CIRURGIA","FE",""],
        [46240,"07:00","HC I - MÁRIO COVAS","1021072","MARCIO ALVES BARBOSA","ORTOPEDIA GESSO","FE",""],
        [46240,"07:00","HC I MARIO COVAS","273101","WELLINGTON ALVES SILVA","ORTOPEDIA GESSO","SA",""],
        [46240,"14:00","HOSPITAL MATERNO INFANTIL","1056268","LUCAS FRANCISCO GODOI DE LIMA","RAIO X","SA",""],
        [46240,"14:00","HOSPITAL MATERNO INFANTIL","943202","DANIEL BARBOSA DA SILVA","RAIO X","SA",""],
        [46240,"14:00","HOSPITAL MATERNO INFANTIL","1106521","RAFAEL TORRES DE SOUZA","RAIO X","SA",""],
        [46240,"14:00","HOSPITAL MATERNO INFANTIL","1455980","RAFAEL TORRES DE SOUZA","RAIO X","SA",""],
        [46241,"07:00","HC III - SÃO FRANCISCO","1095038","MATHEUS MOREIRA DOS SANTOS","OTORRINO","FE",""],
        [46241,"07:00","HC III - SÃO FRANCISCO","536053","ARTHUR FLAVIO PORTONI SOUZA","INFECTOLOGIA","FE",""],
        [46241,"07:00","HC I - MÁRIO COVAS","811668","ALAN SOARES FARIA","ORTOPEDIA GESSO","FE",""],
        [46245,"07:00","HCI MARIO COVAS","629896","BRENO PITA DE MAGALHAES","REUMATOLOGIA","SA",""],
        [46247,"07:00","HC I MARIO COVAS","245202","ROGERIO MARTINS DE CARVALHO","ORTOPEDIA GESSO + RX","SA",""],
        [46247,"12:00","HC III - SÃO FRANCISCO","581859","LUCIANO JUSTINO DE MATOS","INFECTOLOGIA","FE",""],
        [46248,"07:00","HC I - MÁRIO COVAS","1271827","BRUNO BARAUNA SANTOS","ORTOPEDIA GESSO","FE",""],
        [46251,"12:00","HCI MARIO COVAS","1199009-0","WESLEY MATHEUS MOREIRA CORREA","UROLOGIA GERAL","FE",""],
        [46252,"07:00","H. SÃO FRANCISCO","771.500-6","EDSON DOMINGOS PEREIRA","INFECTO GERAL","SA",""],
        [46253,"10:00","CAPS AD - Rua: Dr.Joaquim Sampaio Vidal - 319","1079076-4","LUAN CARDOSO MARINHO","MEDIDA DE SEGURANÇA (TRATAMENTO AMBULATORIAL)","FE",""],
        [46258,"07:00","HOSPITAL ESTADUAL DE BAURU","1314231","ALEX SANDRO ALVES SOARES","BIÓPSIA DE PELE","SA",""],
        [46259,"14:00","HC – RECEPÇÃO ENDOSCOPIA","827877","CASSIO SOUZA SANTOS","EXTRAÇÃO CATETER DUPLO J","FE",""]
    ];

    function excelSerialToDate(serial) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function classifyTipo(local, tipoApres) {
        const localLower = (local || '').toLowerCase();
        const apresLower = (tipoApres || '').toLowerCase();
        const externas = ['hospital','hc ','clínica','clinica','caps','penitenciária','penitenciaria','hemocentro','upa','imesc','centro médico','recepção','mário covas','mario covas','são francisco','sao francisco','botucatu','bauru','marília','marilia'];
        const internas = ['pátio','patio','escola','oficina','capela','biblioteca','alimentação','lixo','transporte de alimentação'];
        for (const kw of internas) { if (localLower.includes(kw) || apresLower.includes(kw)) return 'interna'; }
        for (const kw of externas) { if (localLower.includes(kw)) return 'externa'; }
        return 'externa';
    }

    const imported = [];
    let currentDate = '';
    registros.forEach(row => {
        const [serial, horaRaw, local, matricula, nome, tipoApres, regime, motorista] = row;
        if (serial) currentDate = excelSerialToDate(serial);
        const hora = (horaRaw && typeof horaRaw === 'string') ? horaRaw : '';
        const tipo = classifyTipo(local, tipoApres);
        const isMulti = (matricula === '-' && nome && nome.match(/^\d+\s+PPL/i));
        imported.push({
            id: 'imp_' + Math.random().toString(36).substr(2, 9),
            data: currentDate, hora, tipo, local: local || '-',
            matricula: isMulti ? '-' : (matricula || '-'),
            nome: isMulti ? nome : (nome || '-'),
            tipoApresentacao: tipoApres || '-', regime: regime || '-',
            viatura: '', motorista: motorista || '',
            observacoes: isMulti ? 'Saída em grupo' : '',
            operador: { name: 'Importado Planilha', mat: 'SISTEMA' },
            createdAt: new Date().toISOString()
        });
    });

    // Se tiver Supabase, insere; senão salva no localStorage
    if (supabaseClient) {
        try {
            const { data: existing } = await supabaseClient.from('saidas').select('id').limit(1);
            if (!existing || existing.length === 0) {
                const batch = imported.map(s => App.mapSaidaToDB(s));
                // Insere em lotes de 50 para evitar payloads muito grandes
                for (let i = 0; i < batch.length; i += 50) {
                    await supabaseClient.from('saidas').insert(batch.slice(i, i + 50));
                }
            }
        } catch (e) {
            console.error('Erro ao importar para Supabase:', e);
        }
    }

    const existing = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
    if (existing.length === 0) {
        localStorage.setItem('ct_saidas', JSON.stringify(imported));
    }
    localStorage.setItem('ct_imported_v1', 'true');
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    importarDadosPlanilha().then(() => App.init());
});
