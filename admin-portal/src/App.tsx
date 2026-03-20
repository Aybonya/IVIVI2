import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

import { LoginScreen } from './login-screen';
import {
  ADMIN_NOTICES,
  ADMIN_PORTAL_CREDENTIALS,
  CITY_ALERTS,
  SERVICE_REQUESTS,
  type AdminNotice,
  type ComplaintItem,
  type ComplaintPriority,
  type ComplaintStatus,
  type NoticeStatus,
} from './shared-data';
import type { ComposerState, ComplaintQuickFilter, MapIncident, NoticeFilter, PortalView } from './types';
import { sortByCreatedAtDesc } from './utils';
import { Sidebar } from './ui';
import { ComplaintsView } from './views/complaints-view';
import { DashboardView } from './views/dashboard-view';
import { MapView } from './views/map-view';
import { NotificationsView } from './views/notifications-view';
import { ResidentsView } from './views/residents-view';

const STORAGE_KEY = 'alatau-admin-authenticated';
const COMPLAINTS_STORAGE_KEY = 'alatau-admin-complaints';
const NOTICES_STORAGE_KEY = 'alatau-admin-notices';

const EMPTY_COMPOSER: ComposerState = {
  title: '',
  description: '',
  audience: 'Все жители',
  status: 'draft',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [email, setEmail] = useState(ADMIN_PORTAL_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_PORTAL_CREDENTIALS.password);
  const [loginError, setLoginError] = useState('');
  const [activeView, setActiveView] = useState<PortalView>('dashboard');
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => {
    const stored = localStorage.getItem(COMPLAINTS_STORAGE_KEY);

    if (!stored) {
      return SERVICE_REQUESTS;
    }

    try {
      return JSON.parse(stored) as ComplaintItem[];
    } catch {
      return SERVICE_REQUESTS;
    }
  });
  const [notices, setNotices] = useState<AdminNotice[]>(() => {
    const stored = localStorage.getItem(NOTICES_STORAGE_KEY);

    if (!stored) {
      return ADMIN_NOTICES;
    }

    try {
      return JSON.parse(stored) as AdminNotice[];
    } catch {
      return ADMIN_NOTICES;
    }
  });
  const [complaintsSearch, setComplaintsSearch] = useState('');
  const [complaintsStatusFilter, setComplaintsStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [complaintsPriorityFilter, setComplaintsPriorityFilter] = useState<'all' | ComplaintPriority>('all');
  const [complaintsQuickFilter, setComplaintsQuickFilter] = useState<ComplaintQuickFilter>('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [noticeFilter, setNoticeFilter] = useState<NoticeFilter>('all');
  const [showComposer, setShowComposer] = useState(false);
  const [composer, setComposer] = useState<ComposerState>(EMPTY_COMPOSER);
  const [residentSearch, setResidentSearch] = useState('');

  const selectedComplaint = useMemo(
    () => complaints.find((item) => item.id === selectedComplaintId) ?? null,
    [complaints, selectedComplaintId]
  );

  const filteredComplaints = useMemo(() => {
    const query = complaintsSearch.trim().toLowerCase();

    return sortByCreatedAtDesc(complaints).filter((item) => {
      if (complaintsQuickFilter !== 'all' && item.status !== complaintsQuickFilter) {
        return false;
      }

      if (complaintsStatusFilter !== 'all' && item.status !== complaintsStatusFilter) {
        return false;
      }

      if (complaintsPriorityFilter !== 'all' && item.priority !== complaintsPriorityFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [item.id, item.categoryLabel, item.description, item.address, item.author]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [
    complaints,
    complaintsPriorityFilter,
    complaintsQuickFilter,
    complaintsSearch,
    complaintsStatusFilter,
  ]);

  const mapIncidents = useMemo<MapIncident[]>(() => {
    const complaintPoints = sortByCreatedAtDesc(
      complaints.filter(
        (item) =>
          item.status !== 'declined' && ['C-10042', 'C-10041', 'C-10039', 'C-10038'].includes(item.id)
      )
    ).map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.address,
      color: item.markerColor,
      top: item.markerPosition.top,
      left: item.markerPosition.left,
    }));

    const noticePoints = CITY_ALERTS.filter((item) =>
      ['notice-smoke-45', 'notice-road-flooding'].includes(item.id)
    ).map((item, index) => ({
      id: `N-00${index + 1}`,
      title: item.title,
      subtitle: item.address,
      color: item.markerColor,
      top: index === 0 ? '20%' : '61%',
      left: index === 0 ? '63%' : '79%',
    }));

    return [...complaintPoints, ...noticePoints];
  }, [complaints]);

  const complaintsBadge = complaints.filter((item) => item.status === 'new').length;
  const notificationsBadge = notices.filter((item) => item.status === 'active').length;

  useEffect(() => {
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));
  }, [notices]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      email.trim().toLowerCase() !== ADMIN_PORTAL_CREDENTIALS.email ||
      password !== ADMIN_PORTAL_CREDENTIALS.password
    ) {
      setLoginError('Неверный email или пароль.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, '1');
    setLoginError('');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const handleCreateNotice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (composer.title.trim().length < 4 || composer.description.trim().length < 8) {
      return;
    }

    setNotices((current) => [
      {
        id: `N-${String(current.length + 1).padStart(3, '0')}`,
        title: composer.title.trim(),
        description: composer.description.trim(),
        createdAt: new Date().toISOString(),
        audience: composer.audience,
        status: composer.status,
        icon: 'megaphone',
        accentColor: composer.status === 'active' ? '#2A65F7' : '#7A3FF2',
      },
      ...current,
    ]);
    setComposer(EMPTY_COMPOSER);
    setShowComposer(false);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((current) => current.filter((item) => item.id !== id));
  };

  const handleToggleNotice = (id: string) => {
    setNotices((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.status === 'active') {
          return { ...item, status: 'sent' };
        }

        return { ...item, status: 'active' };
      })
    );
  };

  const handleComplaintAssigneeChange = (id: string, assignee: string | null) => {
    setComplaints((current) =>
      current.map((item) => (item.id === id ? { ...item, assignee, status: assignee ? 'inProgress' : item.status } : item))
    );
  };

  const handleComplaintStatusChange = (id: string, status: ComplaintStatus) => {
    setComplaints((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        email={email}
        password={password}
        error={loginError}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <>
      <div className="portal-shell">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          complaintsBadge={complaintsBadge}
          notificationsBadge={notificationsBadge}
          onLogout={handleLogout}
        />

        <main className="page">
          {activeView === 'dashboard' ? (
            <DashboardView complaints={complaints} notices={notices} onNavigate={setActiveView} />
          ) : null}

          {activeView === 'complaints' ? (
            <ComplaintsView
              complaints={filteredComplaints}
              selectedComplaint={selectedComplaint}
              search={complaintsSearch}
              onSearchChange={setComplaintsSearch}
              statusFilter={complaintsStatusFilter}
              priorityFilter={complaintsPriorityFilter}
              quickFilter={complaintsQuickFilter}
              onStatusFilterChange={setComplaintsStatusFilter}
              onPriorityFilterChange={setComplaintsPriorityFilter}
              onQuickFilterChange={setComplaintsQuickFilter}
              onSelectComplaint={(id) => setSelectedComplaintId(id || null)}
              onSetAssignee={handleComplaintAssigneeChange}
              onSetStatus={handleComplaintStatusChange}
            />
          ) : null}

          {activeView === 'notifications' ? (
            <NotificationsView
              notices={notices}
              filter={noticeFilter}
              onFilterChange={setNoticeFilter}
              onCreateOpen={() => setShowComposer(true)}
              onDelete={handleDeleteNotice}
              onToggleStatus={handleToggleNotice}
            />
          ) : null}

          {activeView === 'residents' ? (
            <ResidentsView search={residentSearch} onSearchChange={setResidentSearch} />
          ) : null}

          {activeView === 'map' ? <MapView incidents={mapIncidents} /> : null}
        </main>
      </div>

      {showComposer ? (
        <div className="modal-backdrop" onClick={() => setShowComposer(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <div className="drawer__eyebrow">Новое оповещение</div>
                <h3>Создать уведомление для жителей</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowComposer(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="modal__form" onSubmit={handleCreateNotice}>
              <label>
                <span>Заголовок</span>
                <input
                  value={composer.title}
                  onChange={(event) => setComposer((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Например: Ограничение движения"
                />
              </label>

              <label>
                <span>Описание</span>
                <textarea
                  value={composer.description}
                  onChange={(event) =>
                    setComposer((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Коротко опишите ситуацию для жителей..."
                  rows={5}
                />
              </label>

              <div className="modal__grid">
                <label>
                  <span>Аудитория</span>
                  <select
                    value={composer.audience}
                    onChange={(event) =>
                      setComposer((current) => ({ ...current, audience: event.target.value }))
                    }>
                    <option>Все жители</option>
                    <option>zone_momyshuly</option>
                    <option>zone_alatausky</option>
                    <option>zone_baizakova</option>
                  </select>
                </label>

                <label>
                  <span>Статус</span>
                  <select
                    value={composer.status}
                    onChange={(event) =>
                      setComposer((current) => ({ ...current, status: event.target.value as NoticeStatus }))
                    }>
                    <option value="draft">Черновик</option>
                    <option value="active">Активно</option>
                    <option value="sent">Отправлено</option>
                  </select>
                </label>
              </div>

              <div className="modal__actions">
                <button className="button button--ghost" type="button" onClick={() => setShowComposer(false)}>
                  Отмена
                </button>
                <button className="button button--primary" type="submit">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
