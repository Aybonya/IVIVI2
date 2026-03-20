import { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Flame,
  Info,
  Megaphone,
  Wrench,
} from 'lucide-react';

import {
  ADMIN_SERVICE_ANALYTICS,
  CITY_ALERTS,
  CITY_STATE_METRICS,
  COMPLAINT_PRIORITY_META,
  COMPLAINT_STATUS_META,
  NOTICE_STATUS_META,
  type AdminNotice,
  type ComplaintItem,
} from '../shared-data';
import type { PortalView } from '../types';
import { formatFullDate, formatRelative, sortByCreatedAtDesc } from '../utils';
import { PageHeader, StatCard, resolveNoticeIcon } from '../ui';

export function DashboardView({
  complaints,
  notices,
  onNavigate,
}: {
  complaints: ComplaintItem[];
  notices: AdminNotice[];
  onNavigate: (view: PortalView) => void;
}) {
  const latestComplaints = useMemo(() => sortByCreatedAtDesc(complaints).slice(0, 5), [complaints]);
  const activeNotices = useMemo(
    () => sortByCreatedAtDesc(notices.filter((item) => item.status === 'active')).slice(0, 3),
    [notices]
  );

  const categoryBreakdown = useMemo(() => {
    const counts = complaints.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.categoryLabel] = (accumulator[item.categoryLabel] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).sort((left, right) => right[1] - left[1]);
  }, [complaints]);

  const activeAlert = CITY_ALERTS.find((item) => item.state === 'active');
  const totalComplaints = complaints.length;
  const newComplaints = complaints.filter((item) => item.status === 'new').length;
  const inProgress = complaints.filter((item) => item.status === 'inProgress').length;
  const resolved = complaints.filter((item) => item.status === 'resolved').length;
  const urgent = complaints.filter((item) => item.priority === 'high').length;
  const activeNoticesCount = notices.filter((item) => item.status === 'active').length;

  return (
    <div className="page__body">
      <PageHeader
        title="Дашборд"
        subtitle={formatFullDate(new Date().toISOString())}
        actions={<div className="live-pill">Обновляется в реальном времени</div>}
      />

      {activeAlert ? (
        <section className="alert-banner">
          <div className="alert-banner__copy">
            <Flame size={18} />
            <strong>{activeAlert.title}</strong>
            <span>{activeAlert.address}</span>
          </div>
          <button className="button button--danger" type="button" onClick={() => onNavigate('map')}>
            Подробнее
          </button>
        </section>
      ) : null}

      <section className="metrics-grid">
        <StatCard
          title="Всего жалоб"
          value={`${totalComplaints}`}
          caption="Во всех каналах"
          accent="#2A65F7"
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          title="Новые"
          value={`${newComplaints}`}
          caption="Требуют обработки"
          accent="#E53935"
          icon={<Info size={20} />}
        />
        <StatCard
          title="В работе"
          value={`${inProgress}`}
          caption="Назначены исполнители"
          accent="#F59E0B"
          icon={<Wrench size={20} />}
        />
        <StatCard
          title="Выполнено"
          value={`${resolved}`}
          caption="Закрыто за период"
          accent="#22A25A"
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          title="Срочные"
          value={`${urgent}`}
          caption="Высокий приоритет"
          accent="#7A3FF2"
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          title="Активных уведомл."
          value={`${activeNoticesCount}`}
          caption="Видны жителям"
          accent="#0F9ACC"
          icon={<Megaphone size={20} />}
        />
        <StatCard
          title="Ср. время ответа"
          value={`${ADMIN_SERVICE_ANALYTICS.averageResponseHours}ч`}
          caption="По обращениям"
          accent="#22A25A"
          icon={<Wrench size={20} />}
        />
        <StatCard
          title="Удовлетворённость"
          value={`${ADMIN_SERVICE_ANALYTICS.satisfactionPercent}%`}
          caption="Оценка жителей"
          accent="#F59E0B"
          icon={<CheckCircle2 size={20} />}
        />
      </section>

      <section className="split-grid">
        <article className="surface">
          <div className="surface__header">
            <h2>Последние жалобы</h2>
            <button className="text-link" type="button" onClick={() => onNavigate('complaints')}>
              Все жалобы
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Категория</th>
                <th>Адрес</th>
                <th>Приоритет</th>
                <th>Статус</th>
                <th>Время</th>
              </tr>
            </thead>
            <tbody>
              {latestComplaints.map((item) => (
                <tr key={item.id}>
                  <td className="table__link">{item.id}</td>
                  <td>{item.categoryLabel}</td>
                  <td>{item.address}</td>
                  <td>
                    <span
                      className="inline-chip"
                      style={{
                        backgroundColor: COMPLAINT_PRIORITY_META[item.priority].background,
                        color: COMPLAINT_PRIORITY_META[item.priority].color,
                      }}>
                      {COMPLAINT_PRIORITY_META[item.priority].label}
                    </span>
                  </td>
                  <td>
                    <span
                      className="inline-chip"
                      style={{
                        backgroundColor: COMPLAINT_STATUS_META[item.status].background,
                        color: COMPLAINT_STATUS_META[item.status].color,
                      }}>
                      {COMPLAINT_STATUS_META[item.status].label}
                    </span>
                  </td>
                  <td>{formatRelative(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="surface">
          <div className="surface__header">
            <h2>Активные оповещения</h2>
            <button className="text-link" type="button" onClick={() => onNavigate('notifications')}>
              Управление
            </button>
          </div>

          <div className="stack-list">
            {activeNotices.map((item) => {
              const Icon = resolveNoticeIcon(item.icon);

              return (
                <div key={item.id} className="notice-row">
                  <div
                    className="notice-row__icon"
                    style={{ backgroundColor: `${item.accentColor}16`, color: item.accentColor }}>
                    <Icon size={20} />
                  </div>
                  <div className="notice-row__copy">
                    <div className="notice-row__title">{item.title}</div>
                    <div className="notice-row__subtitle">{item.description}</div>
                  </div>
                  <span
                    className="inline-chip"
                    style={{
                      backgroundColor: NOTICE_STATUS_META[item.status].background,
                      color: NOTICE_STATUS_META[item.status].color,
                    }}>
                    {NOTICE_STATUS_META[item.status].label}
                  </span>
                </div>
              );
            })}
            <button className="ghost-action" type="button" onClick={() => onNavigate('notifications')}>
              + Создать оповещение
            </button>
          </div>
        </article>
      </section>

      <article className="surface">
        <div className="surface__header">
          <h2>Жалобы по категориям</h2>
          <span className="surface__hint">Данные из общего слоя приложения</span>
        </div>

        <div className="bars">
          {categoryBreakdown.map(([label, count]) => (
            <div key={label} className="bars__row">
              <span>{label}</span>
              <div className="bars__track">
                <div
                  className="bars__fill"
                  style={{
                    width: `${(count / Math.max(...categoryBreakdown.map((item) => item[1]), 1)) * 100}%`,
                  }}
                />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="surface">
        <div className="surface__header">
          <h2>Состояние города</h2>
          <span className="surface__hint">Из вкладки City State</span>
        </div>

        <div className="mini-metrics">
          {CITY_STATE_METRICS.map((metric) => (
            <div key={metric.id} className="mini-metric">
              <div className="mini-metric__top">
                <span>{metric.title}</span>
                <strong style={{ color: metric.color }}>{metric.value}</strong>
              </div>
              <div className="mini-metric__status">
                <span>{metric.unit}</span>
                <strong style={{ color: metric.color }}>{metric.status}</strong>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
