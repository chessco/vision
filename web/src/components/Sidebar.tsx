import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Presentation, MessageSquare, UserPlus, Layers, 
  Folder, Settings, Sparkles, CalendarCheck, FlaskConical
} from 'lucide-react';

export function Sidebar() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/t/${tenantId}/visual/dashboard` },
    { icon: Sparkles, label: 'Crear', path: `/t/${tenantId}/visual/create` },
    { icon: MessageSquare, label: 'Creative Chat', path: `/t/${tenantId}/visual/chat` },
    { icon: UserPlus, label: 'Personajes', path: `/t/${tenantId}/visual/characters` },
    { icon: Layers, label: 'Marcas', path: `/t/${tenantId}/visual/brand` },
    { icon: Folder, label: 'Biblioteca', path: `/t/${tenantId}/visual/library` },
    { icon: Presentation, label: 'Campañas', path: `/t/${tenantId}/visual/campaigns` },
    { icon: CalendarCheck, label: 'Workflow', path: `/t/${tenantId}/visual/workflow` },
    { icon: FlaskConical, label: 'Connectors', path: `/t/${tenantId}/visual/verticals-test` },
  ];

  return (
    <aside className="w-16 lg:w-64 h-screen bg-surface-container-high border-r border-border-subtle flex flex-col transition-all duration-300">
      <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-border-subtle h-16">
        <Sparkles className="text-primary w-6 h-6 shrink-0" />
        <span className="font-headings font-bold text-white hidden lg:block truncate">Pitaya Visual</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-ink-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium hidden lg:block truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <Link
          to={`/t/${tenantId}/visual/settings`}
          title="Configuración"
          className="flex items-center gap-3 p-3 rounded-md text-ink-muted hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium hidden lg:block truncate">Configuración</span>
        </Link>
      </div>
    </aside>
  );
}
