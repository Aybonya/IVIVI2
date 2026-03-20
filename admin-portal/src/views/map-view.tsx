import { useEffect, useState } from 'react';

import { ADMIN_INCIDENT_LEGEND } from '../shared-data';
import type { MapIncident } from '../types';
import { PageHeader } from '../ui';

export function MapView({ incidents }: { incidents: MapIncident[] }) {
  const [selectedId, setSelectedId] = useState(incidents[0]?.id ?? '');
  const selected = incidents.find((item) => item.id === selectedId) ?? incidents[0] ?? null;

  useEffect(() => {
    if (!incidents.some((item) => item.id === selectedId)) {
      setSelectedId(incidents[0]?.id ?? '');
    }
  }, [incidents, selectedId]);

  return (
    <div className="page__body">
      <PageHeader title="Карта инцидентов" subtitle="Активные жалобы и оповещения на карте района" />

      <section className="map-layout">
        <article className="incidents-map">
          <div className="incidents-map__roads incidents-map__roads--horizontal" />
          <div className="incidents-map__roads incidents-map__roads--vertical" />
          <div className="incidents-map__park incidents-map__park--one" />
          <div className="incidents-map__park incidents-map__park--two" />
          <div className="incidents-map__block incidents-map__block--one" />
          <div className="incidents-map__block incidents-map__block--two" />
          <div className="incidents-map__block incidents-map__block--three" />
          <div className="incidents-map__block incidents-map__block--four" />
          <div className="incidents-map__block incidents-map__block--five" />
          <div className="incidents-map__block incidents-map__block--six" />

          {incidents.map((item) => (
            <button
              key={item.id}
              className={`map-marker ${item.id === selected?.id ? 'is-active' : ''}`}
              style={{ top: item.top, left: item.left, ['--marker-color' as string]: item.color }}
              type="button"
              onClick={() => setSelectedId(item.id)}>
              <span className="map-marker__dot" />
            </button>
          ))}

          {selected ? (
            <div className="map-tooltip" style={{ top: selected.top, left: selected.left }}>
              <div className="map-tooltip__id">{selected.id}</div>
              <strong>{selected.title}</strong>
            </div>
          ) : null}
        </article>

        <div className="map-side">
          <article className="surface surface--compact">
            <div className="surface__header">
              <h2>Легенда</h2>
            </div>
            <div className="legend-list">
              {ADMIN_INCIDENT_LEGEND.map((item) => (
                <div key={item.id} className="legend-list__row">
                  <span className="legend-list__dot" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="surface surface--compact">
            <div className="surface__header">
              <h2>Инциденты ({incidents.length})</h2>
            </div>
            <div className="incident-list">
              {incidents.map((item) => (
                <button
                  key={item.id}
                  className={`incident-list__item ${item.id === selected?.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => setSelectedId(item.id)}>
                  <span className="legend-list__dot" style={{ backgroundColor: item.color }} />
                  <div>
                    <strong>{item.id}</strong>
                    <span>{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
