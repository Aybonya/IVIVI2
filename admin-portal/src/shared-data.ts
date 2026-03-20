import {
  ADMIN_INCIDENT_LEGEND,
  ADMIN_NOTICES,
  ADMIN_PORTAL_CREDENTIALS,
  ADMIN_PROFILE,
  ADMIN_SERVICE_ANALYTICS,
  CITY_ALERTS,
  CITY_STATE_METRICS,
  RESIDENT_DIRECTORY,
  SERVICE_REQUESTS,
  type AdminNotice,
  type ComplaintItem,
  type ComplaintPriority,
  type ComplaintStatus,
  type NoticeStatus,
  type ResidentItem,
} from '../../myApp/lib/smart-city-mock';

export {
  ADMIN_INCIDENT_LEGEND,
  ADMIN_NOTICES,
  ADMIN_PORTAL_CREDENTIALS,
  ADMIN_PROFILE,
  ADMIN_SERVICE_ANALYTICS,
  CITY_ALERTS,
  CITY_STATE_METRICS,
  RESIDENT_DIRECTORY,
  SERVICE_REQUESTS,
  type AdminNotice,
  type ComplaintItem,
  type ComplaintPriority,
  type ComplaintStatus,
  type NoticeStatus,
  type ResidentItem,
};

export const COMPLAINT_PRIORITY_META: Record<
  ComplaintPriority,
  { label: string; background: string; color: string }
> = {
  high: {
    label: 'Высокий',
    background: 'rgba(229, 57, 53, 0.12)',
    color: '#D93025',
  },
  medium: {
    label: 'Средний',
    background: 'rgba(245, 158, 11, 0.16)',
    color: '#BA7400',
  },
  low: {
    label: 'Низкий',
    background: 'rgba(53, 168, 83, 0.14)',
    color: '#238A42',
  },
};

export const COMPLAINT_STATUS_META: Record<
  ComplaintStatus,
  { label: string; background: string; color: string }
> = {
  new: {
    label: 'Новая',
    background: 'rgba(255, 77, 79, 0.12)',
    color: '#D93025',
  },
  inProgress: {
    label: 'В работе',
    background: 'rgba(245, 158, 11, 0.16)',
    color: '#BA7400',
  },
  resolved: {
    label: 'Выполнено',
    background: 'rgba(53, 168, 83, 0.14)',
    color: '#238A42',
  },
  declined: {
    label: 'Отклонено',
    background: 'rgba(107, 114, 128, 0.14)',
    color: '#5F6777',
  },
};

export const NOTICE_STATUS_META: Record<
  NoticeStatus,
  { label: string; background: string; color: string }
> = {
  active: {
    label: 'Активно',
    background: 'rgba(255, 77, 79, 0.12)',
    color: '#D93025',
  },
  sent: {
    label: 'Отправлено',
    background: 'rgba(53, 168, 83, 0.14)',
    color: '#238A42',
  },
  draft: {
    label: 'Черновик',
    background: 'rgba(107, 114, 128, 0.12)',
    color: '#5F6777',
  },
};

export const RESIDENT_STATUS_META = {
  active: {
    label: 'Активен',
    background: 'rgba(53, 168, 83, 0.14)',
    color: '#238A42',
  },
  inactive: {
    label: 'Неактивен',
    background: 'rgba(107, 114, 128, 0.12)',
    color: '#5F6777',
  },
} as const;
