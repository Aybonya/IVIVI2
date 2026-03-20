import { useMemo } from 'react';
import { Search } from 'lucide-react';

import { RESIDENT_DIRECTORY, RESIDENT_STATUS_META } from '../shared-data';
import { formatDateShort } from '../utils';
import { PageHeader } from '../ui';

export function ResidentsView({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const residents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return RESIDENT_DIRECTORY;
    }

    return RESIDENT_DIRECTORY.filter((item) =>
      [item.id, item.fullName, item.phone, item.address].some((value) => value.toLowerCase().includes(query))
    );
  }, [search]);

  return (
    <div className="page__body">
      <PageHeader title="Жители района" subtitle={`${residents.length} зарегистрированных жителей`} />

      <section className="toolbar">
        <label className="search-field search-field--wide">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по имени, телефону, адресу..."
          />
        </label>
      </section>

      <article className="surface">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Адрес</th>
              <th>Жалоб</th>
              <th>С нами с</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((item) => (
              <tr key={item.id}>
                <td className="table__link">{item.id}</td>
                <td>{item.fullName}</td>
                <td className="table__link">{item.phone}</td>
                <td>{item.address}</td>
                <td>
                  <span className="inline-chip">{item.complaintsCount}</span>
                </td>
                <td>{formatDateShort(item.joinedAt)}</td>
                <td>
                  <span
                    className="inline-chip"
                    style={{
                      backgroundColor: RESIDENT_STATUS_META[item.status].background,
                      color: RESIDENT_STATUS_META[item.status].color,
                    }}>
                    {RESIDENT_STATUS_META[item.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}
