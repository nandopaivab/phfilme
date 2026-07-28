// PHFILME Administrative Panel Logic
// Integrates Authentication (Firebase Auth / LocalStorage Mock) and CRUD operations.

import { auth, isDemoMode, firebaseConfig, app } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    getAgenda, updateAgenda, getPlans, updatePlan, 
    getPortfolio, savePortfolioFilm, deletePortfolioFilm, 
    getLeads, updateLeadStatus, updateGeneralSettings,
    getUsers, saveUser, deleteUser,
    getVimeoSettings, saveVimeoSettings
} from './data-store.js';
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { doc, getDoc, query, where, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from './firebase-config.js';

// Global State
let currentAdminUser = null;
let currentTab = 'leads';
let localLeads = [];
let localPortfolio = [];
let localPlans = [];
let localTeam = [];

// Configuration: set to true to upload files to your own server using upload.php, false to use Firebase Storage
const USE_PHP_UPLOAD = true;

// DOM Ready Hook
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
    setupForms();
});

// =========================================================================
// 1. AUTHENTICATION CONTROLLER (HYBRID)
// =========================================================================
function setupAuthListener() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const demoBadge = document.getElementById('demo-mode-badge');

    if (isDemoMode) {
        demoBadge.classList.remove('hidden');
        // Check mock session
        const isLogged = sessionStorage.getItem('phfilme_admin_logged');
        if (isLogged === 'true') {
            currentAdminUser = { email: 'admin@phfilme.com' };
            showDashboard();
        } else {
            showLogin();
        }
    } else {
        // Firebase native auth listener
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Whitelist the developer/owner emails to bypass Firestore rules check during setup
                if (user.email === 'nandopaiva@gmail.com' || user.email === 'ph@phfilme.com.br') {
                    currentAdminUser = user;
                    document.getElementById('user-email-display').textContent = user.email;
                    showDashboard();
                    return;
                }

                try {
                    const q = query(collection(db, 'users'), where('email', '==', user.email));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        currentAdminUser = user;
                        document.getElementById('user-email-display').textContent = user.email;
                        showDashboard();
                    } else {
                        alert("Seu usuário não possui permissão de acesso ao painel.");
                        await firebaseSignOut(auth);
                        currentAdminUser = null;
                        showLogin();
                    }
                } catch (err) {
                    console.error("Error verifying admin role:", err);
                    alert("Erro ao verificar permissão do usuário: " + err.message);
                    await firebaseSignOut(auth);
                    currentAdminUser = null;
                    showLogin();
                }
            } else {
                currentAdminUser = null;
                showLogin();
            }
        });
    }

    // Login Form Submit handler
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Entrando...';

        if (isDemoMode) {
            // Mock auth credentials
            const usersList = JSON.parse(localStorage.getItem('phfilme_users')) || [
                { id: "demo_admin", email: "admin@phfilme.com", role: "admin" }
            ];
            const found = usersList.find(u => u.email === email);
            if (found && password === 'admin123') {
                sessionStorage.setItem('phfilme_admin_logged', 'true');
                currentAdminUser = { email };
                showDashboard();
            } else {
                alert('Credenciais inválidas no modo de demonstração. Use o e-mail de um administrador e a senha admin123.');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Acessar Painel';
        } else {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                console.error("Authentication error:", error);
                alert("Falha no login: " + (error.message || error));
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Acessar Painel';
            }
        }
    };

    // Logout Action
    logoutBtn.onclick = async () => {
        if (isDemoMode) {
            sessionStorage.removeItem('phfilme_admin_logged');
            currentAdminUser = null;
            showLogin();
        } else {
            try {
                await firebaseSignOut(auth);
            } catch (error) {
                console.error("Sign out error:", error);
            }
        }
    };
}

function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('header-user-info').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    document.getElementById('header-user-info').classList.remove('hidden');
    
    // Set user display
    if (currentAdminUser) {
        document.getElementById('user-email-display').textContent = currentAdminUser.email;
    }

    // Load active tab data
    switchTab(currentTab);
}

// =========================================================================
// 2. TAB CONTROL SYSTEM
// =========================================================================
window.switchTab = async (tabName) => {
    currentTab = tabName;
    
    // Update active tab button classes
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Hide all panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.add('hidden');
    });
    // Show active pane
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    // Load dynamic data for specific tabs
    if (tabName === 'leads') {
        await loadLeadsTab();
    } else if (tabName === 'portfolio') {
        await loadPortfolioTab();
    } else if (tabName === 'vimeo') {
        await loadVimeoTab();
    } else if (tabName === 'plans') {
        await loadPlansTab();
    } else if (tabName === 'agenda') {
        await loadAgendaTab();
    } else if (tabName === 'settings') {
        await loadSettingsTab();
    } else if (tabName === 'users') {
        await loadUsersTab();
    }
};

// =========================================================================
// 3. LEADS MANAGEMENT MODULE
// =========================================================================
async function loadLeadsTab() {
    const tableBody = document.getElementById('leads-table-body');
    const badgeCount = document.getElementById('leads-count-badge');
    
    tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-fine-muted font-light"><i class="fa-solid fa-spinner animate-spin text-gold mr-1"></i> Carregando propostas...</td></tr>`;

    try {
        localLeads = await getLeads();
        
        // Count new leads
        const newCount = localLeads.filter(l => l.status === 'new').length;
        badgeCount.textContent = newCount;
        if (newCount > 0) {
            badgeCount.classList.remove('bg-gold/10', 'text-fine-muted');
            badgeCount.classList.add('bg-gold/20', 'text-gold');
        } else {
            badgeCount.classList.remove('bg-gold/20', 'text-gold');
            badgeCount.classList.add('bg-gold/10', 'text-fine-muted');
        }

        if (localLeads.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-fine-muted font-light">Nenhuma proposta cadastrada no momento.</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';
        localLeads.forEach(lead => {
            const formattedDate = new Date(lead.timestamp).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });

            // Map Status Color
            let statusBadge = '';
            if (lead.status === 'new') {
                statusBadge = `<span class="bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-full text-[9px] font-semibold animate-pulse">Novo</span>`;
            } else if (lead.status === 'contacted') {
                statusBadge = `<span class="bg-gray-500/10 text-gray-400 border border-gray-500/25 px-2 py-0.5 rounded-full text-[9px]">Contatado</span>`;
            } else if (lead.status === 'booked') {
                statusBadge = `<span class="bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/25 px-2 py-0.5 rounded-full text-[9px] font-semibold">Fechado</span>`;
            } else {
                statusBadge = `<span class="bg-fine-border text-fine-muted px-2 py-0.5 rounded-full text-[9px]">Arquivado</span>`;
            }

            const tr = document.createElement('tr');
            tr.className = "hover:bg-fine-surface/30 transition-colors duration-150";
            tr.innerHTML = `
                <td class="p-4 text-fine-muted text-[11px] font-mono">${formattedDate}</td>
                <td class="p-4">
                    <span class="font-semibold text-fine-text block">${lead.name}</span>
                    <span class="text-fine-muted text-[10px] block font-light">${lead.email}</span>
                </td>
                <td class="p-4 font-mono font-medium">${lead.date}</td>
                <td class="p-4 text-fine-muted font-light max-w-[120px] truncate" title="${lead.location}">${lead.location}</td>
                <td class="p-4 uppercase font-semibold text-[10px] text-gold/80">${lead.plan}</td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-right space-x-1 whitespace-nowrap">
                    <button onclick="viewLeadDetail('${lead.id}')" class="bg-brand-green/30 hover:bg-brand-green border border-brand-greenLight/60 text-fine-text px-2.5 py-1 rounded-full text-[10px] tracking-wide transition duration-200">
                        Detalhes
                    </button>
                    <select onchange="changeLeadStatus('${lead.id}', this.value)" class="bg-fine-surface border border-fine-border text-fine-text px-2 py-1 rounded-full text-[10px] cursor-pointer focus:outline-none hover:border-gold transition-colors duration-200">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Novo</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contatado</option>
                        <option value="booked" ${lead.status === 'booked' ? 'selected' : ''}>Fechado</option>
                        <option value="archived" ${lead.status === 'archived' ? 'selected' : ''}>Arquivar</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-400 font-light">Erro ao buscar leads. Tente atualizar a página.</td></tr>`;
    }
}

window.viewLeadDetail = (leadId) => {
    const lead = localLeads.find(l => l.id === leadId);
    if (!lead) return;

    const modal = document.getElementById('lead-modal');
    const content = document.getElementById('lead-modal-content');

    const formattedDate = new Date(lead.timestamp).toLocaleString('pt-BR');

    // Create WhatsApp quick action template text
    const planNames = { ouro: "Coleção Ouro", diamante: "Coleção Diamante", platinum: "Coleção Platinum" };
    const textWA = `Olá ${lead.name}, aqui é o Philipe da PHFILME! Recebemos sua proposta pelo site para o casamento em ${lead.date} no local ${lead.location} (${lead.venue}). Vamos conversar?`;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 border-b border-fine-border/50 pb-3">
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Nome do Casal</span>
                    <strong class="text-sm text-fine-text font-serif">${lead.name}</strong>
                </div>
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">E-mail de Contato</span>
                    <a href="mailto:${lead.email}" class="text-gold underline hover:text-white">${lead.email}</a>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 border-b border-fine-border/50 pb-3">
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Data Casamento</span>
                    <span class="font-mono text-fine-text font-semibold">${lead.date}</span>
                </div>
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Cidade / UF</span>
                    <span class="text-fine-text font-medium">${lead.location}</span>
                </div>
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Estilo Evento</span>
                    <span class="text-fine-text font-medium">${lead.style}</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 border-b border-fine-border/50 pb-3">
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Espaço / Instagram</span>
                    <span class="text-fine-text font-semibold">${lead.venue}</span>
                </div>
                <div>
                    <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-0.5">Coleção de Interesse</span>
                    <span class="text-gold uppercase font-bold tracking-widest">${planNames[lead.plan] || lead.plan}</span>
                </div>
            </div>

            <div>
                <span class="text-fine-muted block text-[9px] uppercase tracking-widest font-semibold mb-1">Planos & Detalhes Adicionais</span>
                <p class="bg-fine-bg border border-fine-border p-3.5 rounded-xl text-fine-muted text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">${lead.message}</p>
            </div>

            <div class="bg-brand-greenDark/40 p-4 rounded-2xl border border-brand-green/20 flex flex-col gap-2 mt-2">
                <span class="text-[9px] uppercase tracking-widest text-gold font-bold"><i class="fa-solid fa-bolt"></i> Ação Rápida WhatsApp</span>
                <p class="text-[10px] text-fine-muted">Abra a conversa e envie uma mensagem direta de atendimento preenchida com os dados da noiva.</p>
                <a href="https://wa.me/5511919432604?text=${encodeURIComponent(textWA)}" target="_blank" class="w-full text-center py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-full font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 mt-1">
                    <i class="fa-brands fa-whatsapp text-sm"></i> Chamar Casal no WhatsApp
                </a>
            </div>
            
            <p class="text-[9px] text-fine-muted/40 font-mono text-right">Cadastrado em: ${formattedDate}</p>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.closeLeadModal = () => {
    document.getElementById('lead-modal').classList.add('hidden');
};

window.changeLeadStatus = async (leadId, newStatus) => {
    try {
        await updateLeadStatus(leadId, newStatus);
        await loadLeadsTab();
    } catch (e) {
        console.error("Failed to update status:", e);
        alert("Erro ao alterar o status do lead: " + (e.message || e));
    }
};

// =========================================================================
// 4. PORTFOLIO MANAGER MODULE (CRUD)
// =========================================================================
async function loadPortfolioTab() {
    const listContainer = document.getElementById('admin-portfolio-list');
    listContainer.innerHTML = `<div class="col-span-full text-center py-8 text-fine-muted font-light"><i class="fa-solid fa-spinner animate-spin text-gold mr-1"></i> Carregando portfólio...</div>`;

    try {
        localPortfolio = await getPortfolio();
        if (localPortfolio.length === 0) {
            listContainer.innerHTML = `<div class="col-span-full text-center py-8 text-fine-muted font-light">Nenhum filme cadastrado no portfólio.</div>`;
            return;
        }

        listContainer.innerHTML = '';
        localPortfolio.forEach(film => {
            const card = document.createElement('div');
            card.className = "bg-fine-bg border border-fine-border rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gold/30 transition duration-300";
            card.innerHTML = `
                <div class="relative aspect-video bg-black/40 overflow-hidden">
                    <img src="${film.coverUrl}" onerror="this.src='https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=480';" class="w-full h-full object-cover opacity-80" alt="${film.title_pt}">
                    <span class="absolute top-3 left-3 bg-gold/15 text-gold text-[9px] font-bold px-2 py-0.5 rounded border border-gold/30">Ordem: ${film.order || 0}</span>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between gap-4">
                    <div>
                        <span class="text-[9px] uppercase tracking-widest text-gold font-semibold">${film.badge_pt || 'Local'}</span>
                        <h4 class="font-serif text-lg text-fine-text font-normal mt-1 leading-snug">${film.title_pt}</h4>
                        <p class="text-fine-muted text-[11px] line-clamp-2 mt-2 leading-relaxed font-light">${film.desc_pt || ''}</p>
                    </div>
                    <div class="flex gap-2 justify-end border-t border-fine-border/50 pt-4 text-[10px] font-semibold uppercase tracking-wider">
                        <button onclick="deleteFilm('${film.id}')" class="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 hover:border-red-500/50 rounded-full transition">
                            <i class="fa-solid fa-trash-can mr-1"></i> Excluir
                        </button>
                        <button onclick="openPortfolioForm('${film.id}')" class="px-3.5 py-1.5 bg-brand-green/30 hover:bg-brand-green border border-brand-greenLight/60 text-fine-text rounded-full transition">
                            <i class="fa-solid fa-pen-to-square mr-1"></i> Editar
                        </button>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = `<div class="col-span-full text-center py-8 text-red-400 font-light">Erro ao carregar portfólio.</div>`;
    }
}

window.openPortfolioForm = (filmId = '') => {
    const modal = document.getElementById('portfolio-modal');
    const form = document.getElementById('portfolio-form');
    const modalTitle = document.getElementById('portfolio-modal-title');
    form.reset();

    if (filmId) {
        // Mode: Edit
        modalTitle.textContent = "Editar Filme do Portfólio";
        const film = localPortfolio.find(f => f.id === filmId);
        if (!film) return;

        document.getElementById('port-id').value = film.id;
        document.getElementById('port-video').value = film.videoUrl || '';
        document.getElementById('port-cover').value = film.coverUrl || '';
        document.getElementById('port-order').value = film.order || 1;

        // Languages
        document.getElementById('port-title-pt').value = film.title_pt || '';
        document.getElementById('port-badge-pt').value = film.badge_pt || '';
        document.getElementById('port-desc-pt').value = film.desc_pt || '';

        document.getElementById('port-title-en').value = film.title_en || '';
        document.getElementById('port-badge-en').value = film.badge_en || '';
        document.getElementById('port-desc-en').value = film.desc_en || '';

        document.getElementById('port-title-es').value = film.title_es || '';
        document.getElementById('port-badge-es').value = film.badge_es || '';
        document.getElementById('port-desc-es').value = film.desc_es || '';

        document.getElementById('port-title-it').value = film.title_it || '';
        document.getElementById('port-badge-it').value = film.badge_it || '';
        document.getElementById('port-desc-it').value = film.desc_it || '';
    } else {
        // Mode: Create
        modalTitle.textContent = "Novo Filme do Portfólio";
        document.getElementById('port-id').value = '';
        // Pre-fill next order index
        const nextOrder = localPortfolio.length > 0 ? Math.max(...localPortfolio.map(f => f.order || 0)) + 1 : 1;
        document.getElementById('port-order').value = nextOrder;
    }

    modal.classList.remove('hidden');
};

window.closePortfolioModal = () => {
    document.getElementById('portfolio-modal').classList.add('hidden');
};

window.deleteFilm = async (filmId) => {
    if (confirm('Tem certeza absoluta que deseja excluir este filme do portfólio?')) {
        try {
            await deletePortfolioFilm(filmId);
            await loadPortfolioTab();
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir o filme: " + (e.message || e));
        }
    }
};

// Handle portfolio form submission
function setupForms() {
    const portForm = document.getElementById('portfolio-form');
    const agendaForm = document.getElementById('agenda-form');

    // 1. Portfolio Form Submit
    portForm.onsubmit = async (e) => {
        e.preventDefault();
        
        let filmId = document.getElementById('port-id').value;
        if (!filmId) {
            // Generate simple custom ID slug if creating new
            const titlePT = document.getElementById('port-title-pt').value;
            filmId = 'film_' + titlePT.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') + '_' + Math.random().toString(36).substr(2, 4);
        }

        // Collect fields
        const order = parseInt(document.getElementById('port-order').value);
        const videoUrl = document.getElementById('port-video').value;
        const coverUrl = document.getElementById('port-cover').value;

        // Languages
        const title_pt = document.getElementById('port-title-pt').value;
        const badge_pt = document.getElementById('port-badge-pt').value;
        const desc_pt = document.getElementById('port-desc-pt').value;

        const film = {
            id: filmId,
            order,
            videoUrl,
            coverUrl,
            title_pt,
            badge_pt,
            desc_pt,
            // EN (falls back to PT if empty)
            title_en: document.getElementById('port-title-en').value || title_pt,
            badge_en: document.getElementById('port-badge-en').value || badge_pt,
            desc_en: document.getElementById('port-desc-en').value || desc_pt,
            // ES (falls back to PT)
            title_es: document.getElementById('port-title-es').value || title_pt,
            badge_es: document.getElementById('port-badge-es').value || badge_pt,
            desc_es: document.getElementById('port-desc-es').value || desc_pt,
            // IT (falls back to PT)
            title_it: document.getElementById('port-title-it').value || title_pt,
            badge_it: document.getElementById('port-badge-it').value || badge_pt,
            desc_it: document.getElementById('port-desc-it').value || desc_pt
        };

        try {
            await savePortfolioFilm(film);
            closePortfolioModal();
            await loadPortfolioTab();
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar o filme no banco de dados: " + (err.message || err));
        }
    };

    // 2. Agenda sliders UI bindings & form submission
    const slider2026 = document.getElementById('input-agenda-2026');
    const label2026 = document.getElementById('agenda-2026-val');
    slider2026.oninput = () => label2026.textContent = slider2026.value + '%';

    const slider2027 = document.getElementById('input-agenda-2027');
    const label2027 = document.getElementById('agenda-2027-val');
    slider2027.oninput = () => label2027.textContent = slider2027.value + '%';

    agendaForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = agendaForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Salvando...';

        try {
            await updateAgenda(
                slider2026.value, 
                slider2027.value,
                document.getElementById('input-agenda-section-title').value,
                document.getElementById('input-agenda-year-2026-title').value,
                document.getElementById('input-agenda-year-2027-title').value
            );
            alert("Configurações salvas com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar agenda: " + (err.message || err));
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Salvar Configurações da Agenda';
        }
    };

    // 3. Website General Settings Form Submit
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = settingsForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Salvando...';

            try {
                const team = [];
                const teamCount = document.querySelectorAll('[id^="team-id-"]').length;
                for (let i = 0; i < teamCount; i++) {
                    team.push({
                        id: document.getElementById(`team-id-${i}`).value,
                        initials: document.getElementById(`team-initials-${i}`).value,
                        name: document.getElementById(`team-name-${i}`).value,
                        role_pt: document.getElementById(`team-role-pt-${i}`).value,
                        role_en: document.getElementById(`team-role-en-${i}`).value || document.getElementById(`team-role-pt-${i}`).value,
                        role_es: document.getElementById(`team-role-es-${i}`).value || document.getElementById(`team-role-pt-${i}`).value,
                        role_it: document.getElementById(`team-role-it-${i}`).value || document.getElementById(`team-role-pt-${i}`).value,
                        imageUrl: document.getElementById(`team-image-${i}`).value
                    });
                }

                const dataToSave = {
                    hero_pre_title_pt: document.getElementById('set-hero-pre-title').value,
                    hero_title_pt: document.getElementById('set-hero-title').value,
                    hero_desc_pt: document.getElementById('set-hero-desc').value,
                    hero_btn_date_pt: document.getElementById('set-hero-btn-date').value,
                    manifesto_text_pt: document.getElementById('set-manifesto-text').value,
                    hero_bg_opacity: parseInt(document.getElementById('input-hero-bg-opacity').value) || 50,
                    team: team
                };

                // Merge translations if available, otherwise copy PT value
                const langs = ['en', 'es', 'it'];
                const keys = ['hero_pre_title', 'hero_title', 'hero_desc', 'hero_btn_date', 'manifesto_text'];
                langs.forEach(lang => {
                    keys.forEach(key => {
                        const fieldName = `${key}_${lang}`;
                        const ptField = `${key}_pt`;
                        dataToSave[fieldName] = (localSettings && localSettings[fieldName]) || dataToSave[ptField];
                    });
                });

                await updateGeneralSettings(dataToSave);
                alert("Configurações gerais salvas com sucesso!");
                await loadSettingsTab();
            } catch (err) {
                console.error(err);
                alert("Erro ao salvar configurações gerais: " + (err.message || err));
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Salvar Configurações Gerais';
            }
        };
    }
}

// =========================================================================
// 5. PACKAGES / PLANS MODULE
// =========================================================================
async function loadPlansTab() {
    const container = document.getElementById('admin-plans-container');
    container.innerHTML = `<div class="col-span-full text-center py-8 text-fine-muted font-light"><i class="fa-solid fa-spinner animate-spin text-gold mr-1"></i> Carregando pacotes...</div>`;

    try {
        localPlans = await getPlans();
        
        container.innerHTML = '';
        localPlans.forEach(plan => {
            const card = document.createElement('div');
            card.className = "bg-fine-bg border border-fine-border p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-gold/20 transition duration-300";
            
            // Format arrays back into one-item-per-line strings for the textareas
            const itemsPT = (plan.items_pt || []).join('\n');
            const itemsEN = (plan.items_en || []).join('\n');
            const itemsES = (plan.items_es || []).join('\n');
            const itemsIT = (plan.items_it || []).join('\n');

            card.innerHTML = `
                <div class="space-y-4 flex-grow">
                    <div class="flex justify-between items-center border-b border-fine-border pb-3">
                        <div>
                            <h3 class="font-serif text-xl text-fine-text">${plan.title}</h3>
                            <span class="text-[9px] uppercase tracking-widest text-gold font-bold">${plan.badge}</span>
                        </div>
                    </div>

                    <!-- Localized Price Inputs -->
                    <div class="space-y-2 border-b border-fine-border/50 pb-3">
                        <span class="text-[9px] uppercase tracking-widest text-gold block font-semibold">Preços</span>
                        <div class="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                                <label class="block text-fine-muted mb-0.5">BRL (🇧🇷)</label>
                                <input type="text" id="price-pt-${plan.id}" value="${plan.price_pt || ''}" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded">
                            </div>
                            <div>
                                <label class="block text-fine-muted mb-0.5">USD (🇺🇸)</label>
                                <input type="text" id="price-en-${plan.id}" value="${plan.price_en || ''}" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded">
                            </div>
                            <div>
                                <label class="block text-fine-muted mb-0.5">EUR (🇪🇸)</label>
                                <input type="text" id="price-es-${plan.id}" value="${plan.price_es || ''}" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded">
                            </div>
                            <div>
                                <label class="block text-fine-muted mb-0.5">EUR (🇮🇹)</label>
                                <input type="text" id="price-it-${plan.id}" value="${plan.price_it || ''}" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded">
                            </div>
                        </div>
                    </div>

                    <!-- Localized Summaries and Long Descriptions -->
                    <div class="space-y-3 border-b border-fine-border/50 pb-3 text-[10px]">
                        <span class="text-[9px] uppercase tracking-widest text-gold block font-semibold">Resumos</span>
                        <div>
                            <label class="block text-fine-muted mb-0.5">Resumo Curto (PT)</label>
                            <input type="text" id="summary-pt-${plan.id}" value="${plan.summary_pt || ''}" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded">
                        </div>
                        <div>
                            <label class="block text-fine-muted mb-0.5">Descrição Longa (PT)</label>
                            <textarea id="desc-long-pt-${plan.id}" rows="2" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2 py-1.5 rounded resize-none">${plan.desc_long_pt || ''}</textarea>
                        </div>
                    </div>

                    <!-- Localized Items (One per line) -->
                    <div class="space-y-3 text-[10px]">
                        <div class="flex justify-between items-center">
                            <span class="text-[9px] uppercase tracking-widest text-gold block font-semibold">Itens Inclusos (Um por Linha)</span>
                            <button type="button" id="btn-translate-${plan.id}" onclick="autoTranslatePackage('${plan.id}')" class="text-[9px] bg-brand-green/45 hover:bg-gold hover:text-white border border-fine-border px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold transition duration-300">
                                <i class="fa-solid fa-language mr-1"></i> Traduzir Itens
                            </button>
                        </div>
                        <div>
                            <label class="block text-fine-muted mb-0.5">🇧🇷 Português</label>
                            <textarea id="items-pt-${plan.id}" rows="3" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded font-mono text-[9px]">${itemsPT}</textarea>
                        </div>
                        <div>
                            <label class="block text-fine-muted mb-0.5">🇺🇸 English</label>
                            <textarea id="items-en-${plan.id}" rows="3" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded font-mono text-[9px]">${itemsEN}</textarea>
                        </div>
                        <div>
                            <label class="block text-fine-muted mb-0.5">🇪🇸 Español</label>
                            <textarea id="items-es-${plan.id}" rows="3" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded font-mono text-[9px]">${itemsES}</textarea>
                        </div>
                        <div>
                            <label class="block text-fine-muted mb-0.5">🇮🇹 Italiano</label>
                            <textarea id="items-it-${plan.id}" rows="3" class="w-full bg-fine-surface border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded font-mono text-[9px]">${itemsIT}</textarea>
                        </div>
                    </div>
                </div>

                <div class="pt-2">
                    <button onclick="savePlanEdits('${plan.id}')" class="w-full py-2.5 bg-gold hover:bg-gold-dark text-white rounded-full font-bold uppercase tracking-wider text-[10px] transition-all shadow-md">
                        Salvar Coleção ${plan.title}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="col-span-full text-center py-8 text-red-400 font-light">Erro ao carregar pacotes.</div>`;
    }
}

window.savePlanEdits = async (planId) => {
    const fields = {
        price_pt: document.getElementById(`price-pt-${planId}`).value,
        price_en: document.getElementById(`price-en-${planId}`).value,
        price_es: document.getElementById(`price-es-${planId}`).value,
        price_it: document.getElementById(`price-it-${planId}`).value,

        summary_pt: document.getElementById(`summary-pt-${planId}`).value,
        desc_long_pt: document.getElementById(`desc-long-pt-${planId}`).value,

        // Slit textareas by new line and filter empty rows
        items_pt: document.getElementById(`items-pt-${planId}`).value.split('\n').map(i => i.trim()).filter(i => i !== ""),
        items_en: document.getElementById(`items-en-${planId}`).value.split('\n').map(i => i.trim()).filter(i => i !== ""),
        items_es: document.getElementById(`items-es-${planId}`).value.split('\n').map(i => i.trim()).filter(i => i !== ""),
        items_it: document.getElementById(`items-it-${planId}`).value.split('\n').map(i => i.trim()).filter(i => i !== "")
    };

    // Auto translate summaries and long descriptions in the background
    try {
        const [sumEN, sumES, sumIT, descEN, descES, descIT] = await Promise.all([
            translateText(fields.summary_pt, 'en'),
            translateText(fields.summary_pt, 'es'),
            translateText(fields.summary_pt, 'it'),
            translateText(fields.desc_long_pt, 'en'),
            translateText(fields.desc_long_pt, 'es'),
            translateText(fields.desc_long_pt, 'it')
        ]);
        fields.summary_en = sumEN;
        fields.summary_es = sumES;
        fields.summary_it = sumIT;
        fields.desc_long_en = descEN;
        fields.desc_long_es = descES;
        fields.desc_long_it = descIT;
    } catch (e) {
        console.warn("Background translation failed, falling back to copy:", e);
        fields.summary_en = fields.summary_pt;
        fields.summary_es = fields.summary_pt;
        fields.summary_it = fields.summary_pt;
        fields.desc_long_en = fields.desc_long_pt;
        fields.desc_long_es = fields.desc_long_pt;
        fields.desc_long_it = fields.desc_long_pt;
    }

    try {
        const btn = document.querySelector(`button[onclick="savePlanEdits('${planId}')"]`);
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Salvando...';

        await updatePlan(planId, fields);
        alert(`Coleção atualizada com sucesso!`);
        btn.disabled = false;
        btn.innerHTML = originalText;
        await loadPlansTab();
    } catch (err) {
        console.error(err);
        alert("Erro ao salvar alterações no pacote: " + (err.message || err));
    }
};

// =========================================================================
// 6. AGENDA MODULE (DISPONIBILIDADE)
// =========================================================================
async function loadAgendaTab() {
    try {
        const agenda = await getAgenda();
        if (agenda) {
            document.getElementById('input-agenda-2026').value = agenda.year2026;
            document.getElementById('agenda-2026-val').textContent = agenda.year2026 + '%';

            document.getElementById('input-agenda-2027').value = agenda.year2027;
            document.getElementById('agenda-2027-val').textContent = agenda.year2027 + '%';

            document.getElementById('input-agenda-section-title').value = agenda.sectionTitle || "Agenda de Disponibilidade";
            document.getElementById('input-agenda-year-2026-title').value = agenda.year2026Title || "Agenda 2026";
            document.getElementById('input-agenda-year-2027-title').value = agenda.year2027Title || "Agenda 2027";
            document.getElementById('input-hero-bg-opacity').value = agenda.hero_bg_opacity || 50;
        }
    } catch (err) {
        console.error("Failed to load agenda tab values:", err);
    }
}

// =========================================================================
// 7. WEBSITE CONFIGURATIONS & TRANSLATIONS
// =========================================================================
let localSettings = null;

async function translateText(text, targetLang) {
    if (!text || text.trim() === "") return "";
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`);
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }
        return text;
    } catch (e) {
        console.error("Translation error:", e);
        return text;
    }
}

window.autoTranslatePackage = async (planId) => {
    const summaryPt = document.getElementById(`summary-pt-${planId}`).value;
    const descLongPt = document.getElementById(`desc-long-pt-${planId}`).value;
    const itemsPt = document.getElementById(`items-pt-${planId}`).value;

    const btn = document.getElementById(`btn-translate-${planId}`);
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Traduzindo...';

    try {
        const itemsEN = await translateText(itemsPt, 'en');
        const itemsES = await translateText(itemsPt, 'es');
        const itemsIT = await translateText(itemsPt, 'it');

        document.getElementById(`items-en-${planId}`).value = itemsEN;
        document.getElementById(`items-es-${planId}`).value = itemsES;
        document.getElementById(`items-it-${planId}`).value = itemsIT;

        alert("Tradução dos itens concluída! Os resumos e descrições serão traduzidos em segundo plano ao salvar o pacote.");
    } catch (err) {
        console.error(err);
        alert("Erro ao realizar tradução: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

async function loadSettingsTab() {
    const container = document.getElementById('team-settings-container');
    container.innerHTML = `<div class="col-span-full text-center py-8 text-fine-muted font-light"><i class="fa-solid fa-spinner animate-spin text-gold mr-1"></i> Carregando configurações...</div>`;

    try {
        const settings = await getAgenda(); // Stored in config/agenda doc
        localSettings = settings;

        // Prepopulate Hero inputs with static default fallbacks
        document.getElementById('set-hero-pre-title').value = settings.hero_pre_title_pt || "Para casais que valorizam histórias";
        document.getElementById('set-hero-title').value = settings.hero_title_pt || "Cada amor tem sua história.<br>A nossa missão é <span class='italic font-light text-gold'>transformá-la em filme</span>.";
        document.getElementById('set-hero-desc').value = settings.hero_desc_pt || "Filmes de casamento documentais, atemporais e sensíveis para noivas que valorizam histórias. Sem poses artificiais ou clichês cansativos. Apenas a poesia real do seu dia.";
        document.getElementById('set-hero-btn-date').value = settings.hero_btn_date_pt || "Consultar Disponibilidade de Data";
        
        // Background Video URL & Opacity (moved from agenda to settings)
        document.getElementById('input-hero-bg-opacity').value = settings.hero_bg_opacity || 50;
        const opacityVal = settings.hero_bg_opacity !== undefined ? settings.hero_bg_opacity : 50;
        document.getElementById('input-hero-bg-opacity').value = opacityVal;
        document.getElementById('label-hero-bg-opacity-val').textContent = opacityVal + '%';

        // Prepopulate Manifesto input with static default fallback
        document.getElementById('set-manifesto-text').value = settings.manifesto_text_pt || "\"Temos a convicção de que você deseja ver sua história contada de forma única. Nós quebramos o padrão clássico e monótono de gravação, construindo uma narrativa documental e leve.\"";

        // Render team members
        const defaultTeam = [
            { id: "philipe", name: "PHILIPE REBULI", role_pt: "DIRETOR", role_en: "DIRECTOR", role_es: "DIRECTOR", role_it: "DIRETOR", imageUrl: "philipe.jpeg", initials: "PR" },
            { id: "louis", name: "LOUIS FELIX", role_pt: "DIRETOR", role_en: "DIRECTOR", role_es: "DIRECTOR", role_it: "DIRETOR", imageUrl: "Louis.jpg", initials: "LF" },
            { id: "yasmim", name: "YASMIM REBULI", role_pt: "DIRETOR", role_en: "DIRECTOR", role_es: "DIRECTOR", role_it: "DIRETOR", imageUrl: "yasmim.jpeg", initials: "YR" },
            { id: "luiz", name: "LUIZ HENRIQUE", role_pt: "DIRETOR", role_en: "DIRECTOR", role_es: "DIRECTOR", role_it: "DIRETOR", imageUrl: "luiz henrique.jpeg", initials: "LH" },
            { id: "leo", name: "LEO STOCCO", role_pt: "EDITOR", role_en: "EDITOR", role_es: "EDITOR", role_it: "EDITOR", imageUrl: "leo.jpeg", initials: "LS" }
        ];

        localTeam = settings.team && settings.team.length > 0 ? settings.team : defaultTeam;
        renderTeamInputs();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="col-span-full text-center py-8 text-red-400 font-light">Erro ao carregar configurações gerais.</div>`;
    }
}

window.autoTranslateGeneralSettings = async () => {
    const preTitle = document.getElementById('set-hero-pre-title').value;
    const title = document.getElementById('set-hero-title').value;
    const desc = document.getElementById('set-hero-desc').value;
    const btnDate = document.getElementById('set-hero-btn-date').value;
    const manifesto = document.getElementById('set-manifesto-text').value;

    const btn = document.getElementById('btn-translate-settings');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Traduzindo...';

    try {
        const teamCount = document.querySelectorAll('[id^="team-id-"]').length;
        
        if (!localSettings) localSettings = {};

        localSettings.hero_pre_title_en = await translateText(preTitle, 'en');
        localSettings.hero_pre_title_es = await translateText(preTitle, 'es');
        localSettings.hero_pre_title_it = await translateText(preTitle, 'it');

        localSettings.hero_title_en = await translateText(title, 'en');
        localSettings.hero_title_es = await translateText(title, 'es');
        localSettings.hero_title_it = await translateText(title, 'it');

        localSettings.hero_desc_en = await translateText(desc, 'en');
        localSettings.hero_desc_es = await translateText(desc, 'es');
        localSettings.hero_desc_it = await translateText(desc, 'it');

        localSettings.hero_btn_date_en = await translateText(btnDate, 'en');
        localSettings.hero_btn_date_es = await translateText(btnDate, 'es');
        localSettings.hero_btn_date_it = await translateText(btnDate, 'it');

        localSettings.manifesto_text_en = await translateText(manifesto, 'en');
        localSettings.manifesto_text_es = await translateText(manifesto, 'es');
        localSettings.manifesto_text_it = await translateText(manifesto, 'it');

        for (let i = 0; i < teamCount; i++) {
            const rolePt = document.getElementById(`team-role-pt-${i}`).value;
            document.getElementById(`team-role-en-${i}`).value = await translateText(rolePt, 'en');
            document.getElementById(`team-role-es-${i}`).value = await translateText(rolePt, 'es');
            document.getElementById(`team-role-it-${i}`).value = await translateText(rolePt, 'it');
        }

        alert("Traduções automáticas concluídas para Inglês, Espanhol e Italiano! Clique em 'Salvar Configurações Gerais' para persistir.");
    } catch (err) {
        console.error(err);
        alert("Erro na tradução: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};
// =========================================================================
// 8. PHOTO UPLOAD & USER MANAGEMENT
// =========================================================================

window.uploadMemberPhoto = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    const label = event.target.parentElement;
    const icon = label.querySelector('i');
    const originalClass = icon ? icon.className : 'fa-solid fa-upload';
    if (icon) icon.className = 'fa-solid fa-spinner animate-spin text-[10px]';

    // Create progress span inside the label next to the icon
    const progressSpan = document.createElement('span');
    progressSpan.className = 'ml-1 text-[9px] font-mono font-bold';
    progressSpan.textContent = '0%';
    label.appendChild(progressSpan);

    try {
        let imageUrl = '';
        if (isDemoMode) {
            // Convert to Base64 in Demo Mode
            const reader = new FileReader();
            imageUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            progressSpan.textContent = '100%';
        } else if (USE_PHP_UPLOAD) {
            // Upload to self-hosted PHP server
            const formData = new FormData();
            formData.append('file', file);
            
            imageUrl = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', './upload.php', true);
                
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        progressSpan.textContent = Math.round(progress) + '%';
                    }
                };
                
                xhr.onload = () => {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (res.success && res.url) {
                            resolve(res.url);
                        } else {
                            reject(new Error(res.error || "Erro no upload PHP"));
                        }
                    } catch (err) {
                        reject(new Error("Resposta inválida do servidor PHP"));
                    }
                };
                
                xhr.onerror = () => reject(new Error("Erro de conexão com o servidor PHP"));
                xhr.send(formData);
            });
        } else {
            // Upload to Firebase Storage with progress tracking
            const storage = getStorage(app);
            const storageRef = ref(storage, `team/member_${index}_${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            imageUrl = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        progressSpan.textContent = Math.round(progress) + '%';
                    }, 
                    (error) => {
                        reject(error);
                    }, 
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
                    }
                );
            });
        }

        document.getElementById(`team-image-${index}`).value = imageUrl;
        alert("Foto enviada com sucesso!");
    } catch (e) {
        console.error("Photo upload error:", e);
        let errorMsg = e.message || e;
        if (errorMsg.includes("unauthorized") || errorMsg.includes("permission-denied")) {
            errorMsg += "\n\nDIAGNÓSTICO: Por favor, verifique se você ativou o Firebase Storage no seu Firebase Console e publicou as Regras de Segurança corretas (permitindo leitura pública e gravação para usuários autenticados).";
        } else if (errorMsg.includes("bucket")) {
            errorMsg += "\n\nDIAGNÓSTICO: O bucket do Firebase Storage não foi encontrado. Verifique se o seu 'storageBucket' em js/firebase-config.js está correto.";
        }
        alert("Erro ao enviar foto: " + errorMsg);
    } finally {
        progressSpan.remove();
        if (icon) icon.className = originalClass;
    }
};

window.openUserModal = () => {
    document.getElementById('user-email-input').value = '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-modal').classList.remove('hidden');
};

window.closeUserModal = () => {
    document.getElementById('user-modal').classList.add('hidden');
};

window.deleteUserAccount = async (uid, email) => {
    if (email === 'nandopaiva@gmail.com') {
        alert("O proprietário principal do painel não pode ser removido.");
        return;
    }
    if (!confirm(`Deseja revogar o acesso do usuário ${email}?`)) return;

    try {
        await deleteUser(uid);
        alert("Acesso revogado com sucesso!");
        await loadUsersTab();
    } catch (err) {
        console.error(err);
        alert("Erro ao revogar acesso: " + (err.message || err));
    }
};

window.resetUserPassword = async (email) => {
    if (!confirm(`Deseja enviar um e-mail de redefinição de senha para ${email}?`)) return;
    try {
        await sendPasswordResetEmail(auth, email);
        alert(`E-mail de redefinição de senha enviado com sucesso para ${email}!`);
    } catch (err) {
        console.error(err);
        alert("Erro ao enviar e-mail de redefinição: " + (err.message || err));
    }
};

window.loadUsersTab = async () => {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-fine-muted font-light"><i class="fa-solid fa-spinner animate-spin text-gold mr-1"></i> Carregando usuários...</td></tr>`;

    try {
        const users = await getUsers();
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-fine-muted font-light">Nenhum administrador cadastrado.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-fine-surface transition duration-200";
            
            const isOwner = user.email === 'nandopaiva@gmail.com';
            const actionButtonHtml = isOwner 
                ? `<span class="text-gold italic font-light text-[10px]">Proprietário</span>`
                : `<button onclick="resetUserPassword('${user.email}')" class="text-gold hover:text-gold-dark font-semibold transition mr-4"><i class="fa-regular fa-envelope mr-1"></i> Redefinir Senha</button>
                   <button onclick="deleteUserAccount('${user.id}', '${user.email}')" class="text-red-400 hover:text-red-500 font-semibold transition"><i class="fa-regular fa-trash-can mr-1"></i> Revogar Acesso</button>`;

            tr.innerHTML = `
                <td class="p-4 text-fine-text font-medium">${user.email}</td>
                <td class="p-4 text-fine-muted font-light">Administrador</td>
                <td class="p-4 text-right">${actionButtonHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-red-400 font-light">Erro ao carregar usuários.</td></tr>`;
    }
};

// Bind user form submission on load
document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('user-email-input').value;
            const password = document.getElementById('user-password-input').value;
            const submitBtn = userForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs"></i> Criando...';

            try {
                if (isDemoMode) {
                    const mockUid = 'mock_uid_' + Math.random().toString(36).substring(2, 9);
                    await saveUser(mockUid, email);
                    alert("Usuário administrador criado com sucesso (Modo Demonstração)!");
                } else {
                    // Workaround: Initialize secondary Firebase app to prevent signing out current admin
                    const secondaryAppName = "RegisterApp_" + Math.random().toString(36).substring(2, 9);
                    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
                    const secondaryAuth = getAuth(secondaryApp);

                    // Create user in Auth
                    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                    const uid = userCredential.user.uid;

                    // Save record in Firestore users collection
                    await saveUser(uid, email);

                    // Clean up secondary app
                    await deleteApp(secondaryApp);

                    alert(`Usuário ${email} criado e autorizado com sucesso!`);
                }

                closeUserModal();
                await loadUsersTab();
            } catch (err) {
                console.error(err);
                if (err.code === 'auth/email-already-in-use') {
                    if (confirm("Este e-mail já está cadastrado no Firebase Auth. Deseja apenas conceder permissão de administrador para ele no banco de dados do site?")) {
                        try {
                            const mockUid = 'auth_existing_' + Math.random().toString(36).substring(2, 9);
                            await saveUser(mockUid, email);
                            alert(`Acesso de administrador concedido para ${email}!`);
                            closeUserModal();
                            await loadUsersTab();
                        } catch (saveErr) {
                            alert("Erro ao conceder permissão: " + (saveErr.message || saveErr));
                        }
                    }
                } else {
                    alert("Erro ao criar usuário: " + (err.message || err));
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Criar Usuário';
            }
        };
    }
});
// =========================================================================
// 9. DYNAMIC TEAM & PORTFOLIO COVER UPLOADS
// =========================================================================

window.renderTeamInputs = () => {
    const container = document.getElementById('team-settings-container');
    if (!container) return;
    container.innerHTML = '';
    
    localTeam.forEach((member, index) => {
        const card = document.createElement('div');
        card.className = "bg-fine-surface border border-fine-border p-4 rounded-2xl space-y-3 relative hover:border-gold/20 transition duration-300";
        card.innerHTML = `
            <div class="flex items-center justify-between border-b border-fine-border/50 pb-2 mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center font-bold text-xs text-gold">${member.initials || '??'}</div>
                    <span class="text-xs uppercase tracking-wider text-fine-text font-bold">Membro ${index + 1}</span>
                </div>
                <button type="button" onclick="removeTeamMember(${index})" class="text-red-400 hover:text-red-500 transition text-[10px] uppercase font-semibold"><i class="fa-solid fa-user-minus mr-1"></i> Remover</button>
            </div>
            
            <input type="hidden" id="team-id-${index}" value="${member.id || 'member_' + Date.now()}">
            <input type="hidden" id="team-initials-${index}" value="${member.initials || ''}">
            <input type="hidden" id="team-role-en-${index}" value="${member.role_en || ''}">
            <input type="hidden" id="team-role-es-${index}" value="${member.role_es || ''}">
            <input type="hidden" id="team-role-it-${index}" value="${member.role_it || ''}">

            <div class="space-y-2 text-[10px]">
                <div>
                    <label class="block text-fine-muted mb-0.5">Nome Completo</label>
                    <input type="text" id="team-name-${index}" value="${member.name || ''}" required oninput="localTeam[${index}].name = this.value; updateMemberInitials(${index})" class="w-full bg-fine-bg border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded text-xs">
                </div>
                <div>
                    <label class="block text-fine-muted mb-0.5">Cargo (PT)</label>
                    <input type="text" id="team-role-pt-${index}" value="${member.role_pt || ''}" required oninput="localTeam[${index}].role_pt = this.value" class="w-full bg-fine-bg border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded text-xs">
                </div>
                <div>
                    <label class="block text-fine-muted mb-0.5">Link da Foto (ou Nome do Arquivo)</label>
                    <div class="flex gap-2">
                        <input type="text" id="team-image-${index}" value="${member.imageUrl || ''}" required oninput="localTeam[${index}].imageUrl = this.value" class="w-full bg-fine-bg border border-fine-border focus:border-gold focus:outline-none text-fine-text px-2.5 py-1.5 rounded text-xs flex-grow">
                        <label class="bg-brand-green/60 hover:bg-gold text-white border border-fine-border px-3 py-1.5 rounded-xl text-[10px] cursor-pointer flex items-center justify-center transition duration-300">
                            <i class="fa-solid fa-upload"></i>
                            <input type="file" accept="image/*" onchange="uploadMemberPhoto(event, ${index})" class="hidden">
                        </label>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};

window.addTeamMember = () => {
    localTeam.push({
        id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: '',
        role_pt: '',
        role_en: '',
        role_es: '',
        role_it: '',
        imageUrl: '',
        initials: '??'
    });
    renderTeamInputs();
};

window.removeTeamMember = (index) => {
    if (localTeam.length <= 1) {
        alert("O site precisa ter pelo menos um membro na equipe.");
        return;
    }
    localTeam.splice(index, 1);
    renderTeamInputs();
};

window.updateMemberInitials = (index) => {
    const name = document.getElementById(`team-name-${index}`).value;
    const parts = name.trim().split(/\s+/);
    let initials = '??';
    if (parts.length > 0 && parts[0]) {
        initials = parts[0][0].toUpperCase();
        if (parts.length > 1 && parts[parts.length - 1]) {
            initials += parts[parts.length - 1][0].toUpperCase();
        }
    }
    document.getElementById(`team-initials-${index}`).value = initials;
    const label = document.querySelectorAll('#team-settings-container .w-8.h-8')[index];
    if (label) label.textContent = initials;
    localTeam[index].initials = initials;
};

window.uploadPortfolioCover = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const label = event.target.parentElement;
    const icon = label.querySelector('i');
    const originalClass = icon ? icon.className : 'fa-solid fa-upload';
    if (icon) icon.className = 'fa-solid fa-spinner animate-spin text-[10px]';

    // Create progress span inside the label next to the icon
    const progressSpan = document.createElement('span');
    progressSpan.className = 'ml-1 text-[9px] font-mono font-bold';
    progressSpan.textContent = '0%';
    label.appendChild(progressSpan);

    try {
        let imageUrl = '';
        if (isDemoMode) {
            const reader = new FileReader();
            imageUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            progressSpan.textContent = '100%';
        } else if (USE_PHP_UPLOAD) {
            // Upload to self-hosted PHP server
            const formData = new FormData();
            formData.append('file', file);
            
            imageUrl = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', './upload.php', true);
                
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        progressSpan.textContent = Math.round(progress) + '%';
                    }
                };
                
                xhr.onload = () => {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (res.success && res.url) {
                            resolve(res.url);
                        } else {
                            reject(new Error(res.error || "Erro no upload PHP"));
                        }
                    } catch (err) {
                        reject(new Error("Resposta inválida do servidor PHP"));
                    }
                };
                
                xhr.onerror = () => reject(new Error("Erro de conexão com o servidor PHP"));
                xhr.send(formData);
            });
        } else {
            // Upload to Firebase Storage with progress tracking
            const storage = getStorage(app);
            const storageRef = ref(storage, `portfolio/cover_${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            imageUrl = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        progressSpan.textContent = Math.round(progress) + '%';
                    }, 
                    (error) => {
                        reject(error);
                    }, 
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
                    }
                );
            });
        }

        document.getElementById('port-cover').value = imageUrl;
        alert("Capa enviada com sucesso!");
    } catch (e) {
        console.error("Cover upload error:", e);
        let errorMsg = e.message || e;
        if (errorMsg.includes("unauthorized") || errorMsg.includes("permission-denied")) {
            errorMsg += "\n\nDIAGNÓSTICO: Por favor, verifique se você ativou o Firebase Storage no seu Firebase Console e publicou as Regras de Segurança corretas (permitindo leitura pública e gravação para usuários autenticados).";
        } else if (errorMsg.includes("bucket")) {
            errorMsg += "\n\nDIAGNÓSTICO: O bucket do Firebase Storage não foi encontrado. Verifique se o seu 'storageBucket' em js/firebase-config.js está correto.";
        }
        alert("Erro ao enviar capa: " + errorMsg);
    } finally {
        progressSpan.remove();
        if (icon) icon.className = originalClass;
    }
};

// =========================================================================
// VIMEO TAB MODULE
// =========================================================================
let allVimeoVideos = []; // all videos fetched from proxy
let visibleVimeoIds = []; // IDs marked as visible (saved setting)

async function loadVimeoTab() {
    const loadingEl = document.getElementById('vimeo-admin-loading');
    const gridEl = document.getElementById('vimeo-admin-grid');

    loadingEl.classList.remove('hidden');
    gridEl.classList.add('hidden');

    try {
        // Load saved visibility settings from DB
        const settings = await getVimeoSettings();
        visibleVimeoIds = settings.visibleIds || [];

        // Fetch all videos from proxy
        await fetchAndRenderVimeoAdmin();
    } catch (err) {
        console.error('Error loading Vimeo tab:', err);
        loadingEl.innerHTML = `<p class="text-red-400 text-sm">Erro ao carregar vídeos: ${err.message}</p>`;
    }
}

window.refreshVimeoVideos = async () => {
    const btn = document.getElementById('vimeo-refresh-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Atualizando...';
    btn.disabled = true;
    await fetchAndRenderVimeoAdmin();
    btn.innerHTML = originalHTML;
    btn.disabled = false;
};

async function fetchAndRenderVimeoAdmin() {
    const loadingEl = document.getElementById('vimeo-admin-loading');
    const gridEl = document.getElementById('vimeo-admin-grid');

    loadingEl.classList.remove('hidden');
    gridEl.classList.add('hidden');

    try {
        // Fetch video IDs from PHP proxy (cache-busted)
        const proxyRes = await fetch(`./vimeo-proxy.php?t=${Date.now()}`);
        if (!proxyRes.ok) throw new Error('Proxy não respondeu');
        const proxyData = await proxyRes.json();

        if (!proxyData.success || proxyData.videos.length === 0) {
            loadingEl.innerHTML = `
                <i class="fa-brands fa-vimeo-v text-3xl text-fine-muted mb-3 block"></i>
                <p class="text-fine-muted text-sm">Nenhum vídeo encontrado na vitrine do Vimeo.</p>
                <p class="text-fine-muted/50 text-xs mt-1">Verifique se o arquivo <code>vimeo-proxy.php</code> está no servidor.</p>
            `;
            return;
        }

        // Fetch oEmbed metadata for each video
        const videoPromises = proxyData.videos.map(async (id) => {
            try {
                const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=640`);
                if (!res.ok) return null;
                const data = await res.json();
                return { id, ...data };
            } catch { return null; }
        });

        allVimeoVideos = (await Promise.all(videoPromises)).filter(v => v !== null);

        // Render cards
        gridEl.innerHTML = '';
        allVimeoVideos.forEach(video => {
            const isVisible = visibleVimeoIds.length === 0 || visibleVimeoIds.includes(video.id);
            const thumbUrl = video.thumbnail_url ? video.thumbnail_url.replace(/_\d+x\d+/, '_320x180') : '';

            const card = document.createElement('div');
            card.className = `relative rounded-xl overflow-hidden border transition duration-200 ${isVisible ? 'border-brand-green/70 bg-brand-greenDark/30' : 'border-fine-border/50 bg-fine-bg opacity-60'}`;
            card.setAttribute('data-video-id', video.id);

            card.innerHTML = `
                <div class="aspect-video relative overflow-hidden">
                    <img src="${thumbUrl}" class="w-full h-full object-cover" alt="${video.title || ''}">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span class="text-white text-xs font-light px-2 py-1 bg-black/50 rounded-full">${video.id}</span>
                    </div>
                </div>
                <div class="p-3 flex items-center justify-between gap-2">
                    <div class="min-w-0">
                        <p class="text-fine-text text-xs font-semibold truncate">${video.title || 'Sem título'}</p>
                        <p class="text-fine-muted text-[10px] mt-0.5"><i class="fa-brands fa-vimeo-v mr-1"></i>${video.author_name || ''}</p>
                    </div>
                    <!-- Toggle Switch -->
                    <label class="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" class="sr-only peer vimeo-toggle" data-id="${video.id}" ${isVisible ? 'checked' : ''} onchange="onVimeoToggle(this)">
                        <div class="w-10 h-5 bg-fine-border rounded-full peer peer-checked:bg-brand-green transition duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                </div>
            `;
            gridEl.appendChild(card);
        });

        loadingEl.classList.add('hidden');
        gridEl.classList.remove('hidden');

    } catch (err) {
        loadingEl.innerHTML = `<p class="text-red-400 text-sm">Erro: ${err.message}</p>`;
    }
}

window.onVimeoToggle = (checkbox) => {
    const card = checkbox.closest('[data-video-id]');
    if (checkbox.checked) {
        card.classList.remove('border-fine-border/50', 'bg-fine-bg', 'opacity-60');
        card.classList.add('border-brand-green/70', 'bg-brand-greenDark/30');
    } else {
        card.classList.remove('border-brand-green/70', 'bg-brand-greenDark/30');
        card.classList.add('border-fine-border/50', 'bg-fine-bg', 'opacity-60');
    }
};

window.saveVimeoVisibility = async () => {
    const btn = document.getElementById('vimeo-save-btn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Salvando...';

    try {
        // Collect all checked IDs
        const checked = [...document.querySelectorAll('.vimeo-toggle:checked')].map(cb => cb.dataset.id);
        await saveVimeoSettings(checked);
        visibleVimeoIds = checked;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
};

