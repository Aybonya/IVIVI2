import type { FormEvent } from 'react';
import { Building2 } from 'lucide-react';

import { ADMIN_PORTAL_CREDENTIALS } from './shared-data';

export function LoginScreen({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="login-card__brand">
          <div className="sidebar__brand-icon">
            <Building2 size={20} />
          </div>
          <div>
            <div className="sidebar__brand-title login-card__brand-title">Алатау</div>
            <div className="sidebar__brand-subtitle">Портал администрации района</div>
          </div>
        </div>

        <h1>Вход в систему</h1>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => onEmailChange(event.target.value)} type="email" />
          </label>
          <label>
            <span>Пароль</span>
            <input value={password} onChange={(event) => onPasswordChange(event.target.value)} type="password" />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="button button--primary button--block" type="submit">
            Войти
          </button>
        </form>

        <div className="login-card__hint">
          Тестовый доступ: пароль <strong>{ADMIN_PORTAL_CREDENTIALS.password}</strong>
        </div>
      </section>
    </main>
  );
}
