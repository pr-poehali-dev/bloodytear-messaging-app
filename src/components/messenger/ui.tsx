import Icon from '@/components/ui/icon';

export function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  const initials = name.replace(/[^A-Za-zА-Яа-я]/g, '').slice(0, 2).toUpperCase() || name.slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} className="rounded object-cover flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded flex items-center justify-center flex-shrink-0 bg-void-elevated border border-void-border font-orbitron font-bold text-neon-red" style={{ width: size, height: size, fontSize: Math.max(10, size * 0.3) }}>
      {initials}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${status === 'online' ? 'bg-neon-green pulse-online' : status === 'away' ? 'bg-yellow-500' : 'bg-void-border'}`} />;
}

export function NavBtn({ icon, label, active, badge, onClick }: { icon: string; label: string; active: boolean; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className={`relative w-9 h-9 rounded flex items-center justify-center transition-all ${active ? 'bg-neon-red/10 border border-neon-red/50 text-neon-red shadow-neon-red' : 'text-muted-foreground hover:text-white hover:bg-void-elevated border border-transparent'}`}>
      <Icon name={icon} size={16} />
      {badge && badge > 0 ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-white text-xs flex items-center justify-center font-bold shadow-neon-red">{badge > 9 ? '9+' : badge}</span> : null}
    </button>
  );
}

export function CyberInput({ placeholder, value, onChange, icon, type = 'text', onEnter }: {
  placeholder: string; value: string; onChange: (v: string) => void;
  icon?: string; type?: string; onEnter?: () => void;
}) {
  return (
    <div className="relative">
      {icon && <Icon name={icon} size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        className={`w-full bg-void-elevated border border-void-border rounded py-2.5 text-sm font-sans text-white placeholder:text-muted-foreground cyber-input transition-colors ${icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
  );
}

export function SettingRow({ icon, label, value, active }: { icon: string; label: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-void-elevated border border-void-border rounded">
      <div className="w-8 h-8 rounded border border-void-border flex items-center justify-center flex-shrink-0">
        <Icon name={icon} size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white font-sans">{label}</p>
        <p className={`text-xs font-mono ${active ? 'text-neon-green' : 'text-muted-foreground'}`}>{value}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-neon-green pulse-online' : 'bg-void-border'}`} />
    </div>
  );
}
