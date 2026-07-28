// PHFILME Data Store Layer
// Dynamically handles Firestore or LocalStorage (Demo Mode) operations

import { db, isDemoMode } from './firebase-config.js';
import { 
    collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, deleteDoc, query, orderBy 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const defaultAgenda = {
    year2026: 95,
    year2027: 55,
    sectionTitle: "Agenda de Disponibilidade",
    year2026Title: "Agenda 2026",
    year2027Title: "Agenda 2027",
    bgVideoUrl: "https://phfilme.com.br/videos/video_ph.mp4",
    hero_bg_opacity: 50,
    
    // Hero Section Default Configs
    hero_pre_title_pt: "Para casais que valorizam histórias",
    hero_pre_title_en: "For couples who value stories",
    hero_pre_title_es: "Para parejas que valoran historias",
    hero_pre_title_it: "Per coppie que valorizzano storie",
    
    hero_title_pt: "Cada amor tem sua história.<br>A nossa missão é <span class='italic font-light text-gold'>transformá-la em filme</span>.",
    hero_title_en: "Every love has its story.<br>Our mission is to <span class='italic font-light text-gold'>turn it into a film</span>.",
    hero_title_es: "Cada amor tiene su história.<br>Nuestra misión es <span class='italic font-light text-gold'>transformarla en película</span>.",
    hero_title_it: "Ogni amore ha la sua storia.<br>La nossa missão é <span class='italic font-light text-gold'>trasformarla in film</span>.",

    hero_desc_pt: "Filmes de casamento documentais, atemporais e sensíveis para noivas que valorizam histórias. Sem poses artificiais ou clichês cansativos. Apenas a poesia real do seu dia.",
    hero_desc_en: "Documentary, timeless, and sensitive wedding films for brides who value stories. No artificial poses or boring clichés. Just the pure poetry of your day.",
    hero_desc_es: "Películas de boda documentales, atemporales y sensibles para novias que valoran historias. Sin poses artificiales o clichés aburridos. Solo la poesía real de tu día.",
    hero_desc_it: "Film di matrimonio documentaristici, senza tempo e sensibili per spose que valorizzano storie. Senza pose artificiali o cliché noiosi. Solo la poesia reale del vostro giorno.",

    hero_btn_date_pt: "Consultar Disponibilidade de Data",
    hero_btn_date_en: "Check Date Availability",
    hero_btn_date_es: "Consultar Disponibilidade de Fecha",
    hero_btn_date_it: "Consultare Disponibilità di Data",

    // Manifesto Section Default Configs
    manifesto_text_pt: "\"Temos a convicção de que você deseja ver sua história contada de forma única. Nós quebramos o padrão clássico e monótono de gravação, construindo uma narrativa documental e leve.\"",
    manifesto_text_en: "\"We are convinced that you want to see your story told in a unique way. We break the classic and monotonous recording template, building a documentary and light narrative.\"",
    manifesto_text_es: "\"Tenemos la convicción de que deseas ver tu historia contada de forma única. Rompemos el patrón clásico y monótono de filmación, construyendo una narrativa documental y ligera.\"",
    manifesto_text_it: "\"Abbiamo la convinzione que desideri vedere la tua storia raccontata in modo unico. Rompiamo lo schema classico e monotono di ripresa, construendo uma narrativa documentaristica e leggera.\"",

    // Team Default Configs
    team: [
        {
            id: "philipe",
            name: "PHILIPE REBULI",
            role_pt: "DIRETOR",
            role_en: "DIRECTOR",
            role_es: "DIRECTOR",
            role_it: "DIRETOR",
            imageUrl: "philipe.jpeg",
            initials: "PR"
        },
        {
            id: "louis",
            name: "LOUIS FELIX",
            role_pt: "DIRETOR",
            role_en: "DIRECTOR",
            role_es: "DIRECTOR",
            role_it: "DIRETOR",
            imageUrl: "Louis.jpg",
            initials: "LF"
        },
        {
            id: "yasmim",
            name: "YASMIM REBULI",
            role_pt: "DIRETOR",
            role_en: "DIRECTOR",
            role_es: "DIRECTOR",
            role_it: "DIRETOR",
            imageUrl: "yasmim.jpeg",
            initials: "YR"
        },
        {
            id: "luiz",
            name: "LUIZ HENRIQUE",
            role_pt: "DIRETOR",
            role_en: "DIRECTOR",
            role_es: "DIRECTOR",
            role_it: "DIRETOR",
            imageUrl: "luiz henrique.jpeg",
            initials: "LH"
        },
        {
            id: "leo",
            name: "LEO STOCCO",
            role_pt: "EDITOR",
            role_en: "EDITOR",
            role_es: "EDITOR",
            role_it: "EDITOR",
            imageUrl: "leo.jpeg",
            initials: "LS"
        }
    ]
};

const defaultPlans = [
    {
        id: "ouro",
        title: "Ouro",
        badge: "Classic",
        summary_pt: "Ideal para casamentos intimistas de cobertura essencial.",
        summary_en: "Ideal for intimate weddings seeking essential coverage.",
        summary_es: "Ideal para bodas íntimas de cobertura esencial.",
        summary_it: "Ideale per matrimoni intimi e coperture essenziali.",
        desc_long_pt: "A coleção ideal para casamentos que buscam uma cobertura elegante, autoral e extremamente sensível das etapas fundamentais do seu grande dia.",
        desc_long_en: "The ideal collection for weddings seeking elegant, signature, and extremely sensitive coverage of the fundamental steps of your big day.",
        desc_long_es: "La colección ideal para bodas que buscan una cobertura elegante, autoral y sumamente sensible de las etapas fundamentales de su gran día.",
        desc_long_it: "La collezione ideale per i matrimoni che cercano una copertura raffinata, autoriale ed estremamente sensibile dei momenti cruciali della giornata.",
        price_pt: "R$ 18.000,00",
        price_en: "$3,500.00 USD",
        price_es: "€3.100,00",
        price_it: "€3.100,00",
        items_pt: [
            "1 filmmaker",
            "1 diária de cobertura",
            "Making of noiva, cerimônia & festa",
            "6h de cobertura",
            "1 teaser de 30 a 40 segundos",
            "1 filme principal de até 6 minutos"
        ],
        items_en: [
            "1 filmmaker",
            "1 day of coverage",
            "Bride's making of, ceremony & reception",
            "6h of coverage",
            "1 teaser (30 to 40 seconds)",
            "1 main film (up to 6 minutes)"
        ],
        items_es: [
            "1 filmmaker",
            "1 día de cobertura",
            "Preparativos de la novia, ceremonia y recepción",
            "6h de cobertura",
            "1 teaser de 30 a 40 segundos",
            "1 película principal de hasta 6 minutos"
        ],
        items_it: [
            "1 videomaker",
            "1 giorno di copertura",
            "Preparativi da sposa, cerimonia e festa",
            "6 ore di copertura",
            "1 teaser da 30 a 40 secondi",
            "1 film principale fino a 6 minuti"
        ]
    },
    {
        id: "diamante",
        title: "Diamante",
        badge: "Elite",
        summary_pt: "A cobertura ideal completa com equipe ampliada e teasers.",
        summary_en: "The ideal complete coverage with expanded crew and teasers.",
        summary_es: "La cobertura completa ideal con equipo ampliado y teasers.",
        summary_it: "La copertura ideale completa con team esteso e teaser inclusi.",
        desc_long_pt: "Nossa coleção mais procurada. Projetada para casamentos dinâmicos que exigem múltiplos ângulos, riqueza dramática e cobertura total das preparações de ambos os noivos.",
        desc_long_en: "Our most popular collection. Designed for dynamic weddings that require multiple angles, narrative depth, and full coverage of both the bride and groom's preparations.",
        desc_long_es: "Nuestra colección más solicitada. Diseñada para bodas dinámicas que exigen múltiples ángulos, riqueza dramática y cobertura total de los preparativos de ambos novios.",
        desc_long_it: "La nostra collezione più richiesta. Pensata per eventi dinamici che richiedono più angolazioni, profondità drammatica e riprese complete dei preparativi di entrambi gli sposi.",
        price_pt: "R$ 23.000,00",
        price_en: "$4,500.00 USD",
        price_es: "€3.900,00",
        price_it: "€3.900,00",
        items_pt: [
            "2 filmmakers",
            "2 diárias de cobertura",
            "Making of noiva e noivo, cerimônia & festa",
            "8h de cobertura",
            "1 filme de até 1 minuto e 30 segundos",
            "1 filme principal de até 10 minutos"
        ],
        items_en: [
            "2 filmmakers",
            "2 days of coverage",
            "Bride & Groom's making of, ceremony & reception",
            "8h of coverage",
            "1 trailer (up to 1 minute and 30 seconds)",
            "1 main film (up to 10 minutes)"
        ],
        items_es: [
            "2 filmmakers",
            "2 días de cobertura",
            "Preparativos de ambos, ceremonia y recepción",
            "8h de cobertura",
            "1 trailer de hasta 1 minuto y 30 segundos",
            "1 película principal de hasta 10 minutos"
        ],
        items_it: [
            "2 videomaker",
            "2 giorni di copertura",
            "Preparativi degli sposi, cerimonia e festa",
            "8 ore di copertura",
            "1 trailer fino a 1 minuto e 30 secondi",
            "1 film principale fino a 10 minuti"
        ]
    },
    {
        id: "platinum",
        title: "Platinum",
        badge: "Exclusivo",
        summary_pt: "A experiência máxima e imersiva sem limites de entrega.",
        summary_en: "The maximum immersive experience with unlimited delivery.",
        summary_es: "La experiencia máxima e inmersiva sin límites de entrega.",
        summary_it: "L'esperienza cinematografica massima senza limiti di durata.",
        desc_long_pt: "A experiência cinematográfica máxima e irrestrita. Criado para casamentos de grande escala, destinos internacionais ou casais que desejam o registro documental definitivo de seu legado.",
        desc_long_en: "The ultimate and unrestricted cinematic experience. Created for large-scale weddings, international destinations, or couples who want the definitive documentary record of their legacy.",
        desc_long_es: "La experiencia cinematográfica máxima e ilimitada. Creada para bodas a gran escala, destinos internacionales o parejas que desean el registro documental definitivo de su legado.",
        desc_long_it: "L'esperienza cinematografica definitiva e senza limiti. Creata per grandi eventi, mete internazionali o per coppie che desiderano un racconto documentaristico indelebile del proprio legame.",
        price_pt: "R$ 28.000,00",
        price_en: "$5,400.00 USD",
        price_es: "€4.800,00",
        price_it: "€4.800,00",
        items_pt: [
            "3 filmmakers",
            "2 diárias de cobertura",
            "Making of noiva e noivo, cerimônia & festa",
            "Cobertura ilimitada",
            "1 filme de até 1 minuto e 30 segundos",
            "1 filme principal de até 15 minutos",
            "1 filme de prévia até 40 segundos",
            "1 filme da cerimônia completa até 50min"
        ],
        items_en: [
            "3 filmmakers",
            "2 days of coverage",
            "Bride & groom's making of, ceremony & reception",
            "Unlimited coverage",
            "1 trailer (up to 1 minute and 30 seconds)",
            "1 main film (up to 15 minutes)",
            "1 teaser film up to 40 seconds",
            "1 full ceremony film up to 50min"
        ],
        items_es: [
            "3 filmmakers",
            "2 days of coverage",
            "Preparativos de ambos, ceremonia y recepción",
            "Cobertura ilimitada",
            "1 trailer de hasta 1 minuto y 30 segundos",
            "1 película principal de hasta 15 minutos",
            "1 teaser de vista previa de hasta 40 segundos",
            "1 película de ceremonia completa de hasta 50 min"
        ],
        items_it: [
            "3 videomaker",
            "2 giorni di copertura",
            "Preparativi degli sposi, cerimonia e festa",
            "Copertura illimitata",
            "1 trailer fino a 1 minuto e 30 secondi",
            "1 film principale fino a 15 minuti",
            "1 teaser in anteprima fino a 40 secondi",
            "1 filmato completo della cerimonia fino a 50 minuti"
        ]
    }
];

const defaultPortfolio = [
    {
        id: "Fran_Tony",
        videoUrl: "https://video.wixstatic.com/video/2aa4ac_f785721574834e2bb550414facda6952/1080p/mp4/file.mp4",
        coverUrl: "Fran_Tony.jpeg",
        badge_pt: "Hotel Villa Cimbrone, Itália",
        badge_en: "Hotel Villa Cimbrone, Italy",
        badge_es: "Hotel Villa Cimbrone, Itália",
        badge_it: "Hotel Villa Cimbrone, Itália",
        title_pt: "Franciny & Tony | Filme Completo",
        title_en: "Franciny & Tony | Full Movie",
        title_es: "Franciny & Tony | Película Completa",
        title_it: "Franciny & Tony | Film Completo",
        desc_pt: "Eles escolheram a Itália, terra do romance eterno, para celebrar esse sentimento que ultrapassa fronteiras. No Hotel Villa Cimbrone, com seus jardins encantados, vista infinita sobre o mar e o lendário Terraço do Infinito, disseram “sim” diante do horizonte que simboliza a imensidão do amor que os une.",
        desc_en: "They chose Italy, the land of eternal romance, to celebrate this boundary-crossing feeling. At Hotel Villa Cimbrone, with its enchanted gardens, infinite sea views, and legendary Terrace of Infinity, they said 'yes' before the horizon symbolizing their immense love.",
        desc_es: "Eligieron Italia, tierra del romance eterno, para celebrar este sentimento que cruza fronteras. En el Hotel Villa Cimbrone, con sus jardins encantados, vista infinita sobre el mar y la legendaria Terraza del Infinito, dijeron 'sí' ante el horizonte.",
        desc_it: "Hanno scelto l'Italia, culla del romanticismo senza tempo, per celebrare questo legame oltre ogni confine. All'Hotel Villa Cimbrone, tra splendidi giardini e la leggendaria Terrazza dell'Infinito, hanno pronunciato il loro 'sì'.",
        order: 1
    },
    {
        id: "Camila_Johaes",
        videoUrl: "https://video.wixstatic.com/video/2aa4ac_4e0008100bf440c381c71b47fdee7499/1080p/mp4/file.mp4",
        coverUrl: "Camila_Johaes.jpeg",
        badge_pt: "Angra dos Reis, Rio de Janeiro",
        badge_en: "Angra dos Reis, Rio de Janeiro",
        badge_es: "Angra dos Reis, Río de Janeiro",
        badge_it: "Angra dos Reis, Rio de Janeiro",
        title_pt: "Um Amor Sem Fronteiras — Camila & Johannes",
        title_en: "A Love Without Borders — Camila & Johannes",
        title_es: "Un Amor Sin Fronteras — Camila & Johannes",
        title_it: "Un Amore Senza Confini — Camila & Johannes",
        desc_pt: "Ele, da Alemanha. Ela, do Brasil. Dois mundos, um só coração. Em um cenário paradisíaco, Angra dos Reis, com os pés na areia e o mar como testemunha, celebraram o amor diante da família e dos amigos. Um dia leve, cheio de emoção e conexão verdadeira — como todo amor deve ser.",
        desc_en: "Him, from Germany. Her, from Brazil. Two worlds, one heart. In a paradise setting, Angra dos Reis, with feet in the sand and the sea as witness, they celebrated love in front of family and friends. A light day full of emotion and true connection.",
        desc_es: "Él, de Alemania. Ella, de Brasil. Dos mundos, un solo corazón. En un escenario paradisíaco, Angra dos Reis, con los pies en la arena y el mar como testigo, celebraron el amor ante familiares y amigos. Un día ligero, lleno de emoción y conexión real.",
        desc_it: "Lui tedesco, lei brasiliana. Due mondi, un solo battito. Nello splendido scenario di Angra dos Reis, con i piedi sulla sabbia e il mare como testimone, hanno celebrato il loro amore. Una giornata leggera, ricca di calore e sguardi complici.",
        order: 2
    },
    {
        id: "Nicole_Lorenzo",
        videoUrl: "https://video.wixstatic.com/video/2aa4ac_e23404b3dcf64df2ab76638ec3694f7f/1080p/mp4/file.mp4",
        coverUrl: "Nicole_Lorenzo.jpeg",
        badge_pt: "Estilo Documental, São Paulo",
        badge_en: "Documentary Style, São Paulo",
        badge_es: "Estilo Documental, São Paulo",
        badge_it: "Stile Documentario, San Paolo",
        title_pt: "Nicole & Lorenzo",
        title_en: "Nicole & Lorenzo",
        title_es: "Nicole & Lorenzo",
        title_it: "Nicole & Lorenzo",
        desc_pt: "Uma história leve como o vento que tocava o vestido dela. Risos que nasceram da amizade, olhares que amadureceram em amor. Na simplicidade de um lugar aberto, eles disseram sim — com a alma inteira // um filme documental e com muita ambientação.",
        desc_en: "A story as light as the wind touching her dress. Laughter born of friendship, eyes matured into love. In the simplicity of an open place, they said yes - with their whole soul // a documentary film with beautiful atmosphere.",
        desc_es: "Una historia tan ligera como el viento que tocaba su vestido. Risas que nacieron de la amistad, miradas que maduraron en amor. En la sencillez de un espacio abierto, dijeron sí - con toda el alma.",
        desc_it: "Un racconto leggero e naturale, come la brezza che accarezzava il suo vestito. Sorrisi nati dall'amicizia, sguardi cresciuti nel tempo. Nella libertà di uno spazio aperto, si sono promessi amore eterno.",
        order: 3
    },
    {
        id: "Leticia_Lucca",
        videoUrl: "https://video.wixstatic.com/video/2aa4ac_8a73faa15be0403ca5bc92525ebcd6af/1080p/mp4/file.mp4",
        coverUrl: "Leticia_Lucca.jpeg",
        badge_pt: "Cerimônia Completa, Espírito Santo",
        badge_en: "Full Ceremony, Espírito Santo",
        badge_es: "Ceremônia Completa, Espírito Santo",
        badge_it: "Cerimônia Completa, Espírito Santo",
        title_pt: "Letícia & Lucca | Íntegra",
        title_en: "Letícia & Lucca | Full Ceremony",
        title_es: "Letícia & Lucca | Íntegra",
        title_it: "Letícia & Lucca | Integrale",
        desc_pt: "Um dia inesquecível à beira-mar, sob o som suave das ondas e o pôr do sol dourado, Letícia e Lucca celebraram o amor em um cenário de tirar o fôlego. A praia foi palco de uma cerimônia emocionante, repleta de sorrisos, lágrimas de alegria e a presença calorosa de familiares e amigos.",
        desc_en: "An unforgettable day by the sea, under the soft sound of waves and a golden sunset, Letícia and Lucca celebrated love in a breathtaking setting. The beach hosted an emotional ceremony filled with smiles, tears of joy, and warm family presence.",
        desc_es: "Un día inolvidable a la orilla del mar, bajo el suave sonido de las olas y el atardecer dorado, Letícia y Lucca celebraram o amor en un escenario impresionante. La playa fue testigo de una ceremonia emotiva y alegre.",
        desc_it: "Una giornata indimenticabile a rdosso del mare. Sotto le note morbide delle onde e un tramonto dorato, Letícia e Lucca hanno coronato la loro promessa. La spiaggia è stata teatro di forti emozioni.",
        order: 4
    }
];

// Initialize local storage seeds for Demo Mode if not present
function initializeDemoSeeds() {
    if (!localStorage.getItem('phfilme_agenda')) {
        localStorage.setItem('phfilme_agenda', JSON.stringify(defaultAgenda));
    }
    if (!localStorage.getItem('phfilme_plans')) {
        localStorage.setItem('phfilme_plans', JSON.stringify(defaultPlans));
    }
    if (!localStorage.getItem('phfilme_portfolio')) {
        localStorage.setItem('phfilme_portfolio', JSON.stringify(defaultPortfolio));
    }
    if (!localStorage.getItem('phfilme_leads')) {
        localStorage.setItem('phfilme_leads', JSON.stringify([]));
    }
}

if (isDemoMode) {
    initializeDemoSeeds();
}

// --- DATABASE API METHODS ---

// 1. Get Agenda Data
export async function getAgenda() {
    if (isDemoMode) {
        return JSON.parse(localStorage.getItem('phfilme_agenda')) || defaultAgenda;
    } else {
        try {
            const docRef = doc(db, 'config', 'agenda');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // If doc doesn't exist yet, seed Firestore and return default
                await setDoc(docRef, defaultAgenda);
                return defaultAgenda;
            }
        } catch (e) {
            console.error("Firestore error in getAgenda, using default:", e);
            return defaultAgenda;
        }
    }
}

// Update Agenda Data
export async function updateAgenda(year2026, year2027, sectionTitle, year2026Title, year2027Title) {
    const data = { 
        year2026: parseInt(year2026), 
        year2027: parseInt(year2027),
        sectionTitle: sectionTitle || "Agenda de Disponibilidade",
        year2026Title: year2026Title || "Agenda 2026",
        year2027Title: year2027Title || "Agenda 2027"
    };
    if (isDemoMode) {
        const agenda = JSON.parse(localStorage.getItem('phfilme_agenda')) || defaultAgenda;
        const updated = { ...agenda, ...data };
        localStorage.setItem('phfilme_agenda', JSON.stringify(updated));
        return true;
    } else {
        const docRef = doc(db, 'config', 'agenda');
        await setDoc(docRef, data, { merge: true });
        return true;
    }
}

// 2. Get Plans Packages
export async function getPlans() {
    if (isDemoMode) {
        return JSON.parse(localStorage.getItem('phfilme_plans')) || defaultPlans;
    } else {
        try {
            const querySnapshot = await getDocs(collection(db, 'plans'));
            if (!querySnapshot.empty) {
                const list = [];
                querySnapshot.forEach(doc => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                return list;
            } else {
                // Seed Firestore plans
                for (const plan of defaultPlans) {
                    await setDoc(doc(db, 'plans', plan.id), plan);
                }
                return defaultPlans;
            }
        } catch (e) {
            console.error("Firestore error in getPlans, using defaults:", e);
            return defaultPlans;
        }
    }
}

// Update a Single Plan
export async function updatePlan(planId, updatedFields) {
    if (isDemoMode) {
        const plans = JSON.parse(localStorage.getItem('phfilme_plans')) || defaultPlans;
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
            plans[index] = { ...plans[index], ...updatedFields };
            localStorage.setItem('phfilme_plans', JSON.stringify(plans));
            return true;
        }
        return false;
    } else {
        const docRef = doc(db, 'plans', planId);
        await updateDoc(docRef, updatedFields);
        return true;
    }
}

// 3. Get Portfolio Films
export async function getPortfolio() {
    if (isDemoMode) {
        const list = JSON.parse(localStorage.getItem('phfilme_portfolio')) || defaultPortfolio;
        return list.sort((a, b) => a.order - b.order);
    } else {
        try {
            const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const list = [];
                querySnapshot.forEach(doc => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                return list;
            } else {
                // Seed Firestore portfolio
                for (const film of defaultPortfolio) {
                    await setDoc(doc(db, 'portfolio', film.id), film);
                }
                return defaultPortfolio;
            }
        } catch (e) {
            console.error("Firestore error in getPortfolio, using defaults:", e);
            return defaultPortfolio;
        }
    }
}

// Add/Save Portfolio Film
export async function savePortfolioFilm(film) {
    if (isDemoMode) {
        const portfolio = JSON.parse(localStorage.getItem('phfilme_portfolio')) || defaultPortfolio;
        const index = portfolio.findIndex(f => f.id === film.id);
        if (index !== -1) {
            portfolio[index] = { ...portfolio[index], ...film };
        } else {
            portfolio.push(film);
        }
        localStorage.setItem('phfilme_portfolio', JSON.stringify(portfolio));
        return true;
    } else {
        const docRef = doc(db, 'portfolio', film.id);
        await setDoc(docRef, film);
        return true;
    }
}

// Delete Portfolio Film
export async function deletePortfolioFilm(filmId) {
    if (isDemoMode) {
        let portfolio = JSON.parse(localStorage.getItem('phfilme_portfolio')) || defaultPortfolio;
        portfolio = portfolio.filter(f => f.id !== filmId);
        localStorage.setItem('phfilme_portfolio', JSON.stringify(portfolio));
        return true;
    } else {
        const docRef = doc(db, 'portfolio', filmId);
        await deleteDoc(docRef);
        return true;
    }
}

// 4. Save a Lead (Form Submission)
export async function saveLead(leadData) {
    const lead = {
        ...leadData,
        status: 'new',
        timestamp: new Date().toISOString()
    };
    if (isDemoMode) {
        const leads = JSON.parse(localStorage.getItem('phfilme_leads')) || [];
        // Generate random ID for demo
        lead.id = 'lead_' + Math.random().toString(36).substr(2, 9);
        leads.push(lead);
        localStorage.setItem('phfilme_leads', JSON.stringify(leads));
        return lead;
    } else {
        const docRef = await addDoc(collection(db, 'leads'), lead);
        lead.id = docRef.id;
        return lead;
    }
}

// Get All Leads
export async function getLeads() {
    if (isDemoMode) {
        return JSON.parse(localStorage.getItem('phfilme_leads')) || [];
    } else {
        try {
            const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            const list = [];
            querySnapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            return list;
        } catch (e) {
            console.error("Firestore error in getLeads:", e);
            return [];
        }
    }
}

// Update Lead Status
export async function updateLeadStatus(leadId, newStatus) {
    if (isDemoMode) {
        const leads = JSON.parse(localStorage.getItem('phfilme_leads')) || [];
        const index = leads.findIndex(l => l.id === leadId);
        if (index !== -1) {
            leads[index].status = newStatus;
            localStorage.setItem('phfilme_leads', JSON.stringify(leads));
            return true;
        }
        return false;
    } else {
        const docRef = doc(db, 'leads', leadId);
        await updateDoc(docRef, { status: newStatus });
        return true;
    }
}

// Update General Settings
export async function updateGeneralSettings(settings) {
    if (isDemoMode) {
        const agenda = JSON.parse(localStorage.getItem('phfilme_agenda')) || defaultAgenda;
        const updated = { ...agenda, ...settings };
        localStorage.setItem('phfilme_agenda', JSON.stringify(updated));
        return true;
    } else {
        const docRef = doc(db, 'config', 'agenda');
        await setDoc(docRef, settings, { merge: true });
        return true;
    }
}

// =========================================================================
// VIMEO SETTINGS (visibilidade dos vídeos da vitrine)
// =========================================================================
export async function getVimeoSettings() {
    if (isDemoMode) {
        return JSON.parse(localStorage.getItem('phfilme_vimeo')) || { visibleIds: [] };
    } else {
        try {
            const docRef = doc(db, 'config', 'vimeo');
            const snap = await getDoc(docRef);
            if (snap.exists()) return snap.data();
            return { visibleIds: [] };
        } catch (e) {
            console.error('Firestore error in getVimeoSettings:', e);
            return { visibleIds: [] };
        }
    }
}

export async function saveVimeoSettings(visibleIds) {
    const data = { visibleIds };
    if (isDemoMode) {
        localStorage.setItem('phfilme_vimeo', JSON.stringify(data));
        return true;
    } else {
        const docRef = doc(db, 'config', 'vimeo');
        await setDoc(docRef, data);
        return true;
    }
}

// =========================================================================
// USERS CONFIGURATION
// =========================================================================
export async function getUsers() {
    if (isDemoMode) {
        const users = JSON.parse(localStorage.getItem('phfilme_users')) || [
            { id: "demo_admin", email: "admin@phfilme.com", role: "admin" }
        ];
        return users;
    } else {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            return list;
        } catch (e) {
            console.error("Error listing users:", e);
            return [];
        }
    }
}

export async function saveUser(uid, email) {
    const userData = { email, role: 'admin' };
    if (isDemoMode) {
        const users = JSON.parse(localStorage.getItem('phfilme_users')) || [
            { id: "demo_admin", email: "admin@phfilme.com", role: "admin" }
        ];
        // Prevent duplicate
        if (!users.some(u => u.id === uid)) {
            users.push({ id: uid, ...userData });
        }
        localStorage.setItem('phfilme_users', JSON.stringify(users));
        return true;
    } else {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, userData);
        return true;
    }
}

export async function deleteUser(uid) {
    if (isDemoMode) {
        let users = JSON.parse(localStorage.getItem('phfilme_users')) || [
            { id: "demo_admin", email: "admin@phfilme.com", role: "admin" }
        ];
        users = users.filter(u => u.id !== uid);
        localStorage.setItem('phfilme_users', JSON.stringify(users));
        return true;
    } else {
        const docRef = doc(db, 'users', uid);
        await deleteDoc(docRef);
        return true;
    }
}
