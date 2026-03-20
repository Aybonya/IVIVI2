import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Bell,
  Building2,
  ClipboardList,
  Construction,
  Droplets,
  Flame,
  Info,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Megaphone,
  ShieldAlert,
  Siren,
  Users,
  Wind,
} from 'lucide-react';

import { ADMIN_PROFILE } from './shared-data';
import type { PortalView } from './types';

export const NAV_ITEMS: Array<{
  id: PortalView;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'complaints', label: 'Жалобы', icon: ClipboardList },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'residents', label: 'Жители', icon: Users },
  { id: 'map', label: 'Карта', icon: MapPinned },
];

export function resolveNoticeIcon(name: string) {
  if (name === 'siren') {
    return Siren;
  }

  if (name === 'droplets') {
    return Droplets;
  }

  if (name === 'construction') {
    return Construction;
  }

  if (name === 'megaphone') {
    return Megaphone;
  }

  return Info;
}

export function resolveAlertIcon(name: string) {
  if (name.includes('flame')) {
    return Flame;
  }

  if (name.includes('water')) {
    return Droplets;
  }

  if (name.includes('cloud')) {
    return Wind;
  }

  if (name.includes('shield')) {
    return ShieldAlert;
  }

  return AlertTriangle;
}

export function Sidebar({
  activeView,
  onNavigate,
  complaintsBadge,
  notificationsBadge,
  onLogout,
}: {
  activeView: PortalView;
  onNavigate: (view: PortalView) => void;
  complaintsBadge: number;
  notificationsBadge: number;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <Building2 size={20} />
        </div>
        <div>
          <div className="sidebar__brand-title">Alatau</div>
          <div className="sidebar__brand-subtitle">Портал администрации</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const badge =
            item.id === 'complaints'
              ? complaintsBadge
              : item.id === 'notifications'
                ? notificationsBadge
                : null;

          return (
            <button
              key={item.id}
              className={`sidebar__link ${activeView === item.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => onNavigate(item.id)}>
              <span className="sidebar__link-left">
                <Icon size={18} />
                <span>{item.label}</span>
              </span>
              {badge ? <span className="sidebar__badge">{badge}</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{ADMIN_PROFILE.initials}</div>
          <div>
            <div className="sidebar__user-name">{ADMIN_PROFILE.name}</div>
            <div className="sidebar__user-role">{ADMIN_PROFILE.role}</div>
          </div>
        </div>
        <button className="sidebar__logout" type="button" onClick={onLogout}>
          <LogOut size={16} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page__header">
      <div>
        <h1 className="page__title">{title}</h1>
        <p className="page__subtitle">{subtitle}</p>
      </div>
      {actions ? <div className="page__actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  title,
  value,
  caption,
  accent,
  icon,
}: {
  title: string;
  value: string;
  caption: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <article className="stat-card" style={{ borderColor: accent }}>
      <div className="stat-card__icon" style={{ backgroundColor: `${accent}14`, color: accent }}>
        {icon}
      </div>
      <div className="stat-card__copy">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__title">{title}</div>
        <div className="stat-card__caption">{caption}</div>
      </div>
    </article>
  );
}
