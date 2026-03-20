import { Plus } from 'lucide-react';

import { NOTICE_STATUS_META, type AdminNotice } from '../shared-data';
import type { NoticeFilter } from '../types';
import { formatDateTime, sortByCreatedAtDesc } from '../utils';
import { PageHeader, resolveNoticeIcon } from '../ui';

export function NotificationsView({
  notices,
  filter,
  onFilterChange,
  onCreateOpen,
  onDelete,
  onToggleStatus,
}: {
  notices: AdminNotice[];
  filter: NoticeFilter;
  onFilterChange: (value: NoticeFilter) => void;
  onCreateOpen: () => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) {
  const filtered = notices.filter((item) => (filter === 'all' ? true : item.status === filter));
  const activeCount = notices.filter((item) => item.status === 'active').length;
  const sentCount = notices.filter((item) => item.status === 'sent').length;
  const draftCount = notices.filter((item) => item.status === 'draft').length;

  return (
    <div className="page__body">
      <PageHeader
        title="Оповещения жителей"
        subtitle={`${activeCount} активных · ${draftCount} черновиков`}
        actions={
          <button className="button button--primary" type="button" onClick={onCreateOpen}>
            <Plus size={16} />
            <span>Создать оповещение</span>
          </button>
        }
      />

      <div className="info-banner">
        Активных оповещений: {activeCount}. Админка использует общий слой данных, на котором построено приложение.
      </div>

      <div className="segment-control">
        {[
          { id: 'all', label: `Все ${notices.length}` },
          { id: 'active', label: `Активные ${activeCount}` },
          { id: 'sent', label: `Отправленные ${sentCount}` },
          { id: 'draft', label: `Черновики ${draftCount}` },
        ].map((item) => (
          <button
            key={item.id}
            className={filter === item.id ? 'is-active' : ''}
            type="button"
            onClick={() => onFilterChange(item.id as NoticeFilter)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="stack-list stack-list--spacious">
        {sortByCreatedAtDesc(filtered).map((item) => {
          const Icon = resolveNoticeIcon(item.icon);

          return (
            <article key={item.id} className="notice-card">
              <div className="notice-card__head">
                <div className="notice-card__main">
                  <div
                    className="notice-card__icon"
                    style={{ backgroundColor: `${item.accentColor}14`, color: item.accentColor }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="notice-card__meta">
                      <span>{formatDateTime(item.createdAt)}</span>
                      <span>{item.audience}</span>
                    </div>
                  </div>
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

              <div className="notice-card__actions">
                <button className="button button--ghost-danger" type="button" onClick={() => onToggleStatus(item.id)}>
                  {item.status === 'active' ? 'Остановить' : item.status === 'draft' ? 'Отправить' : 'Активировать'}
                </button>
                <button className="button button--ghost" type="button" onClick={() => onDelete(item.id)}>
                  Удалить
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
