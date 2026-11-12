import {
    LayoutGrid,
    MessageSquare,
    Mail,
    Calendar,
    Ticket,
    Users,
    Building2,
    GraduationCap,
    BarChart3,
    FolderOpen,
    Cpu,
    Zap,
    GitFork,
    ShieldCheck,
    Settings,
} from 'lucide-react';

/**
 * Fuente única de verdad para las secciones/módulos del dashboard.
 * Tanto el Sidebar como "1. Matriz de Permisos por Sección" en Equipo & Roles
 * leen directamente este catálogo para que toda sección nueva quede automáticamente
 * seleccionable bajo "Mostrar" (view_<id>) y sincronizada en navegación.
 */
export const SECCIONES_SISTEMA = [
    {
        id: 'dashboard',
        label: 'Dashboard / Métricas',
        sidebarLabel: 'Dashboard',
        href: '/dashboard',
        navGroup: 'main',
        navOrder: 1,
        exact: true,
        desc: 'Panel principal de estadísticas, ranking de puntos y KPIs en vivo.',
        icon: LayoutGrid,
        badge: 'General',
        badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
        canCrud: false,
        defaultVisible: true,
        defaultCreateEdit: false,
    },
    {
        id: 'messages',
        label: 'Chats & Conversaciones',
        sidebarLabel: 'Mensajes',
        href: '/dashboard/messages',
        navGroup: 'main',
        navOrder: 2,
        desc: 'Bandeja en vivo WhatsApp, handoff IA y respuestas a clientes.',
        icon: MessageSquare,
        badge: 'WhatsApp',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: true,
    },
    {
        id: 'inbox',
        label: 'Bandeja de Entrada (Gmail)',
        sidebarLabel: 'Inbox Correo',
        href: '/dashboard/inbox',
        navGroup: 'main',
        navOrder: 3,
        desc: 'Lectura y despacho de correos electrónicos sincronizados con Google.',
        icon: Mail,
        badge: 'Email',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: false,
    },
    {
        id: 'calendar',
        label: 'Calendario & Google Meet',
        sidebarLabel: 'Calendario & Meet',
        href: '/dashboard/calendar',
        navGroup: 'main',
        navOrder: 4,
        desc: 'Agenda comercial, turnos de Meet, webinars de inducción y eventos.',
        icon: Calendar,
        badge: 'Reuniones',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: true,
    },
    {
        id: 'tickets',
        label: 'Tickets Helpdesk',
        sidebarLabel: 'Tickets Helpdesk',
        href: '/dashboard/tickets',
        navGroup: 'main',
        navOrder: 5,
        desc: 'Mesa de soporte, solicitudes internas, autorizaciones y trazabilidad.',
        icon: Ticket,
        badge: 'Soporte',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: true,
    },
    {
        id: 'crm',
        label: 'Agenda CRM (Contactos & Asesores)',
        sidebarLabel: 'Agenda CRM',
        href: '/dashboard/crm',
        navGroup: 'main',
        navOrder: 6,
        desc: 'Fichas de clientes, inversores, asesores, jerarquías y datos bancarios.',
        icon: Users,
        badge: 'Comercial',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: true,
    },
    {
        id: 'prospectos_b2b',
        label: 'Prospectos B2B (Crawler Playwright)',
        sidebarLabel: 'Prospectos B2B (Crawler)',
        href: '/dashboard/prospectos-b2b',
        navGroup: 'main',
        navOrder: 8,
        badgeText: 'CRAWLER VIVO',
        desc: 'Scraping autónomo de corredores inmobiliarios, filtros y prospección masiva.',
        icon: Building2,
        badge: 'CRAWLER VIVO',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        canCrud: true,
        defaultVisible: true,
        defaultCreateEdit: true,
        legacyViewKey: 'view_crm',
    },
    {
        id: 'academia',
        label: 'Academia & Capacitación',
        sidebarLabel: 'Academia',
        href: '/dashboard/academia',
        navGroup: 'main',
        navOrder: 9,
        desc: 'Cursos internos, clases con seguimiento real, prácticas y tablero de equipo.',
        icon: GraduationCap,
        badge: 'Formación',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        canCrud: false,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
    {
        id: 'campaigns',
        label: 'Campañas Masivas (Meta & Email)',
        sidebarLabel: 'Campañas (Meta & Mail)',
        href: '/dashboard/campaigns',
        navGroup: 'main',
        navOrder: 7,
        desc: 'Envíos masivos por WhatsApp Cloud API y correos con plantillas oficiales.',
        icon: BarChart3,
        badge: 'Marketing',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
    {
        id: 'media',
        label: 'Biblioteca de Medios',
        sidebarLabel: 'Biblioteca de Medios',
        href: '/dashboard/campaigns?tab=media',
        navGroup: 'ops',
        navOrder: 3,
        desc: 'Subida, visualización y gestión de archivos, imágenes y catálogos PDF.',
        icon: FolderOpen,
        badge: 'Archivos',
        badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
        legacyViewKey: 'view_campaigns',
    },
    {
        id: 'models',
        label: 'Router Multi-IA',
        sidebarLabel: 'Router Multi-IA',
        href: '/dashboard/models',
        navGroup: 'ops',
        navOrder: 2,
        desc: 'Modelos de lenguaje (Ollama, Groq, Cerebras, OpenRouter) y fallbacks.',
        icon: Cpu,
        badge: 'Inteligencia',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
    {
        id: 'automation',
        label: 'Automatización & Skills',
        sidebarLabel: 'Automatización',
        href: '/dashboard/automation',
        navGroup: 'ops',
        navOrder: 4,
        desc: 'Disparadores automáticos, reglas de negocio y automatismos de sistema.',
        icon: Zap,
        badge: 'Reglas',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
        legacyViewKey: 'view_flows',
    },
    {
        id: 'flows',
        label: 'Flujos del Bot',
        sidebarLabel: 'Flujos Bot',
        href: '/dashboard/flows',
        navGroup: 'ops',
        navOrder: 5,
        desc: 'Diseñador visual de árboles conversacionales y nodos de respuesta.',
        icon: GitFork,
        badge: 'Bot Engine',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
    {
        id: 'roles',
        label: 'Equipo & Roles',
        sidebarLabel: 'Equipo & Roles',
        href: '/dashboard/roles',
        navGroup: 'ops',
        navOrder: 1,
        desc: 'Administración de usuarios de la empresa, creación y edición de roles.',
        icon: ShieldCheck,
        badge: 'Seguridad',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
    {
        id: 'settings',
        label: 'Configuración de Empresa & Perfil',
        sidebarLabel: 'Configuración',
        href: '/dashboard/user',
        navGroup: 'config',
        navOrder: 1,
        desc: 'Datos institucionales, vinculación de Meta Cloud API y credenciales.',
        icon: Settings,
        badge: 'Ajustes',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        canCrud: true,
        defaultVisible: false,
        defaultCreateEdit: false,
    },
];

/**
 * Determina si una sección está habilitada para "Mostrar" dado un objeto de privilegios,
 * aplicando exactamente la misma lógica en el Sidebar y en la Matriz de Permisos por Sección.
 */
export function isSectionVisible(privs, sectionOrId, { isSuper = false, isSystem = false } = {}) {
    if (isSuper) return true;
    const sec = typeof sectionOrId === 'string'
        ? SECCIONES_SISTEMA.find(s => s.id === sectionOrId)
        : sectionOrId;
    if (!sec) return false;
    if (!privs) return true;

    const viewKey = `view_${sec.id}`;
    if (privs[viewKey] !== undefined) {
        return Boolean(privs[viewKey]);
    }
    if (sec.legacyViewKey && privs[sec.legacyViewKey] !== undefined) {
        return Boolean(privs[sec.legacyViewKey]);
    }
    return Boolean(isSystem || sec.defaultVisible);
}

/**
 * Genera el mapa inicial de privilegios para todas las secciones registradas.
 */
export function getDefaultPrivs(isSuper = false) {
    const privs = {};
    SECCIONES_SISTEMA.forEach(sec => {
        privs[`view_${sec.id}`] = isSuper ? true : Boolean(sec.defaultVisible);
        if (sec.canCrud) {
            privs[`create_${sec.id}`] = isSuper ? true : Boolean(sec.defaultCreateEdit);
            privs[`edit_${sec.id}`] = isSuper ? true : Boolean(sec.defaultCreateEdit);
            privs[`delete_${sec.id}`] = Boolean(isSuper);
        }
    });
    privs.manage_calendar_webinar = isSuper;
    privs.manage_calendar_meet = isSuper;
    privs.manage_calendar_events = isSuper;
    privs.manage_contacts = isSuper;
    privs.manage_tickets = isSuper;
    privs.can_manage_users = isSuper;
    privs.can_manage_roles = isSuper;
    privs.can_manage_social = isSuper;
    privs.can_edit_company = isSuper;
    privs.can_access_support_chats = true;
    privs.can_access_sales_chats = true;
    return privs;
}

/**
 * Devuelve las secciones de un grupo de navegación ordenadas para el Sidebar.
 */
export function getSidebarSections(navGroup) {
    return SECCIONES_SISTEMA
        .filter(sec => sec.navGroup === navGroup)
        .sort((a, b) => (a.navOrder ?? 999) - (b.navOrder ?? 999));
}

