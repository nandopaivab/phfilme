// PHFILME Client Application Logic
// Orchestrates dynamic content rendering, translations, and lead submissions.

import { getAgenda, getPlans, getPortfolio, saveLead } from './data-store.js?v=3';

// Global translation object containing static texts
const translations = {
    pt: {
        "nav-start": "Início",
        "nav-about": "Os Diretores",
        "nav-movies": "Filmes",
        "nav-plans": "Nossos Pacotes",
        "nav-faq": "Dúvidas",
        "nav-cta": "Fale Conosco",
        "hero-pre-title": "Para casais que valorizam histórias",
        "scarcity-header": "Agenda de Disponibilidade",
        "scarcity-subtext": "Limitamos nossa agenda anual para garantir dedicação absoluta e curadoria artística a cada filme.",
        "scarcity-2026": "Agenda 2026",
        "scarcity-2027": "Agenda 2027",
        "scarcity-soldout": "Ocupada",
        "hero-title": "Cada amor tem sua história.<br>A nossa missão é <span class='italic font-light text-gold'>transformá-la em filme</span>.",
        "hero-desc": "Filmes de casamento documentais, atemporais e sensíveis para noivas que valorizam histórias. Sem poses artificiais ou clichês cansativos. Apenas a poesia real do seu dia.",
        "hero-btn-date": "Consultar Disponibilidade de Data",
        "hero-btn-portfolio": "Ver Nosso Portfólio",
        "stats-1-num": "100%",
        "stats-1-lbl": "Narrativa Autoral",
        "stats-2-num": "Pelo Mundo",
        "stats-2-lbl": "Destination Weddings",
        "stats-3-num": "Elegância",
        "stats-3-lbl": "Estética Premium",
        "stats-4-num": "Atendimento",
        "stats-4-lbl": "Limitado e Exclusivo",
        "manifesto-badge": "Nossa Filosofia",
        "manifesto-text": "\"Temos a convicção de que você deseja ver sua história contada de forma única. Nós quebramos o padrão clássico e monótono de gravação, construindo uma narrativa documental e leve.\"",
        "about-badge": "Quem faz a mágica acontecer",
        "about-title": "Os diretores por trás das <br><span class='italic text-gold font-light'>lentes da PHFILME</span>",
        "about-desc": "Uma estrutura especializada para garantir que nenhum detalhe passe despercebido.",
        "t-role-1": "DIRETOR",
        "t-role-2": "DIRETOR",
        "t-role-3": "DIRETOR",
        "t-role-4": "DIRETOR",
        "t-role-5": "EDITOR",
        "about-paragraph-full": "<p>Contamos com uma equipe de diretores criativos experientes que garantem a identidade e o padrão de qualidade da nossa empresa. Com essa estrutura, temos capacidade para atender até 3 eventos simultaneamente, mantendo a excelência em cada entrega.</p><p class='mt-4'>Nossa equipe está conosco há anos e compartilha dos mesmos valores e processos. Além disso, toda a pós-produção é realizada internamente, assegurando controle, consistência e qualidade em cada projeto.</p>",
        "plans-badge": "Investimento",
        "plans-title": "Nossos Pacotes",
        "plans-desc": "Escolha a cobertura que melhor se adapta à complexidade e magnitude do seu grande dia.",
        "p-ouro-title": "Ouro",
        "p-ouro-badge": "Classic",
        "p-ouro-summary": "Ideal para casamentos intimistas de cobertura essencial.",
        "p-diamante-title": "Diamante",
        "p-diamante-badge": "Elite",
        "p-diamante-summary": "A cobertura ideal completa com equipe ampliada e teasers.",
        "p-platinum-title": "Platinum",
        "p-platinum-badge": "Exclusivo",
        "p-platinum-summary": "A experiência máxima e imersiva sem limites de entrega.",
        "p-popular": "Mais Procurado",
        "investment-lbl": "Investimento",
        "costs-included": "*custos logísticos serão definidos sob consulta",
        "btn-details": "Ver Detalhes",
        "btn-select-plan": "Consultar Disponibilidade Desta Coleção",
        "modal-include-title": "O que está incluso:",
        "portfolio-badge": "Galeria Cinematográfica",
        "portfolio-title": "Confira abaixo as histórias que já contamos",
        "portfolio-desc": "Uma sutil curadoria das emoções e destinos incríveis que já tivemos a honra de registrar.",
        "portfolio-btn": "Ver Mais Filmes No YouTube",
        "vimeo-badge": "Produção Própria",
        "vimeo-title": "Vídeos produzidos pela nossa equipe",
        "vimeo-desc": "Cada filmmaker da nossa equipe foi selecionado a dedo e treinado ao longo dos anos para compartilhar da mesma visão, sensibilidade e linguagem cinematográfica que definem o nosso trabalho.",
        "vimeo-btn": "Acessar Vitrine Completa no Vimeo",
        "diff-badge": "Nossa Essência",
        "diff-title": "Como criamos sem clichês",
        "diff-desc": "Temos a convicção de que você deseja ver sua história contada de forma única. Nós quebramos o padrão clássico e monótono de gravação.",
        "diff1-title": "Sem Poses Forçadas",
        "diff1-desc": "Nós conduzimos o dia de forma leve, permitindo que as risadas genuínas e abraços sinceros surjam de forma natural. Nada de poses desconfortáveis.",
        "diff2-title": "Identidade Sonora Livre",
        "diff2-desc": "Evitamos trilhas sonoras clichês. Escolhemos cada trilha em harmonia com os noivos, garantindo total liberdade criativa para a edição cinematográfica dos filmes longos.",
        "diff3-title": "Tecnologia de Última Geração",
        "diff3-desc": "Utilizamos câmeras de cinema e sistemas ópticos de última geração. Isso elimina a necessidade de holofotes invasivos e estruturas pesadas, preservando o design de luz real do ambiente.",
        "diff4-title": "Logística Global",
        "diff4-desc": "Nossa linguagem é global. Temos experiência consolidada em filmagens internacionais em diversos países e estamos preparados com passaportes em mãos para cobrir seu Destination Wedding com perfeição.",
        "review-badge": "Depoimentos",
        "review-title": "O Relato de Quem Já Viveu",
        "review1-text": "\"A melhor escolha do nosso casamento. A equipe nos deixou incrivelmente à vontade durante a filmagem. Quando recebemos o filme, choramos tudo de novo. Parece um filme de cinema!\"",
        "review1-loc": "Casamento na Praia",
        "review2-text": "\"Estávamos com receio de ficar travados na hora, mas com a equipe a energia foi super leve. Eles capturaram detalhes que nem nos demos conta no dia. Trabalho sensacional e impecável.\"",
        "review2-loc": "Casamento no Campo",
        "review3-text": "\"Ficamos apaixonados pela sensibilidade artística. O filme tem ritmo, não cansa, os amigos adoraram ver e a edição de cores ficou simplesmente maravilhosa. Valeu cada centavo.\"",
        "review3-loc": "Casamento Clássico",
        "faq-badge": "Dúvidas Frequentes",
        "faq-title": "Perguntas Que Sempre Nos Fazem",
        "faq5-q": "Vocês fazem algum tipo de roteiro ou alinhamento com o casal?",
        "faq5-a": "<p>Com certeza! Nós não acreditamos em fórmulas prontas. Por isso, realizamos uma reunião de alinhamento estético e conexão profunda semanas antes do casamento.</p><p>Conversamos sobre as expectativas de vocês, os momentos mais importantes, o perfil dos convidados e os detalhes visuais. Esse tratamento especial e sob medida é o que garante que o filme final seja uma verdadeira obra de arte documental, refletindo a alma do casal sem nenhuma interferência artificial no dia.</p>",
        "faq1-q": "Vocês viajam para outros estados ou países?",
        "faq1-a": "Sim! Nós amamos viajar. Nossa base principal é no Espírito Santo e São Paulo, mas já cobrimos casamentos de norte a sul do Brasil e na Europa. Temos uma logística de viagem robusta e estruturada para dar total segurança aos noivos.",
        "faq2-q": "Qual o prazo de entrega do filme final?",
        "faq2-a": "Trabalhamos com um prazo dedicado para garantir que a colorização, o desenho de som e a montagem do ritmo fiquem de altíssimo nível. Geralmente, o prazo é de até 60 dias úteis após o evento, mas enviamos prévias (teasers) antes!",
        "faq3-q": "Quantas pessoas estarão trabalhando no dia?",
        "faq3-a": "Isso varia de acordo com o plano contratado (de 1 a 3 filmmakers). Nossa equipe atua de forma sincronizada, elegante e silenciosa para capturar todos os melhores ângulos de maneira totalmente invisível.",
        "form-badge": "Consulte sua data",
        "form-title": "Fale Conosco",
        "form-desc": "Preencha os detalhes do seu grande dia para receber nossa proposta exclusiva e verificar se temos a data livre.",
        "input-name": "Nome do Casal",
        "input-email": "E-mail de Contato",
        "input-date": "Data Estimada",
        "input-location": "Local / Cidade do Casamento",
        "input-style": "Estilo do Evento",
        "input-venue": "Local exato & Instagram do espaço",
        "input-details": "Conte-nos um pouco sobre os seus planos",
        "input-plan": "Coleção de Interesse",
        "label-plan-details-shortcut": "Ver Detalhes dos Pacotes",
        "opt-plan-ouro": "Coleção Ouro",
        "opt-plan-diamante": "Coleção Diamante",
        "opt-plan-platinum": "Coleção Platinum",
        "opt-1": "Clássico / Igreja / Salão",
        "opt-2": "Campo / Fazenda",
        "opt-3": "Pé na Areia / Praia",
        "opt-4": "Destination Wedding (Fora do Estado/País)",
        "opt-5": "Elopement Wedding / Intimista",
        "btn-submit": "Enviar Proposta",
        "cta-badge": "Vagas Limitadas",
        "cta-title": "Vamos criar seu filme inesquecível?",
        "cta-desc": "As datas mais concorridas do ano costumam preencher com muitos meses de antecedência. Preserve a sua memória da forma que ela merece.",
        "cta-btn": "Iniciar Orçamento Oficial",
        "footer-rights": "Todos os direitos reservados. Brasil.",
        "footer-dev": "Desenvolvido com sofisticação responsiva."
    },
    en: {
        "nav-start": "Home",
        "nav-about": "The Directors",
        "nav-movies": "Films",
        "nav-plans": "Our Packages",
        "nav-faq": "FAQ",
        "nav-cta": "Contact Us",
        "hero-pre-title": "For couples who value stories",
        "scarcity-header": "Availability Schedule",
        "scarcity-subtext": "We limit our yearly availability to ensure absolute dedication and artistic curation for each film.",
        "scarcity-2026": "2026 Schedule",
        "scarcity-2027": "2027 Schedule",
        "scarcity-soldout": "Booked",
        "hero-title": "Every love has its story.<br>Our mission is to <span class='italic font-light text-gold'>turn it into a film</span>.",
        "hero-desc": "Documentary, timeless, and sensitive wedding films for brides who value stories. No artificial poses or boring clichés. Just the pure poetry of your day.",
        "hero-btn-date": "Check Date Availability",
        "hero-btn-portfolio": "View Our Portfolio",
        "stats-1-num": "100%",
        "stats-1-lbl": "Signature Narrative",
        "stats-2-num": "Worldwide",
        "stats-2-lbl": "Destination Weddings",
        "stats-3-num": "Elegance",
        "stats-3-lbl": "Premium Aesthetic",
        "stats-4-num": "Service",
        "stats-4-lbl": "Limited & Exclusive",
        "manifesto-badge": "Our Philosophy",
        "manifesto-text": "\"We are convinced that you want to see your story told in a unique way. We break the classic and monotonous recording template, building a documentary and light narrative.\"",
        "about-badge": "Who makes the magic happen",
        "about-title": "The directors behind <br><span class='italic text-gold font-light'>PHFILME's lenses</span>",
        "about-desc": "A specialized structure to ensure no detail goes unnoticed.",
        "t-role-1": "DIRECTOR",
        "t-role-2": "DIRECTOR",
        "t-role-3": "DIRECTOR",
        "t-role-4": "DIRECTOR",
        "t-role-5": "EDITOR",
        "about-paragraph-full": "<p>We rely on a team of experienced creative directors who guarantee our company's identity and quality standards. With this structure, we have the capacity to serve up to 3 events simultaneously, maintaining excellence in every delivery.</p><p class='mt-4'>Our team has been with us for years and shares the same values and processes. Furthermore, all post-production is done in-house, ensuring control, consistency, and quality in every project.</p>",
        "plans-badge": "Investment",
        "plans-title": "Our Packages",
        "plans-desc": "Choose the coverage that best suits the complexity and scale of your big day.",
        "p-ouro-title": "Gold",
        "p-ouro-badge": "Classic",
        "p-ouro-summary": "Ideal for intimate weddings with essential coverage.",
        "p-diamante-title": "Diamond",
        "p-diamante-badge": "Elite",
        "p-diamante-summary": "The ideal complete coverage with an extended team and teasers.",
        "p-platinum-title": "Platinum",
        "p-platinum-badge": "Exclusive",
        "p-platinum-summary": "The ultimate immersive experience with unlimited deliverables.",
        "p-popular": "Most Popular",
        "investment-lbl": "Investment",
        "costs-included": "*logistics costs will be defined upon inquiry",
        "btn-details": "See Details",
        "btn-select-plan": "Inquire About This Collection",
        "modal-include-title": "What's included:",
        "portfolio-badge": "Cinematic Gallery",
        "portfolio-title": "Check out some of the stories we've told below",
        "portfolio-desc": "A subtle curation of the emotions and amazing destination weddings we have had the honor to capture.",
        "portfolio-btn": "Watch More on YouTube",
        "vimeo-badge": "In-House Production",
        "vimeo-title": "Videos produced by our team",
        "vimeo-desc": "Every filmmaker on our team was hand-picked and trained over the years to share the same vision, sensitivity, and cinematic language that define our work.",
        "vimeo-btn": "View Full Showcase on Vimeo",
        "diff-badge": "Our Essence",
        "diff-title": "Crafting without Clichés",
        "diff-desc": "We believe your story deserves to be told in a unique way. We break the classic, monotonous shooting template.",
        "diff1-title": "No Forced Poses",
        "diff1-desc": "We guide your day lightly, allowing genuine smiles and sincere hugs to happen naturally. No uncomfortable posing.",
        "diff2-title": "Free Sound Identity",
        "diff2-desc": "We avoid cliché soundtracks. We choose each track in absolute synergy with the couple, allowing complete artistic freedom.",
        "diff3-title": "Next-Generation Technology",
        "diff3-desc": "We utilize top-tier cinema cameras and optical setups. This completely removes the need for invasive lighting and bulky rigging, preserving the actual ambient lighting design.",
        "diff4-title": "Global Logistics",
        "diff4-desc": "Our language is global. We have verified recording portfolios worldwide.",
        "review-badge": "Testimonials",
        "review-title": "What Our Couples Say",
        "review1-text": "\"The absolute best choice for our wedding. The team made us feel incredibly comfortable during filming. When we watched the film, we cried all over again. It feels like a real movie!\"",
        "review1-loc": "Beach Wedding",
        "review2-text": "\"We were worried we'd feel stiff, but the team brought such a light energy. They captured details we didn't even notice on the day. Sensational and flawless work.\"",
        "review2-loc": "Country Wedding",
        "review3-text": "\"We fell in love with their artistic touch. The film has rhythm, never gets boring, friends loved watching it, and the color grading is absolutely gorgeous. Truly worth it.\"",
        "review3-loc": "Classic Wedding",
        "faq-badge": "FAQ",
        "faq-title": "Frequently Asked Questions",
        "faq5-q": "Do you draft scripts or meet for aesthetic alignment?",
        "faq5-a": "<p>Absolutely! We don't believe in templates. That's why we carry out a deep aesthetic alignment meeting weeks before. We discuss expectations, visual details, and core people. This bespoke treatment ensures a true documentary artwork.</p>",
        "faq1-q": "Do you travel to other states or countries?",
        "faq1-a": "Yes! We love to travel. While we are based in Brazil, we have filmed weddings all across South America and Europe. We have robust travel logistics to give you absolute peace of mind.",
        "faq2-q": "What is the turnaround time for the film?",
        "faq2-a": "We take dedicated time to ensure color grading, sound design, and pacing are perfect. Typically, delivery is within 60 business days after the wedding, but we send teaser clips earlier!",
        "faq3-q": "How many crew members will be there on our day?",
        "faq3-a": "This depends on the chosen plan (from 1 to 3 filmmakers). Our crew operates seamlessly and quietly to capture every angle invisibly.",
        "form-badge": "Check your date",
        "form-title": "Contact Us",
        "form-desc": "Fill in your wedding details to receive our exclusive proposal and check date availability.",
        "input-name": "Couples' Names",
        "input-email": "Contact Email",
        "input-date": "Estimated Date",
        "input-location": "Wedding Location",
        "input-style": "Wedding Style",
        "input-venue": "Exact location & Instagram of venue",
        "input-details": "Tell us a bit about your plans",
        "input-plan": "Collection of Interest",
        "label-plan-details-shortcut": "View Packages Details",
        "opt-plan-ouro": "Gold Collection",
        "opt-plan-diamante": "Diamond Collection",
        "opt-plan-platinum": "Platinum Collection",
        "opt-1": "Classic / Church / Ballroom",
        "opt-2": "Country / Outdoor Farm",
        "opt-3": "Beachfront / Ocean",
        "opt-4": "Destination Wedding (Out of state/country)",
        "opt-5": "Elopement / Intimate Wedding",
        "btn-submit": "Send Proposal",
        "cta-badge": "Limited Slots",
        "cta-title": "Shall we create your unforgettable film?",
        "cta-desc": "The most requested dates of the season tend to fill up many months in advance. Preserve your legacy the way it deserves.",
        "cta-btn": "Request Official Quote",
        "footer-rights": "All rights reserved. Brazil.",
        "footer-dev": "Designed with responsive sophistication."
    },
    es: {
        "nav-start": "Inicio",
        "nav-about": "Los Directores",
        "nav-movies": "Películas",
        "nav-plans": "Nuestros Paquetes",
        "nav-faq": "Dudas",
        "nav-cta": "Contáctanos",
        "hero-pre-title": "Para parejas que valoran historias",
        "scarcity-header": "Agenda de Disponibilidad",
        "scarcity-subtext": "Limitamos nuestra agenda anual para garantizar dedicación absoluta y curaduría artística a cada película.",
        "scarcity-2026": "Agenda 2026",
        "scarcity-2027": "Agenda 2027",
        "scarcity-soldout": "Ocupada",
        "hero-title": "Cada amor tiene su história.<br>Nuestra misión es <span class='italic font-light text-gold'>transformarla en película</span>.",
        "hero-desc": "Películas de boda documentales, atemporales y sensibles para novias que valoran historias. Sin poses artificiales o clichés aburridos. Solo la poesía real de tu día.",
        "hero-btn-date": "Consultar Disponibilidad de Fecha",
        "hero-btn-portfolio": "Ver Nuestro Portafolio",
        "stats-1-num": "100%",
        "stats-1-lbl": "Narrativa Autoral",
        "stats-2-num": "Por el Mundo",
        "stats-2-lbl": "Destination Weddings",
        "stats-3-num": "Elegancia",
        "stats-3-lbl": "Estética Premium",
        "stats-4-num": "Servicio",
        "stats-4-lbl": "Limitado y Exclusivo",
        "manifesto-badge": "Nuestra Filosofia",
        "manifesto-text": "\"Tenemos la convicción de que deseas ver tu historia contada de forma única. Rompemos el patrón clásico y monótono de filmación, construyendo una narrativa documental y ligera.\"",
        "about-badge": "Quién hace que la magia suceda",
        "about-title": "Los directores detrás de <br><span class='italic text-gold font-light'>las cámaras de PHFILME</span>",
        "about-desc": "Una estructura especializada para asegurar que ningún detalle pase desapercebido.",
        "t-role-1": "DIRECTOR",
        "t-role-2": "DIRECTOR",
        "t-role-3": "DIRECTOR",
        "t-role-4": "DIRECTOR",
        "t-role-5": "EDITOR",
        "about-paragraph-full": "<p>Contamos con un equipo de directores creativos experimentados que garantizan la identidad y el estándar de qualidade de nuestra empresa. Con esta estructura, tenemos capacidad para atender hasta 3 eventos simultáneamente, manteniendo la excelencia en cada entrega.</p><p class='mt-4'>Nuestro equipo nos acompaña desde hace años y comparte los mismos valores y procesos. Además, toda la posproducción se realiza internamente, asegurando control, consistencia y calidad en cada proyecto.</p>",
        "plans-badge": "Inversión",
        "plans-title": "Nuestros Paquetes",
        "plans-desc": "Elige la cobertura que mejor se adapte a la complejidad y magnitud de tu gran día.",
        "p-ouro-title": "Oro",
        "p-ouro-badge": "Classic",
        "p-ouro-summary": "Ideal para bodas íntimas con cobertura esencial.",
        "p-diamante-title": "Diamante",
        "p-diamante-badge": "Elite",
        "p-diamante-summary": "La cobertura ideal completa con equipo ampliado y teasers.",
        "p-platinum-title": "Platinum",
        "p-platinum-badge": "Exclusivo",
        "p-platinum-summary": "La experiencia máxima e inmersiva sin límites de entrega.",
        "p-popular": "Más Solicitado",
        "investment-lbl": "Inversión",
        "costs-included": "*los costos de logística se definirán bajo consulta",
        "btn-details": "Ver Detalles",
        "btn-select-plan": "Consultar Disponibilidade De Esta Colección",
        "modal-include-title": "Qué incluye:",
        "portfolio-badge": "Galería Cinematográfica",
        "portfolio-title": "Mira a continuación las historias que ya hemos contado",
        "portfolio-desc": "Una sutil curaduría de las emociones e destinos increíbles que hemos tenido el honor de registrar.",
        "portfolio-btn": "Ver Más Películas En YouTube",
        "vimeo-badge": "Producción Propia",
        "vimeo-title": "Videos producidos por nuestro equipo",
        "vimeo-desc": "Cada filmmaker de nuestro equipo fue seleccionado a mano y entrenado a lo largo de los años para compartir la misma visión, sensibilidad y lenguaje cinematográfico que definen nuestro trabajo.",
        "vimeo-btn": "Ver Vitrina Completa en Vimeo",
        "diff-badge": "Nossa Essência",
        "diff-title": "Cómo creamos sin clichés",
        "diff-desc": "Tenemos la convicción de que deseas ver tu historia contada de forma única. Rompemos el patrón clásico de filmación.",
        "diff1-title": "Sin Poses Forzadas",
        "diff1-desc": "Guiamos el día de forma ligera, permitiendo que las risas genuinas y abrazos sinceros surjan de forma natural. Sin poses incómodas.",
        "diff2-title": "Identidade Sonora Libre",
        "diff2-desc": "Evitamos bandas sonoras predecibles. Elegimos cada tema en sintonía con la pareja, garantizando total libertad artística.",
        "diff3-title": "Tecnología de Última Generación",
        "diff3-desc": "Utilizamos cameras de cine de formato óptico avanzado. Esto elimina la necesidad de iluminación invasiva, preservando la luz real del lugar.",
        "diff4-title": "Logística Global",
        "diff4-desc": "Nuestra mirada es global. Hemos verificado grabaciones por todo el mundo.",
        "review-badge": "Opiniones",
        "review-title": "El Relato de Quienes Ya lo Vivieron",
        "review1-text": "\"La mejor elección de nuestra boda. El equipo nos hizo sentir increíblemente cómodos. Al ver la película, volvimos a llorar. ¡Parece de cine!\"",
        "review1-loc": "Boda en la Playa",
        "review2-text": "\"Teníamos miedo de vernos tensos, pero con el equipo la energía fue súper ligera. Capturaron detalles que ni notamos ese día. Un trabajo impecable.\"",
        "review2-loc": "Boda de Campo",
        "review3-text": "\"Nos enamoramos de su sensibilidad artística. La película tiene ritmo, no cansa, y la edición de color es simplemente maravillosa. Vale cada centavo.\"",
        "review3-loc": "Boda Clásica",
        "faq-badge": "Dúvidas Frecuentes",
        "faq-title": "Preguntas Que Siempre Nos Hacen",
        "faq5-q": "¿Hacen algún tipo de guion o alineación con la pareja?",
        "faq5-a": "<p>¡Por supuesto! No creemos en fórmulas prediseñadas. Por ello, realizamos una reunión de alineación estética semanas antes de la boda para conversar sobre sus expectativas y detalles visuales.</p>",
        "faq1-q": "¿Viajan a otros estados o países?",
        "faq1-a": "¡Sí! Nos encanta viajar. Nuestra base principal está en Brasil, pero cubrimos bodas por toda América del Sur y Europa con una logística estructurada.",
        "faq2-q": "Qual o prazo de entrega do filme final?",
        "faq2-a": "Trabalhamos com um prazo dedicado para garantir que a colorização, o desenho de som e a montagem do ritmo fiquem de altíssimo nível. Geralmente, o prazo é de até 60 dias úteis após o evento, mas enviamos prévias (teasers) antes!",
        "faq3-q": "¿Cuántas personas estarão trabalhando el día do evento?",
        "faq3-a": "Varía según el plan contratado (de 1 a 3 realizadores). Operamos de forma silenciosa e invisible para capturar los mejores ángulos sin interferir.",
        "form-badge": "Consulta tu fecha",
        "form-title": "Contáctanos",
        "form-desc": "Completa los detalles de tu gran dia para recibir nuestra propuesta exclusiva y verificar la disponibilidad de la fecha.",
        "input-name": "Nombre de la Pareja",
        "input-email": "E-mail de Contacto",
        "input-date": "Fecha Estimada",
        "input-location": "Lugar / Ciudad de la Boda",
        "input-style": "Estilo del Evento",
        "input-venue": "Lugar exacto e Instagram del espacio",
        "input-details": "Cuéntanos un poco sobre tus planes",
        "input-plan": "Colección de Inversión",
        "label-plan-details-shortcut": "Ver Detalles de los Paquetes",
        "opt-plan-ouro": "Colección Oro",
        "opt-plan-diamante": "Colección Diamante",
        "opt-plan-platinum": "Colección Platinum",
        "opt-1": "Clásico / Iglesia / Salão",
        "opt-2": "Campo / Hacienda",
        "opt-3": "Frente al Mar / Playa",
        "opt-4": "Destination Wedding (Fuera de la provincia/país)",
        "opt-5": "Elopement Wedding / Íntimo",
        "btn-submit": "Enviar Propuesta",
        "cta-badge": "Cupos Limitados",
        "cta-title": "¿Creamos tu película inolvidable?",
        "cta-desc": "Las fechas más codiciadas de la temporada suelen reservarse con muchos meses de anticipación. Preserva tu memoria como merece.",
        "cta-btn": "Iniciar Presupuesto Oficial",
        "footer-rights": "Todos los derechos reservados. Brasil.",
        "footer-dev": "Desarrollado con sofisticación responsiva."
    },
    it: {
        "nav-start": "Inizio",
        "nav-about": "I Registi",
        "nav-movies": "Film",
        "nav-plans": "I Nostri Pacchetti",
        "nav-faq": "FAQ",
        "nav-cta": "Contattaci",
        "hero-pre-title": "Per coppie che danno valore alle storie",
        "scarcity-header": "Calendario delle Disponibilità",
        "scarcity-subtext": "Limitiamo le nostre date annuali per garantire dedizione assoluta e cura artistica a ciascun film.",
        "scarcity-2026": "Disponibilità 2026",
        "scarcity-2027": "Disponibilità 2027",
        "scarcity-soldout": "Prenotato",
        "hero-title": "Ogni amore ha la sua storia.<br>La nostra missione é <span class='italic font-light text-gold'>trasformarla in un film</span>.",
        "hero-desc": "Film matrimoniali documentaristici, senza tempo e profondi per spose che apprezzano le storie reali. Nessuna posa forzata o cliché scontentato. Solo la poesia autentica della vostra giornata.",
        "hero-btn-date": "Verifica la Disponibilità",
        "hero-btn-portfolio": "Guarda il Nostro Portfolio",
        "stats-1-num": "100%",
        "stats-1-lbl": "Narrativa d'Autore",
        "stats-2-num": "Nel Mondo",
        "stats-2-lbl": "Destination Weddings",
        "stats-3-num": "Eleganza",
        "stats-3-lbl": "Estetica Premium",
        "stats-4-num": "Servizio",
        "stats-4-lbl": "Limitato ed Esclusivo",
        "manifesto-badge": "La Nostra Filosofia",
        "manifesto-text": "\"Siamo convinti che desideriate vedere la vostra storia raccontata in modo unico. Rompiamo il classico e noioso schema delle riprese tradizionali per creare un documentario leggero e d'impatto.\"",
        "about-badge": "Chi dà vita alla magia",
        "about-title": "I registi dietro <br><span class='italic text-gold font-light'>le lenti di PHFILME</span>",
        "about-desc": "Una struttura specializzata per garantire che nessun dettaglio venga tralasciato.",
        "t-role-1": "DIRETTORE",
        "t-role-2": "DIRETTORE",
        "t-role-3": "DIRETTORE",
        "t-role-4": "DIRETTORE",
        "t-role-5": "EDITORE",
        "about-paragraph-full": "<p>Contiamo su un team di direttori creativi esperti che garantiscono l'identità e gli alti standard qualitativi del nostro marchio. Con questa struttura, siamo in grado di coprire fino a 3 eventi simultaneamente, mantenendo un'eccellenza assoluta in ogni consegna.</p><p class='mt-4'>Il nostro team collabora con noi da anni, condividendo gli stessi valori e metodi di lavoro. Inoltre, l'intera fase di post-produzione viene svolta internamente, assicurando coerenza, controllo e la massima qualità.</p>",
        "plans-badge": "Investimento",
        "plans-title": "I Nostri Pacchetti",
        "plans-desc": "Scegliete la copertura che meglio si adatta alle esigenze e alla grandezza della vostra giornata speciale.",
        "p-ouro-title": "Oro",
        "p-ouro-badge": "Classic",
        "p-ouro-summary": "Ideale per matrimoni intimi con copertura essenziale.",
        "p-diamante-title": "Diamante",
        "p-diamante-badge": "Elite",
        "p-diamante-summary": "La copertura ideale completa con team esteso e teaser.",
        "p-platinum-title": "Platinum",
        "p-platinum-badge": "Esclusivo",
        "p-platinum-summary": "L'esperienza immersiva definitiva senza limiti di consegna.",
        "p-popular": "Il Più Richiesto",
        "investment-lbl": "Investimento",
        "costs-included": "*i costi logistici verranno definiti su richiesta",
        "btn-details": "Vedi Dettagli",
        "btn-select-plan": "Richiedi Informazioni Su Questa Collezione",
        "modal-include-title": "Cosa include:",
        "portfolio-badge": "Galleria Cinematografica",
        "portfolio-title": "Scopri qui sotto le storie che abbiamo raccontato",
        "portfolio-desc": "Una raffinata selezione delle emozioni e delle splendide mete che abbiamo avuto l'onore di immortalare.",
        "portfolio-btn": "Guarda Altri Video Su YouTube",
        "vimeo-badge": "Produzione Interna",
        "vimeo-title": "Video prodotti dal nostro team",
        "vimeo-desc": "Ogni filmmaker del nostro team è stato selezionato a mano e formato nel corso degli anni per condividere la stessa visione, sensibilità e linguaggio cinematografico che definiscono il nostro lavoro.",
        "vimeo-btn": "Visualizza la Vetrina Completa su Vimeo",
        "diff-badge": "La Nostra Essenza",
        "diff-title": "Come creiamo sem clichê",
        "diff-desc": "Siamo convinti che desideriate vedere il vostro giorno raccontato in modo unico, lontano da schemi rigidi.",
        "diff1-title": "Nessuna Posa Forzata",
        "diff1-desc": "Accompagniamo la giornata in punta di piedi, lasciando spazio a risate spontanee e abbracci veri. Niente di finto o preparato.",
        "diff2-title": "Identità Sonora Libera",
        "diff2-desc": "Evitiamo musiche repetitive e già sentite. Ogni brano viene selezionato insieme alla coppia per garantire una narrazione unica.",
        "diff3-title": "Tecnologia d'Avanguardia",
        "diff3-desc": "Utilizziamo moderne cineprese e ottiche d'eccellenza. Questo ci evita fari ingombranti e preserva l'atmosfera luminosa naturale.",
        "diff4-title": "Logistica Globale",
        "diff4-desc": "Parliamo una lingua universale. Copriamo riprese in tutto il mondo con passaporti sempre pronti.",
        "review-badge": "Dicono di Noi",
        "review-title": "Il Racconto di Chi lo Ha Vissuto",
        "review1-text": "\"La scelta migliore del nostro matrimonio. Il team ci ha messi totalmente a nostro agio. Rivedendo il video ci siamo emozionati come quel giorno. Sembra un vero film!\"",
        "review1-loc": "Matrimonio sulla Spiaggia",
        "review2-text": "\"Temevamo di risultare impacciati davanti alla telecamera, mas l'energia della troupe è stata fantastica. Hanno catturato istanti che ci erano sfuggiti. Un lavoro eccellente.\"",
        "review2-loc": "Matrimonio in Campagna",
        "review3-text": "\"Siamo rimasti incantati dalla cura dei dettagli. Il film scorre che è un piacere, gli amici lo adorano e i colori delle riprese sono mozzafiato. Ne vale assolutamente la pena.\"",
        "review3-loc": "Matrimonio Classico",
        "faq-badge": "FAQ",
        "faq-title": "Le Vostre Curiosità",
        "faq5-q": "Definite una scaletta o un orientamento con gli sposi?",
        "faq5-a": "<p>Certamente! Non amiamo i pacchetti standardizzati. Per questo organizziamo un incontro conoscitivo settimane prima per comprendere appieno i vostri gusti e le dinamiche dell'evento.</p>",
        "faq1-q": "Effettuate trasferte in altre regioni o all'estero?",
        "faq1-a": "Sì! Amiamo viaggiare. Pur avendo le nostre basi principali in Brasile, siamo abituati a seguire coppie in tutta Europa ed offriamo piani di viaggio consolidati.",
        "faq2-q": "Quali sono i tempi di consegna per il video finito?",
        "faq2-a": "Lavoriamo con estrema cura su ogni singolo fotogramma, correzione colore e montaggio audio. Di norma la consegna avviene entro 60 giorni lavorativi, ma vi invieremo brevi anteprime molto prima!",
        "faq3-q": "Quanti operatori saranno presenti il giorno del matrimonio?",
        "faq3-a": "Dipende dal piano concordato (da 1 a 3 videomaker). Il nostro team si muove in modo discreto ed elegante per non disturbare i vostri ospiti.",
        "form-badge": "Verifica la tua data",
        "form-title": "Parla con Noi",
        "form-desc": "Inserisci i dettagli del tuo matrimonio per ricevere un piano personalizzato e bloccare la data.",
        "input-name": "Nome della Coppia",
        "input-email": "E-mail di Contatto",
        "input-date": "Data del Matrimonio",
        "input-location": "Luogo / Città",
        "input-style": "Stile dell'Evento",
        "input-venue": "Location e profilo Instagram dello spazio",
        "input-details": "Raccontaci un po' della tua visione",
        "input-plan": "Collezione di Interesse",
        "label-plan-details-shortcut": "Vedi Dettagli dei Pacchetti",
        "opt-plan-ouro": "Collezione Oro",
        "opt-plan-diamante": "Collezione Diamante",
        "opt-plan-platinum": "Collezione Platinum",
        "opt-1": "Classico / Chiesa / Sala",
        "opt-2": "In Campagna / Agriturismo",
        "opt-3": "In Riva al Mare / Spiaggia",
        "opt-4": "Destination Wedding (Fuori regione/all'estero)",
        "opt-5": "Elopement Wedding / Intimo",
        "btn-submit": "Invia Richiesta",
        "cta-badge": "Date Limitate",
        "cta-title": "Creiamo insieme il vostro film unico?",
        "cta-desc": "Le date più richieste della stagione vengono prenotate con molti mesi di anticipo. Assicuratevi il racconto che meritate.",
        "cta-btn": "Inizia a Creare il Tuo Preventivo",
        "footer-rights": "Tutti i diritti riservati. Brasile.",
        "footer-dev": "Sviluppato con raffinata reattività."
    }
};

let currentLang = localStorage.getItem('phfilme-lang') || 'pt';

// Document ready entrypoint
document.addEventListener('DOMContentLoaded', async () => {
    setupScrollProgressBar();
    setupLanguageSelector();
    await loadAllDynamicContent();
    setupProposalForm();
    forceAutoplay();
    loadVimeoShowcase();
});

// 1. Scroll Progress Bar
function setupScrollProgressBar() {
    const progressEl = document.getElementById('scroll-progress');
    if (!progressEl) return;
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressEl.style.width = scrolled + '%';
    });
}

// 2. Language Setup
function setupLanguageSelector() {
    window.toggleLangDropdown = () => {
        document.getElementById('lang-dropdown').classList.toggle('hidden');
    };

    window.addEventListener('click', (e) => {
        const btn = document.getElementById('lang-btn');
        const dropdown = document.getElementById('lang-dropdown');
        if (btn && !btn.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    window.selectLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('phfilme-lang', lang);
        document.getElementById('lang-dropdown').classList.add('hidden');

        const flagMap = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸', it: '🇮🇹' };
        document.getElementById('current-lang-flag').textContent = flagMap[lang];
        document.getElementById('current-lang-label').textContent = lang.toUpperCase();

        translateStaticTexts();
        reRenderDynamicTexts();
    };

    // Trigger initial language set
    window.selectLanguage(currentLang);
}

function translateStaticTexts(skipAnimation = false) {
    const transElements = document.querySelectorAll('[data-translate]');
    transElements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[currentLang] && translations[currentLang][key]) {
            if (el.tagName !== "SELECT" && el.tagName !== "OPTION") {
                if (skipAnimation) {
                    el.innerHTML = translations[currentLang][key];
                } else {
                    el.style.opacity = '0';
                    setTimeout(() => {
                        el.innerHTML = translations[currentLang][key];
                        el.style.opacity = '1';
                    }, 150);
                    el.classList.add('lang-transition');
                }
            } else {
                el.innerHTML = translations[currentLang][key];
            }
        }
    });

    // Translate static titles with custom markup
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && translations[currentLang]['hero-title']) {
        heroTitle.innerHTML = translations[currentLang]['hero-title'];
    }
    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle && translations[currentLang]['about-title']) {
        aboutTitle.innerHTML = translations[currentLang]['about-title'];
    }

    // Placeholders
    const placeHolders = {
        pt: { name: "Ex: Maria & João", loc: "Ex: Palácio Tangará, São Paulo", venue: "Ex: Capela dos Milagres (@capeladosmilagres)", desc: "Adoramos saber detalhes! O estilo do casamento, se haverá festa externa, quantidade de convidados..." },
        en: { name: "E.g., Charlotte & James", loc: "E.g., Amalfi Coast / Italy", venue: "E.g., Villa d'Este (@villadeste)", desc: "We love details! The wedding style, if there's an outdoor party..." },
        es: { name: "Ej: María y Juan", loc: "Ej: Palácio Tangará, São Paulo", venue: "Ej: Capilla de los Milagros (@capilladelosmilagros)", desc: "¡Nos encantan los detalles! El estilo de la boda, si habrá fiesta al aire libre..." },
        it: { name: "Es: Maria e Giovanni", loc: "Es: Costiera Amalfitana / Italia", venue: "Es: Villa d'Este (@villadeste)", desc: "Amiamo conoscere i dettagli! Lo stile del matrimonio, se ci sarà una festa all'aperto..." }
    };
    const ph = placeHolders[currentLang] || placeHolders['pt'];
    document.getElementById('form-name').placeholder = ph.name;
    document.getElementById('form-location').placeholder = ph.loc;
    document.getElementById('form-venue').placeholder = ph.venue;
    document.getElementById('form-message').placeholder = ph.desc;
}

// Global references for dynamic data
let localAgenda = null;
let localPlans = [];
let localPortfolio = [];

async function loadAllDynamicContent() {
    try {
        // Fetch in parallel
        const [agenda, plans, portfolio] = await Promise.all([
            getAgenda(),
            getPlans(),
            getPortfolio()
        ]);

        localAgenda = agenda;
        localPlans = plans;
        localPortfolio = portfolio;

        // Merge customized general settings into translations
        if (localAgenda) {
            const keys = [
                'hero-pre-title',
                'hero-title',
                'hero-desc',
                'hero-btn-date',
                'manifesto-text'
            ];
            const langs = ['pt', 'en', 'es', 'it'];
            langs.forEach(lang => {
                keys.forEach(key => {
                    const dbField = `${key.replace(/-/g, '_')}_${lang}`;
                    if (localAgenda[dbField]) {
                        if (!translations[lang]) translations[lang] = {};
                        translations[lang][key] = localAgenda[dbField];
                    }
                });
            });
        }

        reRenderDynamicTexts();
        translateStaticTexts(true);
    } catch (error) {
        console.error("Error loading dynamic content:", error);
    }
}

function reRenderDynamicTexts() {
    // 1. Render Agenda
    if (localAgenda) {
        // Render Custom Titles
        const sectionTitleEl = document.getElementById('label-agenda-section-title');
        if (sectionTitleEl) {
            sectionTitleEl.textContent = localAgenda.sectionTitle || translations[currentLang]["scarcity-header"];
        }
        const title26El = document.getElementById('label-agenda-2026-title');
        if (title26El) {
            title26El.textContent = localAgenda.year2026Title || translations[currentLang]["scarcity-2026"];
        }
        const title27El = document.getElementById('label-agenda-2027-title');
        if (title27El) {
            title27El.textContent = localAgenda.year2027Title || translations[currentLang]["scarcity-2027"];
        }

        // Render Custom Background Video & Opacity (Supports MP4 & YouTube links)
        const defaultVideo = "https://phfilme.com.br/videos/video_ph.mp4";
        const videoUrl = localAgenda && localAgenda.bgVideoUrl ? localAgenda.bgVideoUrl : defaultVideo;
        const videoOpacity = localAgenda && localAgenda.hero_bg_opacity !== undefined ? localAgenda.hero_bg_opacity : 50;
        updateHeroBackground(videoUrl, videoOpacity);

        const year26Progress = document.getElementById('progress-bar-2026');
        const year26Label = document.getElementById('label-2026-status');
        const year26Width = document.getElementById('progress-width-2026');
        if (year26Progress) {
            year26Progress.style.width = `${localAgenda.year2026}%`;
            if (year26Width) year26Width.textContent = `${localAgenda.year2026}%`;
        }
        if (year26Label) {
            const statusWord = translations[currentLang]["scarcity-soldout"] || "Ocupada";
            year26Label.textContent = `${localAgenda.year2026}% ${statusWord}`;
        }

        const year27Progress = document.getElementById('progress-bar-2027');
        const year27Label = document.getElementById('label-2027-status');
        const year27Width = document.getElementById('progress-width-2027');
        if (year27Progress) {
            year27Progress.style.width = `${localAgenda.year2027}%`;
            if (year27Width) year27Width.textContent = `${localAgenda.year2027}%`;
        }
        if (year27Label) {
            const statusWord = translations[currentLang]["scarcity-soldout"] || "Ocupada";
            year27Label.textContent = `${localAgenda.year2027}% ${statusWord}`;
        }

        // Render Team Members Dynamically
        const teamContainer = document.getElementById('team-container');
        if (teamContainer && localAgenda.team) {
            teamContainer.innerHTML = '';
            localAgenda.team.forEach(member => {
                const roleKey = `role_${currentLang}`;
                const role = member[roleKey] || member.role_pt;
                
                const card = document.createElement('div');
                card.className = "bg-fine-surface border border-fine-border p-5 rounded-2xl text-center space-y-4 hover:border-brand-green transition duration-300 group";
                card.innerHTML = `
                    <div class="relative w-24 h-24 mx-auto overflow-hidden rounded-full border-2 border-gold/60">
                        <img src="${member.imageUrl}" onerror="this.src='ph.jpeg'; this.onerror=function(){ this.style.display='none'; this.nextElementSibling.classList.remove('hidden'); };" alt="${member.name}" class="w-full h-full object-cover scale-[1.5] img-bw-refine">
                        <div class="hidden absolute inset-0 bg-brand-green flex items-center justify-center text-xl font-serif text-gold font-semibold">${member.initials}</div>
                    </div>
                    <div>
                        <h3 class="font-serif text-sm text-fine-text font-semibold uppercase tracking-wider">${member.name}</h3>
                        <p class="text-[10px] text-gold uppercase tracking-widest mt-1">${role}</p>
                    </div>
                `;
                teamContainer.appendChild(card);
            });
        }
    }

    // 2. Render Portfolio
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid && localPortfolio.length > 0) {
        portfolioGrid.innerHTML = '';
        localPortfolio.forEach(film => {
            const title = film[`title_${currentLang}`] || film.title_pt || film.title || '';
            const desc = film[`desc_${currentLang}`] || film.desc_pt || film.desc || '';
            const badge = film[`badge_${currentLang}`] || film.badge_pt || film.badge || '';

            const card = document.createElement('div');
            card.className = "bg-brand-greenDark/40 rounded-xl overflow-hidden border border-brand-green/30 hover:border-gold/50 shadow-2xl transition duration-300 flex flex-col justify-between cursor-pointer group hover-card-lift";
            card.onclick = () => openVideoModal(film.videoUrl);
            card.innerHTML = `
                <div class="relative aspect-video bg-fine-bg overflow-hidden">
                    <img src="${film.coverUrl}" onerror="this.src='https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=640';" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500" alt="${title}">
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/55 transition duration-300">
                        <span class="w-14 h-14 bg-brand-green text-fine-text border border-white/10 rounded-full flex items-center justify-center text-xl shadow-lg shadow-brand-green/50 group-hover:bg-gold group-hover:scale-110 transition duration-300">
                            <i class="fa-solid fa-play ml-1"></i>
                        </span>
                    </div>
                </div>
                <div class="p-6">
                    <span class="text-xs uppercase tracking-widest text-gold font-semibold mb-2 block">${badge}</span>
                    <h3 class="font-serif text-xl text-fine-text mb-2">${title}</h3>
                    <p class="text-fine-muted font-light text-xs leading-relaxed">${desc}</p>
                </div>
            `;
            portfolioGrid.appendChild(card);
        });
    }

    // 3. Render Plans summaries on grid cards & details inside Modals
    if (localPlans.length > 0) {
        localPlans.forEach(plan => {
            const staticSummary = (translations[currentLang] && translations[currentLang][`p-${plan.id}-summary`]) || '';
            let summary = plan[`summary_${currentLang}`];
            
            // If translation is missing or exactly matches PT (meaning it failed to translate and saved fallback), use static translation
            if (!summary || summary === plan.summary_pt) {
                summary = staticSummary || plan.summary_pt || '';
            }
            
            const summaryEl = document.getElementById(`p-${plan.id}-summary-card`);
            if (summaryEl) {
                summaryEl.textContent = summary;
            }

            // Update Modal Content details dynamically
            const modalPriceEl = document.getElementById(`p-${plan.id}-price-el`);
            const priceVal = plan[`price_${currentLang}`] || plan.price_pt || '';
            if (modalPriceEl) {
                modalPriceEl.textContent = priceVal;
            }

            const modalDescLongEl = document.getElementById(`p-${plan.id}-desc-long`);
            const descLongVal = plan[`desc_long_${currentLang}`] || plan.desc_long_pt || '';
            if (modalDescLongEl) {
                modalDescLongEl.textContent = descLongVal;
            }

            // Render Items in Modal
            const itemsUl = document.getElementById(`p-${plan.id}-items-list`);
            const itemsArray = plan[`items_${currentLang}`] || plan.items_pt || [];
            if (itemsUl && itemsArray.length > 0) {
                itemsUl.innerHTML = '';
                itemsArray.forEach(item => {
                    const li = document.createElement('li');
                    li.className = "flex items-start gap-3";
                    li.innerHTML = `<i class="fa-solid fa-check text-gold mt-1 text-xs"></i> <span>${item}</span>`;
                    itemsUl.appendChild(li);
                });
            }
        });
    }
}

// 3. Proposal Form Submit Handler
function setupProposalForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.onsubmit = async (event) => {
        event.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Enviando...`;

        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const rawDate = document.getElementById('form-date').value;
        const location = document.getElementById('form-location').value;
        const venue = document.getElementById('form-venue').value;
        const style = document.getElementById('form-style').value;
        const plan = document.getElementById('form-plan').value;
        const message = document.getElementById('form-message').value;

        const leadData = {
            name,
            email,
            date: rawDate,
            location,
            venue: venue || 'Não informado',
            style,
            plan,
            message: message || 'Não informado'
        };

        try {
            // Save lead to Firebase Firestore (or LocalStorage in Demo Mode)
            await saveLead(leadData);

            // Redirect to WhatsApp
            const planNames = {
                ouro: "Coleção Ouro",
                diamante: "Coleção Diamante",
                platinum: "Coleção Platinum"
            };
            const selectedPlanName = planNames[plan] || plan;

            const baseText = `Olá, Atendimento PHFILME! Solicitei uma proposta pelo site:\n\n` +
                             `*Casal:* ${name}\n*E-mail:* ${email}\n*Data:* ${rawDate}\n` +
                             `*Local:* ${location}\n*Espaço:* ${venue || 'Não informado'}\n` +
                             `*Estilo:* ${style}\n*Plano de Interesse:* ${selectedPlanName}\n*Detalhes:* ${message || 'Não informado'}`;
            
            window.open(`https://wa.me/5511919432604?text=${encodeURIComponent(baseText)}`, '_blank');
            form.reset();
        } catch (error) {
            console.error("Error saving lead proposal:", error);
            alert("Ocorreu um erro ao salvar sua proposta. Redirecionando para o WhatsApp diretamente...");
            // Direct WhatsApp fallback in case of absolute database crash
            window.open(`https://wa.me/5511919432604?text=Olá, tentei enviar uma proposta pelo site mas houve um erro. Meu nome é ${name}.`, '_blank');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    };
}

// 4. Modal Window Event Hooks (Make them global so inline HTML onclick works)
window.scrollToSection = (event, targetId) => {
    if (event) event.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight : 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
};

window.toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.className = 'fa-solid fa-xmark text-2xl';
    } else {
        menu.classList.add('hidden');
        icon.className = 'fa-solid fa-bars text-2xl';
    }
};

window.closeMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        if (icon) icon.className = 'fa-solid fa-bars text-2xl';
    }
};

window.toggleFaq = (id) => {
    const ans = document.getElementById(`faq-ans-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    if (ans.classList.contains('hidden')) {
        ans.classList.remove('hidden');
        icon.className = 'fa-solid fa-minus text-gold';
    } else {
        ans.classList.add('hidden');
        icon.className = 'fa-solid fa-plus text-gold';
    }
};

window.openPlanModal = (planId) => {
    const modal = document.getElementById('plan-modal');
    document.getElementById('plan-content-ouro').classList.add('hidden');
    document.getElementById('plan-content-diamante').classList.add('hidden');
    document.getElementById('plan-content-platinum').classList.add('hidden');
    
    const targetContent = document.getElementById(`plan-content-${planId}`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
    }, 50);
};

window.closePlanModal = () => {
    const modal = document.getElementById('plan-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
};

window.selectPlanAndScroll = (planName) => {
    closePlanModal();
    const selectEl = document.getElementById('form-plan');
    if (selectEl) {
        selectEl.value = planName.toLowerCase();
    }
    setTimeout(() => { scrollToSection(null, '#proposta'); }, 350);
};

window.openVideoModal = (videoUrl) => {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('video-modal-content');
    
    // Helper to extract YouTube Video ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        url = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    
    const youtubeId = getYouTubeId(videoUrl);
    
    if (youtubeId) {
        // Embed YouTube iframe
        videoContainer.innerHTML = `
            <iframe id="modal-video-player" 
                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&showinfo=0&color=white" 
                class="w-full h-full object-cover rounded-lg"
                frameborder="0" 
                allow="autoplay; encrypted-media; fullscreen" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        // Embed HTML5 Video Player
        videoContainer.innerHTML = `
            <video id="modal-video-player" class="w-full h-full object-contain" controls autoplay playsinline>
                <source src="${videoUrl}" type="video/mp4">
            </video>
        `;
    }

    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); }, 50);
};

window.closeVideoModal = () => {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('video-modal-content');
    
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        // Clear the container to stop playback instantly
        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
    }, 300);
};

// 5. Native Video Background Autoplay Compatibility
function forceAutoplay() {
    const bgVideo = document.getElementById('bg-video');
    if (!bgVideo) return;

    bgVideo.setAttribute('muted', 'true');
    bgVideo.setAttribute('playsinline', 'true');
    bgVideo.setAttribute('webkit-playsinline', 'true');
    bgVideo.muted = true;
    bgVideo.playsInline = true;
    bgVideo.loop = true;

    const attemptPlay = () => {
        const playPromise = bgVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                removeInteractionListeners();
            }).catch(err => {
                console.log("Native video autoplay blocked or restricted. Waiting for user scroll/interaction.", err);
            });
        }
    };

    const removeInteractionListeners = () => {
        document.removeEventListener('click', attemptPlay);
        document.removeEventListener('touchstart', attemptPlay);
        document.removeEventListener('scroll', attemptPlay);
        document.removeEventListener('mousemove', attemptPlay);
    };

    document.addEventListener('click', attemptPlay, { passive: true });
    document.addEventListener('touchstart', attemptPlay, { passive: true });
    document.addEventListener('scroll', attemptPlay, { passive: true });
    document.addEventListener('mousemove', attemptPlay, { passive: true });

    attemptPlay();

    bgVideo.addEventListener('loadedmetadata', attemptPlay);
    bgVideo.addEventListener('canplay', attemptPlay);
}

// 6. Smart Hero Background Renderer (Supports MP4 & YouTube links & Opacity)
function updateHeroBackground(videoUrl, opacity) {
    const container = document.getElementById('hero-bg-container');
    if (!container || !videoUrl) return;

    // Apply custom opacity via dark overlay mask (10% video opacity = 90% dark overlay)
    const opacityVal = opacity !== undefined ? opacity : (localAgenda && localAgenda.hero_bg_opacity !== undefined ? localAgenda.hero_bg_opacity : 50);
    const darkMaskOpacity = (1 - (opacityVal / 100)).toFixed(2);
    
    const darkOverlay = document.getElementById('hero-dark-overlay');
    if (darkOverlay) {
        darkOverlay.style.opacity = darkMaskOpacity;
    }

    // Helper to extract YouTube Video ID from any format
    const getYouTubeId = (url) => {
        if (!url) return null;
        url = url.trim();
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYouTubeId(videoUrl);

    if (youtubeId) {
        // If it's a YouTube link, render an optimized background iframe
        const currentIframe = container.querySelector('iframe');
        if (currentIframe && currentIframe.dataset.ytid === youtubeId) {
            return;
        }

        container.innerHTML = `
            <iframe data-ytid="${youtubeId}" 
                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1" 
                class="pointer-events-none select-none border-none" 
                allow="autoplay; encrypted-media">
            </iframe>
        `;
    } else {
        // Standard MP4 video tag
        const currentVideo = container.querySelector('video');
        if (currentVideo) {
            const source = currentVideo.querySelector('source');
            if (source && source.src !== videoUrl) {
                source.src = videoUrl;
                currentVideo.load();
                if (typeof forceAutoplay === 'function') forceAutoplay();
            }
        } else {
            container.innerHTML = `
                <video id="bg-video" autoplay loop muted playsinline webkit-playsinline preload="auto" disableRemotePlayback class="w-full h-full object-cover pointer-events-none select-none">
                    <source src="${videoUrl}" type="video/mp4">
                </video>
            `;
            if (typeof forceAutoplay === 'function') forceAutoplay();
        }
    }
}

// 7. Vimeo Showcase Loader
// Uses PHP proxy to fetch video IDs (avoids CORS), then oEmbed API for thumbnails/titles
const VIMEO_SHOWCASE_ID = '12345001';

async function loadVimeoShowcase() {
    const grid = document.getElementById('vimeo-showcase-grid');
    if (!grid) return;

    try {
        // Step 1: Fetch video IDs from our PHP proxy
        const proxyResponse = await fetch('./vimeo-proxy.php');
        
        let videoIds = [];
        
        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            if (proxyData.success && proxyData.videos.length > 0) {
                videoIds = proxyData.videos;
            }
        }
        
        // If proxy failed or returned no videos, use the showcase embed fallback
        if (videoIds.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full">
                    <div class="aspect-video rounded-xl overflow-hidden border border-fine-border shadow-xl">
                        <iframe src="https://vimeo.com/showcase/${VIMEO_SHOWCASE_ID}/embed" 
                            class="w-full h-full" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
            return;
        }

        // Step 2: Fetch oEmbed data for each video (oEmbed supports CORS)
        const videoPromises = videoIds.map(async (videoId) => {
            try {
                const url = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=640`;
                const response = await fetch(url);
                if (!response.ok) return null;
                const data = await response.json();
                return { id: videoId, ...data };
            } catch {
                return null;
            }
        });

        const videos = (await Promise.all(videoPromises)).filter(v => v !== null);

        if (videos.length === 0) {
            // Fallback to showcase embed
            grid.innerHTML = `
                <div class="col-span-full">
                    <div class="aspect-video rounded-xl overflow-hidden border border-fine-border shadow-xl">
                        <iframe src="https://vimeo.com/showcase/${VIMEO_SHOWCASE_ID}/embed" 
                            class="w-full h-full" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
            return;
        }

        // Step 3: Render individual video cards
        grid.innerHTML = '';
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = "bg-brand-greenDark/40 rounded-xl overflow-hidden border border-brand-green/30 hover:border-gold/50 shadow-2xl transition duration-300 group hover-card-lift cursor-pointer";
            
            // Use higher quality thumbnail
            const thumbUrl = video.thumbnail_url ? video.thumbnail_url.replace(/_\d+x\d+/, '_640x360') : '';
            
            card.innerHTML = `
                <div class="relative aspect-video bg-fine-bg overflow-hidden" onclick="openVimeoVideoModal('${video.id}')">
                    <img src="${thumbUrl || video.thumbnail_url}" 
                         class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500" 
                         alt="${video.title || ''}"
                         onerror="this.src='https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=640';">
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/55 transition duration-300">
                        <span class="w-14 h-14 bg-brand-green text-fine-text border border-white/10 rounded-full flex items-center justify-center text-xl shadow-lg shadow-brand-green/50 group-hover:bg-gold group-hover:scale-110 transition duration-300">
                            <i class="fa-solid fa-play ml-1"></i>
                        </span>
                    </div>
                </div>
                <div class="p-5">
                    <span class="text-xs uppercase tracking-widest text-gold font-semibold mb-1 block">
                        <i class="fa-brands fa-vimeo-v mr-1.5"></i>${video.author_name || 'PHFILME'}
                    </span>
                    <h4 class="font-serif text-lg text-fine-text">${video.title || 'Sem título'}</h4>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading Vimeo showcase:', err);
        // Fallback: embed the full showcase player on error
        grid.innerHTML = `
            <div class="col-span-full">
                <div class="aspect-video rounded-xl overflow-hidden border border-fine-border shadow-xl">
                    <iframe src="https://vimeo.com/showcase/${VIMEO_SHOWCASE_ID}/embed" 
                        class="w-full h-full" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
    }
}

// Open Vimeo video in modal
window.openVimeoVideoModal = (videoId) => {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('video-modal-content');
    
    videoContainer.innerHTML = `
        <iframe id="modal-video-player" 
            src="https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&color=C8A97E" 
            class="w-full h-full rounded-lg"
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); }, 50);
};


