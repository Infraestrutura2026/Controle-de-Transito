/* ============================================
   CONTROLE DE TRÂNSITO - APLICAÇÃO
   ============================================ */

const App = {
    currentOperator: null,
    saidas: [],
    deleteTargetId: null,
    editTargetId: null,
    auditLog: [],

    init() {
        this.loadAdmins();
        this.loadOperator();
        this.loadData();
        this.loadAuditLog();
        this.bindEvents();
        this.setupDefaults();
        if (this.currentOperator) {
            this.showMainScreen();
        } else {
            this.showLoginScreen();
        }
    },

    /* ---------- STORAGE ---------- */
    loadOperator() {
        const saved = localStorage.getItem('ct_operator');
        if (saved) {
            try { this.currentOperator = JSON.parse(saved); } catch (e) {}
        }
    },

    saveOperator() {
        localStorage.setItem('ct_operator', JSON.stringify(this.currentOperator));
    },

    loadData() {
        const saved = localStorage.getItem('ct_saidas');
        if (saved) {
            try { this.saidas = JSON.parse(saved); } catch (e) {}
        }
    },

    saveData() {
        localStorage.setItem('ct_saidas', JSON.stringify(this.saidas));
    },

    loadAuditLog() {
        const saved = localStorage.getItem('ct_audit_log');
        if (saved) {
            try { this.auditLog = JSON.parse(saved); } catch (e) {}
        }
    },

    saveAuditLog() {
        localStorage.setItem('ct_audit_log', JSON.stringify(this.auditLog));
    },

    logAudit(action, saidaId, details) {
        const entry = {
            id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            action,
            saidaId,
            operator: { name: this.currentOperator.name, mat: this.currentOperator.mat },
            details
        };
        this.auditLog.unshift(entry);
        this.saveAuditLog();
    },

    /* ---------- SCREENS ---------- */
    showLoginScreen() {
        document.getElementById('login-screen').classList.add('active');
        document.getElementById('main-screen').classList.remove('active');
    },

    showMainScreen() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        this.updateOperatorDisplay();
        this.renderDashboard();

        // Mostrar/ocultar menus restritos a admins
        const navCfg = document.getElementById('nav-configuracoes');
        if (navCfg) {
            navCfg.style.display = this.isAdmin() ? 'flex' : 'none';
        }
        const navAud = document.getElementById('nav-auditoria');
        if (navAud) {
            navAud.style.display = this.isAdmin() ? 'flex' : 'none';
        }
        this.updateAuditNavBadge();
    },

    updateOperatorDisplay() {
        if (!this.currentOperator) return;
        document.getElementById('display-operator-name').textContent = this.currentOperator.name;
        document.getElementById('display-operator-mat').textContent = `Mat: ${this.currentOperator.mat}`;
        const initials = this.currentOperator.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('operator-avatar').textContent = initials;
    },

    /* ---------- NAVIGATION ---------- */
    navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const page = document.getElementById(`page-${pageId}`);
        const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (page) page.classList.add('active');
        if (nav) nav.classList.add('active');

        if (pageId === 'dashboard') this.renderDashboard();
        if (pageId === 'listar') this.renderSaidas();
        if (pageId === 'relatorio') this.setupRelatorio();
        if (pageId === 'configuracoes') this.setupConfigs();
        if (pageId === 'auditoria') this.renderAuditLog();
    },

    /* ---------- EVENTS ---------- */
    bindEvents() {
        // Login
        document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());
        document.getElementById('operator-name').addEventListener('keypress', e => { if (e.key === 'Enter') this.handleLogin(); });
        document.getElementById('operator-mat').addEventListener('keypress', e => { if (e.key === 'Enter') this.handleLogin(); });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

        // Nav
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
        });

        // Form saída
        document.getElementById('form-saida').addEventListener('submit', e => {
            e.preventDefault();
            this.handleSaveSaida();
        });
        document.getElementById('btn-limpar').addEventListener('click', () => this.clearForm());

        // Filtros
        document.getElementById('btn-aplicar-filtros').addEventListener('click', () => this.renderSaidas());
        document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
            document.getElementById('filter-data-ini').value = '';
            document.getElementById('filter-data-fim').value = '';
            document.getElementById('filter-tipo').value = '';
            document.getElementById('filter-regime').value = '';
            document.getElementById('filter-busca').value = '';
            this.renderSaidas();
        });
        document.getElementById('filter-busca').addEventListener('input', () => this.renderSaidas());

        // Relatório
        document.getElementById('btn-gerar-relatorio').addEventListener('click', () => this.gerarRelatorio());
        document.getElementById('btn-imprimir-relatorio').addEventListener('click', () => window.print());
        document.getElementById('btn-exportar-pdf').addEventListener('click', () => this.exportarRelatorioPDF());

        // Edição modal
        document.getElementById('btn-cancel-edit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('btn-save-edit').addEventListener('click', () => this.saveEditSaida());
        document.getElementById('modal-edit').addEventListener('click', e => {
            if (e.target.id === 'modal-edit') this.closeEditModal();
        });

        // Configurações (admins)
        document.getElementById('btn-salvar-configs')?.addEventListener('click', () => this.saveConfigs());

        // Auditoria (admins)
        document.getElementById('btn-audit-reset')?.addEventListener('click', () => this.resetAuditFilters());
        ['audit-filter-data-inicio','audit-filter-data-fim','audit-filter-operador','audit-filter-acao'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.renderAuditLog());
        });

        // Modal
        document.getElementById('btn-cancel-delete').addEventListener('click', () => this.closeModal());
        document.getElementById('btn-confirm-delete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('modal-confirm').addEventListener('click', e => {
            if (e.target.id === 'modal-confirm') this.closeModal();
        });
    },

    setupDefaults() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('s-data').value = today;
        document.getElementById('rel-data').value = today;
    },

    /* ---------- LOGIN / LOGOUT ---------- */
    loadAdmins() {
        let admins = JSON.parse(localStorage.getItem('ct_admins') || 'null');
        if (!admins) {
            admins = [
                { id: 'admin1', name: 'admin1', mat: '2026' },
                { id: 'admin2', name: 'admin2', mat: '2026' }
            ];
            localStorage.setItem('ct_admins', JSON.stringify(admins));
        }
        this.admins = admins;
    },

    saveAdmins() {
        localStorage.setItem('ct_admins', JSON.stringify(this.admins));
    },

    isAdmin() {
        if (!this.currentOperator) return false;
        return this.admins.some(a => a.mat === this.currentOperator.mat);
    },

    getVisibleSaidas() {
        if (this.isAdmin()) return [...this.saidas];
        if (!this.currentOperator) return [];
        return this.saidas.filter(s =>
            s.operador &&
            s.operador.name === this.currentOperator.name &&
            s.operador.mat === this.currentOperator.mat
        );
    },

    canManageSaida(s) {
        if (this.isAdmin()) return true;
        if (!s.operador || !this.currentOperator) return false;
        return s.operador.name === this.currentOperator.name && s.operador.mat === this.currentOperator.mat;
    },

    handleLogin() {
        const name = document.getElementById('operator-name').value.trim();
        const mat = document.getElementById('operator-mat').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!name || !mat) {
            errorEl.textContent = 'Preencha nome e matrícula para continuar.';
            return;
        }

        this.currentOperator = { name, mat, loginAt: new Date().toISOString() };

        const adminIdx = this.admins.findIndex(a => a.mat === mat);
        if (adminIdx !== -1) {
            this.admins[adminIdx].name = name;
            this.saveAdmins();
        }

        this.saveOperator();
        errorEl.textContent = '';
        this.showMainScreen();
        this.toast(`Bem-vindo, ${name}!`, 'success');
    },

    handleLogout() {
        this.currentOperator = null;
        localStorage.removeItem('ct_operator');
        document.getElementById('operator-name').value = '';
        document.getElementById('operator-mat').value = '';
        document.getElementById('login-error').textContent = '';
        this.showLoginScreen();
    },

    /* ---------- SAÍDAS CRUD ---------- */
    handleSaveSaida() {
        if (!this.currentOperator) return;

        const saida = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            data: document.getElementById('s-data').value,
            hora: document.getElementById('s-hora').value,
            tipo: document.getElementById('s-tipo').value,
            local: document.getElementById('s-local').value.trim(),
            matricula: document.getElementById('s-matricula').value.trim(),
            nome: document.getElementById('s-nome').value.trim(),
            tipoApresentacao: document.getElementById('s-tipo-apresentacao').value.trim(),
            regime: document.getElementById('s-regime').value,
            viatura: document.getElementById('s-viatura').value.trim(),
            motorista: document.getElementById('s-motorista').value.trim(),
            observacoes: document.getElementById('s-obs').value.trim(),
            operador: {
                name: this.currentOperator.name,
                mat: this.currentOperator.mat
            },
            createdAt: new Date().toISOString()
        };

        this.saidas.push(saida);
        this.saveData();
        this.clearForm();
        this.toast('Saída cadastrada com sucesso!', 'success');
    },

    clearForm() {
        document.getElementById('form-saida').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('s-data').value = today;
        document.getElementById('s-hora').value = '';
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
            `${s.nome} — ${this.fmtDate(s.data)} às ${s.hora} — ${s.local}`;
        document.getElementById('modal-confirm').classList.add('active');
    },

    confirmDelete() {
        if (!this.deleteTargetId) return;
        const deleted = this.saidas.find(s => s.id === this.deleteTargetId);
        if (deleted) {
            this.logAudit('DELETE', this.deleteTargetId, {
                nome: deleted.nome,
                matricula: deleted.matricula,
                data: deleted.data,
                hora: deleted.hora,
                local: deleted.local
            });
        }
        this.saidas = this.saidas.filter(s => s.id !== this.deleteTargetId);
        this.saveData();
        this.deleteTargetId = null;
        this.closeModal();
        this.renderSaidas();
        this.toast('Saída excluída.', 'info');
    },

    closeModal() {
        document.getElementById('modal-confirm').classList.remove('active');
        this.deleteTargetId = null;
    },

    /* ---------- DASHBOARD ---------- */
    renderDashboard() {
        const visible = this.getVisibleSaidas();
        const today = new Date().toISOString().split('T')[0];
        const hoje = visible.filter(s => s.data === today);
        const externas = visible.filter(s => s.tipo === 'externa');
        const internas = visible.filter(s => s.tipo === 'interna');

        document.getElementById('kpi-total').textContent = visible.length;
        document.getElementById('kpi-hoje').textContent = hoje.length;
        document.getElementById('kpi-externas').textContent = externas.length;
        document.getElementById('kpi-internas').textContent = internas.length;

        // Próximas saídas
        const proximas = [...hoje]
            .sort((a, b) => a.hora.localeCompare(b.hora))
            .slice(0, 6);
        const proxEl = document.getElementById('proximas-saidas');
        if (proximas.length === 0) {
            proxEl.innerHTML = '<p class="empty-state">Nenhuma saída registrada para hoje.</p>';
        } else {
            proxEl.innerHTML = proximas.map(s => `
                <div class="proxima-saida-item">
                    <div class="proxima-info">
                        <span class="proxima-hora">${s.hora}</span>
                        <span class="proxima-local">${s.local} — ${s.tipoApresentacao}</span>
                    </div>
                    <span class="proxima-tipo badge-${s.tipo === 'externa' ? 'externa' : 'interna'}">${s.tipo === 'externa' ? 'Externa' : 'Interna'}</span>
                </div>
            `).join('');
        }

        // Locais mais frequentes
        const locaisCount = {};
        visible.forEach(s => { locaisCount[s.local] = (locaisCount[s.local] || 0) + 1; });
        const topLocais = Object.entries(locaisCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const locEl = document.getElementById('locais-frequentes');
        if (topLocais.length === 0) {
            locEl.innerHTML = '<p class="empty-state">Sem dados suficientes.</p>';
        } else {
            const max = topLocais[0][1];
            locEl.innerHTML = topLocais.map(([local, count]) => `
                <div class="local-freq-item">
                    <div class="local-freq-bar">
                        <span style="font-size:13px; color:var(--text-primary); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${local}</span>
                        <div class="local-freq-track">
                            <div class="local-freq-fill" style="width:${(count/max*100).toFixed(0)}%"></div>
                        </div>
                    </div>
                    <span class="local-freq-count">${count}</span>
                </div>
            `).join('');
        }
    },

    /* ---------- LISTAR SAÍDAS ---------- */
    setupConfigs() {
        const a1 = this.admins.find(a => a.id === 'admin1');
        const a2 = this.admins.find(a => a.id === 'admin2');
        document.getElementById('cfg-admin1-name').value = a1?.name || '';
        document.getElementById('cfg-admin1-mat').value = a1?.mat || '2026';
        document.getElementById('cfg-admin2-name').value = a2?.name || '';
        document.getElementById('cfg-admin2-mat').value = a2?.mat || '2026';
    },

    saveConfigs() {
        const n1 = document.getElementById('cfg-admin1-name').value.trim();
        const m1 = document.getElementById('cfg-admin1-mat').value.trim();
        const n2 = document.getElementById('cfg-admin2-name').value.trim();
        const m2 = document.getElementById('cfg-admin2-mat').value.trim();
        if (!n1 || !m1 || !n2 || !m2) {
            this.toast('Preencha todos os campos dos administradores.', 'error');
            return;
        }
        this.admins = [
            { id: 'admin1', name: n1, mat: m1 },
            { id: 'admin2', name: n2, mat: m2 }
        ];
        this.saveAdmins();
        this.toast('Configurações salvas com sucesso!', 'success');
    },

    renderSaidas() {
        const ini = document.getElementById('filter-data-ini').value;
        const fim = document.getElementById('filter-data-fim').value;
        const tipo = document.getElementById('filter-tipo').value;
        const regime = document.getElementById('filter-regime').value;
        const busca = document.getElementById('filter-busca').value.trim().toLowerCase();

        let filtered = this.getVisibleSaidas();

        if (ini) filtered = filtered.filter(s => s.data >= ini);
        if (fim) filtered = filtered.filter(s => s.data <= fim);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        if (regime) filtered = filtered.filter(s => s.regime === regime);
        if (busca) {
            filtered = filtered.filter(s =>
                (s.nome && s.nome.toLowerCase().includes(busca)) ||
                (s.matricula && s.matricula.toLowerCase().includes(busca)) ||
                (s.local && s.local.toLowerCase().includes(busca)) ||
                (s.tipoApresentacao && s.tipoApresentacao.toLowerCase().includes(busca))
            );
        }

        filtered.sort((a, b) => {
            const cmp = b.data.localeCompare(a.data);
            return cmp !== 0 ? cmp : a.hora.localeCompare(b.hora);
        });

        const tbody = document.getElementById('tbody-saidas');
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="13" class="empty-cell">Nenhuma saída encontrada com os filtros selecionados.</td></tr>`;
            return;
        }

        const isAdmin = this.isAdmin();
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

    /* ---------- RELATÓRIO DIÁRIO ---------- */
    setupRelatorio() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('rel-data').value = today;
        this.gerarRelatorio();
    },

    gerarRelatorio() {
        const data = document.getElementById('rel-data').value;
        const tipo = document.getElementById('rel-tipo').value;

        if (!data) {
            this.toast('Selecione uma data para o relatório.', 'error');
            return;
        }

        let filtered = this.getVisibleSaidas().filter(s => s.data === data);
        if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
        filtered.sort((a, b) => a.hora.localeCompare(b.hora));

        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;

        document.getElementById('relatorio-data-display').textContent = this.fmtDateLong(data);
        document.getElementById('rel-total').textContent = total;
        document.getElementById('rel-ext').textContent = ext;
        document.getElementById('rel-int').textContent = int;

        const tbody = document.getElementById('tbody-relatorio');
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr class="empty-row"><td colspan="9" class="empty-cell">Nenhuma saída registrada nesta data.</td></tr>`;
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
        if (!data) {
            this.toast('Selecione uma data para exportar o relatório.', 'error');
            return;
        }
        let filtered = this._lastRelatorioFiltered;
        if (!filtered) {
            filtered = this.getVisibleSaidas().filter(s => s.data === data);
            const tipo = document.getElementById('rel-tipo').value;
            if (tipo) filtered = filtered.filter(s => s.tipo === tipo);
            filtered.sort((a, b) => a.hora.localeCompare(b.hora));
        }
        if (!filtered || filtered.length === 0) {
            this.toast('Nenhum dado para exportar na data selecionada.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        const dataLabel = this.fmtDateLong(data);
        const total = filtered.length;
        const ext = filtered.filter(s => s.tipo === 'externa').length;
        const int = filtered.filter(s => s.tipo === 'interna').length;

        const now = new Date();
        const nowStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        // Logo
        try {
            const imgData = await this.getBase64Image('https://cdn.oreateai.com/aiimage/upload/4c1f470aee0a21081f4ae334/de4167a81238fa7eca78a6d1ad7f5b1a.jpg');
            doc.addImage(imgData, 'JPEG', 14, 6, 22, 22);
        } catch (e) {
            // logo não carregado, segue sem
        }

        doc.setFontSize(14);
        doc.text('COMPLEXO PENAL DE MARÍLIA', 40, 13);
        doc.setFontSize(16);
        doc.text('RELATÓRIO DIÁRIO DE SAÍDAS', 40, 19);
        doc.setFontSize(11);
        doc.text(dataLabel, 40, 25);
        doc.setFontSize(9);
        doc.text(`Total: ${total} | Externas: ${ext} | Internas: ${int} | Impresso em: ${nowStr}`, 40, 30);

        const bodyRows = filtered.map((s, idx) => [
            idx + 1,
            s.hora || '-',
            s.local || '-',
            '1',
            s.tipoApresentacao || '-',
            s.regime || '-',
            s.tipo === 'externa' ? 'Externa' : 'Interna',
            s.viatura || '-',
            s.motorista || '-'
        ]);

        doc.autoTable({
            startY: 36,
            head: [['#', 'Horário', 'Local', 'Qtd', 'Tipo Apresentação', 'Regime', 'Tipo Saída', 'Viatura', 'Motorista']],
            body: bodyRows,
            theme: 'grid',
            headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: 15 },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 10 },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 12 },
                6: { cellWidth: 18 },
                7: { cellWidth: 20 },
                8: { cellWidth: 25 }
            }
        });

        const safeDate = data.replace(/-/g, '');
        doc.save(`Relatorio_Diario_${safeDate}.pdf`);
        this.toast('PDF exportado com sucesso!', 'success');
    },

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

    saveEditSaida() {
        if (!this.editTargetId) return;
        const idx = this.saidas.findIndex(s => s.id === this.editTargetId);
        if (idx === -1) return;

        const oldValues = { ...this.saidas[idx] };
        delete oldValues.editedAt;
        delete oldValues.editedBy;

        this.saidas[idx] = {
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

        this.logAudit('EDIT', this.editTargetId, {
            oldValues,
            newValues: {
                data: this.saidas[idx].data,
                hora: this.saidas[idx].hora,
                tipo: this.saidas[idx].tipo,
                regime: this.saidas[idx].regime,
                local: this.saidas[idx].local,
                matricula: this.saidas[idx].matricula,
                nome: this.saidas[idx].nome,
                tipoApresentacao: this.saidas[idx].tipoApresentacao,
                viatura: this.saidas[idx].viatura,
                motorista: this.saidas[idx].motorista,
                observacoes: this.saidas[idx].observacoes
            }
        });

        this.saveData();
        this.closeEditModal();
        this.renderSaidas();
        this.renderDashboard();
        this.updateAuditNavBadge();
        this.toast('Saída atualizada com sucesso!', 'success');
    },

    closeEditModal() {
        document.getElementById('modal-edit').classList.remove('active');
        this.editTargetId = null;
    },

    /* ---------- AUDITORIA ---------- */
    fmtDateTime(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
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
        if (filtros.operador) {
            logs = logs.filter(l => (l.operador || '').toLowerCase().includes(filtros.operador));
        }
        if (filtros.acao) {
            logs = logs.filter(l => l.acao === filtros.acao);
        }

        tbody.innerHTML = '';
        if (!logs.length) {
            emptyState.style.display = 'block';
            return;
        }
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
                if (o.direcao !== n.direcao) changes.push(`Direção: ${o.direcao || '-'} → ${n.direcao || '-'}`);
                if (o.tipo !== n.tipo) changes.push(`Tipo: ${o.tipo || '-'} → ${n.tipo || '-'}`);
                if (o.descricao !== n.descricao) changes.push(`Descrição alterada`);
                if (o.acessorios !== n.acessorios) changes.push(`Acessórios alterados`);
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
        const diffHours = (now - edited) / (1000 * 60 * 60);
        return diffHours <= 24;
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

    toast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-message');

        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        icon.textContent = icons[type] || icons.info;
        msg.textContent = message;

        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

/* ============================================
   IMPORTAÇÃO DE DADOS DA PLANILHA
   (executado uma vez se houver dados no local)
   ============================================ */
function importarDadosPlanilha() {
    // Verifica se já importou
    if (localStorage.getItem('ct_imported_v1')) return;

    // Dados extraídos da planilha Controle_Trânsito_Semanal.xlsx
    // Colunas: Data (serial Excel), Hora, Local, Matrícula, Nome, TipoApresentação, Regime, Motorista
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

    // Converte número serial Excel para data ISO
    function excelSerialToDate(serial) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // Heurística para classificar interna vs externa
    function classifyTipo(local, tipoApres) {
        const localLower = (local || '').toLowerCase();
        const apresLower = (tipoApres || '').toLowerCase();
        const externas = ['hospital','hc ','clínica','clinica','caps','penitenciária','penitenciaria','hemocentro','upa','imesc','centro médico','recepção','mário covas','mario covas','são francisco','sao francisco','botucatu','bauru','marília','marilia'];
        const internas = ['pátio','patio','escola','oficina','capela','biblioteca','alimentação','lixo','transporte de alimentação'];
        for (const kw of internas) {
            if (localLower.includes(kw) || apresLower.includes(kw)) return 'interna';
        }
        for (const kw of externas) {
            if (localLower.includes(kw)) return 'externa';
        }
        return 'externa';
    }

    const imported = [];
    let currentDate = '';
    registros.forEach(row => {
        const [serial, horaRaw, local, matricula, nome, tipoApres, regime, motorista] = row;
        if (serial) {
            currentDate = excelSerialToDate(serial);
        }
        const hora = (horaRaw && typeof horaRaw === 'string') ? horaRaw : '';
        const tipo = classifyTipo(local, tipoApres);
        const isMulti = (matricula === '-' && nome && nome.match(/^\d+\s+PPL/i));

        imported.push({
            id: 'imp_' + Math.random().toString(36).substr(2, 9),
            data: currentDate,
            hora: hora,
            tipo: tipo,
            local: local || '-',
            matricula: isMulti ? '-' : (matricula || '-'),
            nome: isMulti ? nome : (nome || '-'),
            tipoApresentacao: tipoApres || '-',
            regime: regime || '-',
            viatura: '',
            motorista: motorista || '',
            observacoes: isMulti ? 'Saída em grupo' : '',
            operador: { name: 'Importado Planilha', mat: 'SISTEMA' },
            createdAt: new Date().toISOString()
        });
    });

    const existing = JSON.parse(localStorage.getItem('ct_saidas') || '[]');
    if (existing.length === 0) {
        localStorage.setItem('ct_saidas', JSON.stringify(imported));
    }
    localStorage.setItem('ct_imported_v1', 'true');
}

/* ============================================
   INICIALIZAÇÃO
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    importarDadosPlanilha();
    App.init();
});
