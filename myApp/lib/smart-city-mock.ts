export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type CityMetric = {
  id: string;
  title: string;
  value: string;
  unit: string;
  status: string;
  color: string;
  progress: number;
};

export type AlertState = 'active' | 'monitoring' | 'resolved';

export type AlertItem = {
  id: string;
  title: string;
  address: string;
  distanceText: string;
  timeText: string;
  state: AlertState;
  badgeText: string;
  badgeColor: string;
  badgeBackground: string;
  icon: string;
  markerColor: string;
  markerPosition: {
    top: string;
    left: string;
  };
  coordinate: MapCoordinate;
};

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
  own?: boolean;
};

export type ReportCategory = {
  id: string;
  label: string;
  icon: string;
};

export type GuessRound = {
  id: string;
  clueTitle: string;
  clueText: string;
  correctOption: string;
  options: string[];
};

export type ResidentStatus = 'active' | 'inactive';

export type ResidentItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  joinedAt: string;
  status: ResidentStatus;
  complaintsCount: number;
  zone: string;
};

export type ComplaintPriority = 'high' | 'medium' | 'low';
export type ComplaintStatus = 'new' | 'inProgress' | 'resolved' | 'declined';

export type ComplaintItem = {
  id: string;
  title: string;
  categoryId: string;
  categoryLabel: string;
  description: string;
  address: string;
  author: string;
  authorId: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignee: string | null;
  createdAt: string;
  zone: string;
  source: 'mobile-report' | 'sensor' | 'operator';
  markerColor: string;
  markerPosition: {
    top: string;
    left: string;
  };
};

export type NoticeStatus = 'active' | 'sent' | 'draft';

export type AdminNotice = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  audience: string;
  status: NoticeStatus;
  icon: string;
  accentColor: string;
  linkedAlertId?: string;
};

export const CITY_STATE_METRICS: CityMetric[] = [
  {
    id: 'air',
    title: 'Качество воздуха',
    value: '42',
    unit: 'AQI',
    status: 'Хорошее',
    color: '#34C759',
    progress: 0.42,
  },
  {
    id: 'dust',
    title: 'Уровень пыли',
    value: '67',
    unit: 'мкг/м³',
    status: 'Умеренно',
    color: '#FF9500',
    progress: 0.67,
  },
  {
    id: 'seismic',
    title: 'Сейсмо',
    value: '21',
    unit: 'балл',
    status: 'Спокойно',
    color: '#1677FF',
    progress: 0.21,
  },
  {
    id: 'humidity',
    title: 'Влажность',
    value: '73%',
    unit: '',
    status: 'Норма',
    color: '#34C759',
    progress: 0.73,
  },
];

export const CITY_LAYER_LEGEND = [
  { id: 'parks', label: 'Парковые зоны', color: '#34C759' },
  { id: 'construction', label: 'Опасная стройка', color: '#FF453A' },
  { id: 'seismic', label: 'Сейсм. активность', color: '#FF9500' },
];

export const CITY_STATE_SUMMARY = [
  { id: 'parks', label: 'Парков', value: '14', color: '#34C759' },
  { id: 'risk-zones', label: 'Зон риска', value: '3', color: '#FF453A' },
  { id: 'seismic-zones', label: 'Сейсм. зоны', value: '2', color: '#FF9500' },
];

export const CITY_ALERTS: AlertItem[] = [
  {
    id: 'notice-smoke-45',
    title: 'Задымление, камера #45',
    address: 'ул. Алтын Орда, 12 · 2.3 км',
    distanceText: '2.3 км',
    timeText: '11:05',
    state: 'active',
    badgeText: 'Обрабатывается',
    badgeColor: '#FF5A36',
    badgeBackground: 'rgba(255, 90, 54, 0.14)',
    icon: 'flame-outline',
    markerColor: '#FF453A',
    markerPosition: { top: '14%', left: '23%' },
    coordinate: { latitude: 43.2552, longitude: 76.8554 },
  },
  {
    id: 'notice-road-flooding',
    title: 'Подтопление дороги',
    address: 'пр. Алатауский, 5 · 4.1 км',
    distanceText: '4.1 км',
    timeText: '10:47',
    state: 'monitoring',
    badgeText: 'Мониторинг',
    badgeColor: '#FF9500',
    badgeBackground: 'rgba(255, 149, 0, 0.12)',
    icon: 'water-outline',
    markerColor: '#1677FF',
    markerPosition: { top: '38%', left: '7%' },
    coordinate: { latitude: 43.2494, longitude: 76.8352 },
  },
  {
    id: 'notice-crossroad-crash',
    title: 'ДТП на перекрёстке',
    address: 'ул. Момышулы, 89 · 1.7 км',
    distanceText: '1.7 км',
    timeText: '10:12',
    state: 'resolved',
    badgeText: 'Ликвидировано',
    badgeColor: '#34C759',
    badgeBackground: 'rgba(52, 199, 89, 0.14)',
    icon: 'shield-half-outline',
    markerColor: '#5856D6',
    markerPosition: { top: '58%', left: '68%' },
    coordinate: { latitude: 43.2437, longitude: 76.8855 },
  },
  {
    id: 'notice-high-dust',
    title: 'Высокий уровень пыли',
    address: 'Зона ул. Байтерек · 0.9 км',
    distanceText: '0.9 км',
    timeText: '09:55',
    state: 'monitoring',
    badgeText: 'Внимание',
    badgeColor: '#FF9500',
    badgeBackground: 'rgba(255, 149, 0, 0.12)',
    icon: 'cloudy-outline',
    markerColor: '#FF9500',
    markerPosition: { top: '32%', left: '57%' },
    coordinate: { latitude: 43.2479, longitude: 76.8684 },
  },
  {
    id: 'notice-river-level',
    title: 'Уровень реки повышен',
    address: 'Малая Алматинка · 6.8 км',
    distanceText: '6.8 км',
    timeText: '09:20',
    state: 'monitoring',
    badgeText: 'Мониторинг',
    badgeColor: '#FF9500',
    badgeBackground: 'rgba(255, 149, 0, 0.12)',
    icon: 'water-outline',
    markerColor: '#0A84FF',
    markerPosition: { top: '71%', left: '36%' },
    coordinate: { latitude: 43.2359, longitude: 76.9012 },
  },
];

export const PROFILE_COMMUNITY_ITEMS = [
  {
    id: 'chat',
    title: 'Чат жителей Алатау',
    subtitle: '12 новых сообщений',
    icon: 'chatbubble-ellipses-outline',
    badge: '12',
  },
  {
    id: 'report',
    title: 'Сообщить о проблеме',
    subtitle: 'Отправить заявку в акимат',
    icon: 'megaphone-outline',
  },
  {
    id: 'rating',
    title: 'Рейтинг активности',
    subtitle: 'Посмотреть свой прогресс',
    icon: 'trophy-outline',
  },
];

export const PROFILE_SETTINGS_ITEMS = [
  { id: 'notifications', title: 'Уведомления', icon: 'notifications-outline' },
  { id: 'language', title: 'Язык / Тіл', icon: 'language-outline' },
  { id: 'accessibility', title: 'Спец. возможности', icon: 'accessibility-outline' },
];

export const PROFILE_EMERGENCY_ITEMS = [
  { id: 'fire', title: 'Пожарная - 101', icon: 'flame-outline', tone: '#FF453A' },
  { id: 'ambulance', title: 'Скорая - 103', icon: 'medkit-outline', tone: '#FF453A' },
  { id: 'single', title: 'Единый: 112', icon: 'call-outline', tone: '#FF453A' },
];

export const COMMUNITY_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    author: 'Гульнара А.',
    text: 'Добрый день! На ул. Момышулы яма.',
    time: '10:32',
  },
  {
    id: 'm2',
    author: 'Ержан К.',
    text: 'Уже сообщил в акимат.',
    time: '10:35',
  },
  {
    id: 'm3',
    author: 'Вы',
    text: 'Спасибо за информацию!',
    time: '10:40',
    own: true,
  },
  {
    id: 'm4',
    author: 'Айгерим С.',
    text: 'Субботник в парке сегодня в 10:00.',
    time: '11:01',
  },
];

export const REPORT_CATEGORIES: ReportCategory[] = [
  { id: 'pothole', label: 'Яма', icon: 'ellipse-outline' },
  { id: 'light', label: 'Нет света', icon: 'bulb-outline' },
  { id: 'trash', label: 'Мусор', icon: 'trash-outline' },
  { id: 'construction', label: 'Стройка', icon: 'construct-outline' },
  { id: 'pipe', label: 'Труба', icon: 'water-outline' },
  { id: 'other', label: 'Другое', icon: 'document-text-outline' },
];

export const QUICK_ACCESSIBILITY_ACTIONS = [
  { id: 'risk', label: 'Риск', icon: 'flame-outline' },
  { id: 'route', label: 'Маршрут', icon: 'bus-outline' },
  { id: 'air', label: 'Воздух', icon: 'leaf-outline' },
];

export const CITY_MAP_NODES: Array<{
  id: string;
  label: string;
  color: string;
  coordinate: MapCoordinate;
}> = [
  {
    id: 'node-1',
    label: 'Центр',
    color: '#1677FF',
    coordinate: { latitude: 43.2381, longitude: 76.9113 },
  },
  {
    id: 'node-2',
    label: 'Парк',
    color: '#34C759',
    coordinate: { latitude: 43.2453, longitude: 76.8891 },
  },
  {
    id: 'node-3',
    label: 'Риск',
    color: '#FF9500',
    coordinate: { latitude: 43.2549, longitude: 76.9302 },
  },
];

export const GUESS_ALATAU_ROUNDS: GuessRound[] = [
  {
    id: 'round-1',
    clueTitle: 'Раунд 1',
    clueText: 'Широкая прогулочная улица, рядом деревянные лавочки и исторические фасады.',
    correctOption: 'Panfilov Promenade',
    options: ['Panfilov Promenade', 'Alatau Arena', 'MEGA Park', 'Family Park'],
  },
  {
    id: 'round-2',
    clueTitle: 'Раунд 2',
    clueText: 'Большой спортивный комплекс и открытая площадка рядом.',
    correctOption: 'Alatau Arena',
    options: ['Sairan Lake Walk', 'Alatau Arena', 'Tech Hub', 'Panfilov Promenade'],
  },
  {
    id: 'round-3',
    clueTitle: 'Раунд 3',
    clueText: 'Озеро, прогулочная набережная и открытый вид на воду.',
    correctOption: 'Sairan Lake Walk',
    options: ['MEGA Park', 'Sairan Lake Walk', 'Family Park', 'Panfilov Promenade'],
  },
  {
    id: 'round-4',
    clueTitle: 'Раунд 4',
    clueText: 'Много зелени, аттракционы и семейные выходные вокруг.',
    correctOption: 'Family Park',
    options: ['Family Park', 'Alatau Tech Hub', 'Alatau Arena', 'MEGA Park'],
  },
  {
    id: 'round-5',
    clueTitle: 'Раунд 5',
    clueText: 'Современный коммерческий кластер с магазинами и городским потоком.',
    correctOption: 'MEGA Park',
    options: ['Panfilov Promenade', 'MEGA Park', 'Sairan Lake Walk', 'Family Park'],
  },
];

export const GUESS_ALATAU_LEADERBOARD = [
  { id: 'p1', name: 'Аружан', score: 460 },
  { id: 'p2', name: 'Нурсултан', score: 430 },
  { id: 'p3', name: 'Тимур', score: 390 },
  { id: 'p4', name: 'Сая', score: 355 },
];

export const ADMIN_PORTAL_CREDENTIALS = {
  email: 'admin@alatau.kz',
  password: 'admin123',
};

export const ADMIN_PROFILE = {
  name: 'Алия Каримова',
  role: 'Администратор',
  initials: 'AK',
};

export const ADMIN_SERVICE_ANALYTICS = {
  averageResponseHours: 4.2,
  satisfactionPercent: 87,
};

export const RESIDENT_DIRECTORY: ResidentItem[] = [
  {
    id: 'R-001',
    fullName: 'Айбек Сейтқали',
    phone: '+7 777 123 4567',
    email: 'aibek@alatau.kz',
    address: 'ул. Момышулы, 89, кв. 12',
    joinedAt: '2023-05-10',
    status: 'active',
    complaintsCount: 3,
    zone: 'momyshuly',
  },
  {
    id: 'R-002',
    fullName: 'Гульнара Ахметова',
    phone: '+7 701 987 6543',
    email: 'gulnara@alatau.kz',
    address: 'пр. Алатауский, 12, кв. 34',
    joinedAt: '2023-02-14',
    status: 'active',
    complaintsCount: 5,
    zone: 'alatausky',
  },
  {
    id: 'R-003',
    fullName: 'Нурлан Байжанов',
    phone: '+7 705 555 0011',
    email: 'nurlan@alatau.kz',
    address: 'мкр. Думан, д. 5, кв. 7',
    joinedAt: '2023-08-22',
    status: 'active',
    complaintsCount: 1,
    zone: 'duman',
  },
  {
    id: 'R-004',
    fullName: 'Дина Сейтова',
    phone: '+7 747 222 3344',
    email: 'dina@alatau.kz',
    address: 'ул. Байзакова, 34, кв. 19',
    joinedAt: '2022-11-30',
    status: 'active',
    complaintsCount: 4,
    zone: 'baizakova',
  },
  {
    id: 'R-005',
    fullName: 'Серик Токтаров',
    phone: '+7 771 444 5566',
    email: 'serik@alatau.kz',
    address: 'ул. Алтын Орда, 7, кв. 3',
    joinedAt: '2024-01-05',
    status: 'active',
    complaintsCount: 2,
    zone: 'altyn-orda',
  },
];

export const SERVICE_REQUESTS: ComplaintItem[] = [
  {
    id: 'C-10042',
    title: 'Яма на дороге',
    categoryId: 'pothole',
    categoryLabel: 'Яма на дороге',
    description: 'Большая яма на ул. Момышулы 89, опасно для машин и самокатов.',
    address: 'ул. Момышулы, 89',
    author: 'Айбек С.',
    authorId: 'R-001',
    priority: 'high',
    status: 'new',
    assignee: null,
    createdAt: '2026-03-19T11:05:00+05:00',
    zone: 'momyshuly',
    source: 'mobile-report',
    markerColor: '#E53935',
    markerPosition: { top: '16%', left: '18%' },
  },
  {
    id: 'C-10041',
    title: 'Нет освещения',
    categoryId: 'light',
    categoryLabel: 'Нет освещения',
    description: 'Три фонаря не работают на пр. Алатауский, участок плохо освещён.',
    address: 'пр. Алатауский, 12',
    author: 'Гульнара А.',
    authorId: 'R-002',
    priority: 'medium',
    status: 'inProgress',
    assignee: 'Ержан М.',
    createdAt: '2026-03-19T10:47:00+05:00',
    zone: 'alatausky',
    source: 'mobile-report',
    markerColor: '#E68A00',
    markerPosition: { top: '28%', left: '36%' },
  },
  {
    id: 'C-10040',
    title: 'Мусор',
    categoryId: 'trash',
    categoryLabel: 'Мусор',
    description: 'Контейнеры переполнены уже 3 дня, мусор разлетается по двору.',
    address: 'мкр. Думан, д. 5',
    author: 'Нурлан Б.',
    authorId: 'R-003',
    priority: 'low',
    status: 'resolved',
    assignee: 'Алия К.',
    createdAt: '2026-03-17T08:40:00+05:00',
    zone: 'duman',
    source: 'mobile-report',
    markerColor: '#35A853',
    markerPosition: { top: '62%', left: '57%' },
  },
  {
    id: 'C-10039',
    title: 'Опасная стройка',
    categoryId: 'construction',
    categoryLabel: 'Опасная стройка',
    description: 'Стройка без ограждения, дети играют рядом. Нужно закрыть доступ.',
    address: 'ул. Байзакова, 34',
    author: 'Дина С.',
    authorId: 'R-004',
    priority: 'high',
    status: 'new',
    assignee: null,
    createdAt: '2026-03-19T10:12:00+05:00',
    zone: 'baizakova',
    source: 'mobile-report',
    markerColor: '#E53935',
    markerPosition: { top: '44%', left: '44%' },
  },
  {
    id: 'C-10038',
    title: 'Прорыв трубы',
    categoryId: 'pipe',
    categoryLabel: 'Прорыв трубы',
    description: 'Вода течёт из-под асфальта уже 2 часа, образуется наледь.',
    address: 'ул. Алтын Орда, 7',
    author: 'Серик Т.',
    authorId: 'R-005',
    priority: 'high',
    status: 'inProgress',
    assignee: 'Данияр У.',
    createdAt: '2026-03-19T09:58:00+05:00',
    zone: 'altyn-orda',
    source: 'mobile-report',
    markerColor: '#7A3FF2',
    markerPosition: { top: '58%', left: '25%' },
  },
  {
    id: 'C-10037',
    title: 'Нет освещения',
    categoryId: 'light',
    categoryLabel: 'Нет освещения',
    description: 'Весь квартал без света с вечера, движение во дворе опасное.',
    address: 'мкр. Байтерек',
    author: 'Айгерим Н.',
    authorId: 'R-002',
    priority: 'medium',
    status: 'resolved',
    assignee: 'Ержан М.',
    createdAt: '2026-03-17T19:25:00+05:00',
    zone: 'baiterek',
    source: 'operator',
    markerColor: '#E68A00',
    markerPosition: { top: '75%', left: '18%' },
  },
  {
    id: 'C-10036',
    title: 'Яма на дороге',
    categoryId: 'pothole',
    categoryLabel: 'Яма на дороге',
    description: 'Яма после ремонта стала больше, требуется срочное перекрытие.',
    address: 'ул. Момышулы, 12',
    author: 'Болат Ж.',
    authorId: 'R-001',
    priority: 'medium',
    status: 'new',
    assignee: null,
    createdAt: '2026-03-15T14:15:00+05:00',
    zone: 'momyshuly',
    source: 'mobile-report',
    markerColor: '#E53935',
    markerPosition: { top: '18%', left: '56%' },
  },
  {
    id: 'C-10035',
    title: 'Мусор',
    categoryId: 'trash',
    categoryLabel: 'Мусор',
    description: 'Стихийная свалка у гаражей, мешки лежат прямо на проезде.',
    address: 'ул. Байзакова, 90',
    author: 'Камила Р.',
    authorId: 'R-004',
    priority: 'low',
    status: 'declined',
    assignee: 'Алия К.',
    createdAt: '2026-03-14T11:00:00+05:00',
    zone: 'baizakova',
    source: 'operator',
    markerColor: '#6B7280',
    markerPosition: { top: '82%', left: '70%' },
  },
];

export const ADMIN_NOTICES: AdminNotice[] = [
  {
    id: 'N-001',
    title: 'Задымление на ул. Алтын Орда',
    description: 'Камера #45 зафиксировала дым. Пожарные выехали.',
    createdAt: '2026-03-19T11:05:00+05:00',
    audience: 'Все жители',
    status: 'active',
    icon: 'siren',
    accentColor: '#E53935',
    linkedAlertId: 'notice-smoke-45',
  },
  {
    id: 'N-002',
    title: 'Подтопление дороги',
    description: 'пр. Алатауский, 5 - уровень воды повышен.',
    createdAt: '2026-03-19T10:47:00+05:00',
    audience: 'Все жители',
    status: 'active',
    icon: 'droplets',
    accentColor: '#0B76FF',
    linkedAlertId: 'notice-road-flooding',
  },
  {
    id: 'N-003',
    title: 'Плановое отключение воды',
    description: 'ул. Момышулы 1-50. 19.03 с 10:00 до 18:00.',
    createdAt: '2026-03-18T16:00:00+05:00',
    audience: 'zone_momyshuly',
    status: 'sent',
    icon: 'info',
    accentColor: '#1D8CF8',
  },
  {
    id: 'N-004',
    title: 'Перекрытие дороги',
    description: 'ул. Байзакова закрыта для ремонта до 20.03.',
    createdAt: '2026-03-17T08:00:00+05:00',
    audience: 'Все жители',
    status: 'sent',
    icon: 'construction',
    accentColor: '#F59E0B',
  },
  {
    id: 'N-005',
    title: 'Субботник в парке Алатау',
    description: '23.03.2026 в 10:00. Приглашаем всех жителей района.',
    createdAt: '2026-03-19T09:00:00+05:00',
    audience: 'Все жители',
    status: 'draft',
    icon: 'megaphone',
    accentColor: '#9C27B0',
  },
];

export const ADMIN_INCIDENT_LEGEND = [
  { id: 'complaints', label: 'Жалобы / ЧП', color: '#E53935' },
  { id: 'flooding', label: 'Подтопление', color: '#2A65F7' },
  { id: 'pipe', label: 'Прорыв трубы', color: '#7A3FF2' },
  { id: 'light', label: 'Нет освещения', color: '#E68A00' },
];
