import { Search, X } from 'lucide-react';

import {
  COMPLAINT_PRIORITY_META,
  COMPLAINT_STATUS_META,
  SERVICE_REQUESTS,
  type ComplaintItem,
  type ComplaintPriority,
  type ComplaintStatus,
} from '../shared-data';
import type { ComplaintQuickFilter } from '../types';
import { formatDateTime, formatRelative } from '../utils';
import { PageHeader } from '../ui';

export function ComplaintsView({
  complaints,
  selectedComplaint,
  search,
  onSearchChange,
  statusFilter,
  priorityFilter,
  quickFilter,
  onStatusFilterChange,
  onPriorityFilterChange,
  onQuickFilterChange,
  onSelectComplaint,
  onSetAssignee,
  onSetStatus,
}: {
  complaints: ComplaintItem[];
  selectedComplaint: ComplaintItem | null;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | ComplaintStatus;
  priorityFilter: 'all' | ComplaintPriority;
  quickFilter: ComplaintQuickFilter;
  onStatusFilterChange: (value: 'all' | ComplaintStatus) => void;
  onPriorityFilterChange: (value: 'all' | ComplaintPriority) => void;
  onQuickFilterChange: (value: ComplaintQuickFilter) => void;
  onSelectComplaint: (id: string) => void;
  onSetAssignee: (id: string, assignee: string | null) => void;
  onSetStatus: (id: string, status: ComplaintStatus) => void;
}) {
  return (
    <div className="page__body">
      <PageHeader title="Жалобы и обращения" subtitle={`${complaints.length} из ${SERVICE_REQUESTS.length} записей`} />

      <section className="toolbar toolbar--dense">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по тексту, адресу, автору..."
          />
        </label>

        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as 'all' | ComplaintStatus)}>
          <option value="all">Все статусы</option>
          <option value="new">Новые</option>
          <option value="inProgress">В работе</option>
          <option value="resolved">Выполнено</option>
          <option value="declined">Отклонено</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => onPriorityFilterChange(event.target.value as 'all' | ComplaintPriority)}>
          <option value="all">Все приоритеты</option>
          <option value="high">Высокий</option>
          <option value="medium">Средний</option>
          <option value="low">Низкий</option>
        </select>

        <div className="segment-control">
          {[
            { id: 'all', label: 'Все' },
            { id: 'new', label: 'Новые' },
            { id: 'inProgress', label: 'В работе' },
            { id: 'resolved', label: 'Готово' },
          ].map((item) => (
            <button
              key={item.id}
              className={quickFilter === item.id ? 'is-active' : ''}
              type="button"
              onClick={() => onQuickFilterChange(item.id as ComplaintQuickFilter)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <article className="surface">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Категория</th>
              <th>Описание</th>
              <th>Адрес</th>
              <th>Автор</th>
              <th>Приоритет</th>
              <th>Статус</th>
              <th>Исполнитель</th>
              <th>Дата</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => (
              <tr key={item.id} className={item.priority === 'high' ? 'table__row--highlight' : ''}>
                <td className="table__link">{item.id}</td>
                <td>{item.categoryLabel}</td>
                <td>{item.description}</td>
                <td>{item.address}</td>
                <td>{item.author}</td>
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
                <td>{item.assignee ?? 'Не назначен'}</td>
                <td>{formatRelative(item.createdAt)}</td>
                <td>
                  <button className="table__action" type="button" onClick={() => onSelectComplaint(item.id)}>
                    Открыть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {selectedComplaint ? (
        <div className="drawer-backdrop" onClick={() => onSelectComplaint('')}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer__header">
              <div>
                <div className="drawer__eyebrow">{selectedComplaint.id}</div>
                <h3>{selectedComplaint.title}</h3>
              </div>
              <button className="icon-button" type="button" onClick={() => onSelectComplaint('')}>
                <X size={18} />
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <span>Категория</span>
                <strong>{selectedComplaint.categoryLabel}</strong>
              </div>
              <div className="detail-card">
                <span>Приоритет</span>
                <strong>{COMPLAINT_PRIORITY_META[selectedComplaint.priority].label}</strong>
              </div>
              <div className="detail-card">
                <span>Автор</span>
                <strong>{selectedComplaint.author}</strong>
              </div>
              <div className="detail-card">
                <span>Адрес</span>
                <strong>{selectedComplaint.address}</strong>
              </div>
            </div>

            <div className="drawer__section">
              <span className="drawer__label">Описание</span>
              <p>{selectedComplaint.description}</p>
            </div>

            <div className="drawer__section">
              <span className="drawer__label">Статус</span>
              <div className="stack-inline">
                <span
                  className="inline-chip"
                  style={{
                    backgroundColor: COMPLAINT_STATUS_META[selectedComplaint.status].background,
                    color: COMPLAINT_STATUS_META[selectedComplaint.status].color,
                  }}>
                  {COMPLAINT_STATUS_META[selectedComplaint.status].label}
                </span>
                <span className="inline-chip">{formatDateTime(selectedComplaint.createdAt)}</span>
              </div>
            </div>

            <div className="drawer__section">
              <span className="drawer__label">Источник</span>
              <p>
                {selectedComplaint.source === 'mobile-report'
                  ? 'Мобильное приложение'
                  : selectedComplaint.source === 'sensor'
                    ? 'Сенсор / камера'
                    : 'Оператор'}
              </p>
            </div>

            <div className="drawer__section">
              <span className="drawer__label">Исполнитель</span>
              <select
                value={selectedComplaint.assignee ?? 'Не назначен'}
                onChange={(event) =>
                  onSetAssignee(
                    selectedComplaint.id,
                    event.target.value === 'Не назначен' ? null : event.target.value
                  )
                }>
                <option>Не назначен</option>
                <option>Ержан М.</option>
                <option>Данияр У.</option>
                <option>Алия К.</option>
              </select>
            </div>

            <div className="drawer__section detail-actions">
              <button
                className="button button--ghost"
                type="button"
                onClick={() => onSetStatus(selectedComplaint.id, 'inProgress')}>
                В работу
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={() => onSetStatus(selectedComplaint.id, 'resolved')}>
                Закрыть
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
