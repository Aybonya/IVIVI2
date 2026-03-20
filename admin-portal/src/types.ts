import type { NoticeStatus } from './shared-data';

export type PortalView = 'dashboard' | 'complaints' | 'notifications' | 'residents' | 'map';
export type ComplaintQuickFilter = 'all' | 'new' | 'inProgress' | 'resolved';
export type NoticeFilter = 'all' | NoticeStatus;

export type ComposerState = {
  title: string;
  description: string;
  audience: string;
  status: NoticeStatus;
};

export type MapIncident = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  top: string;
  left: string;
};
