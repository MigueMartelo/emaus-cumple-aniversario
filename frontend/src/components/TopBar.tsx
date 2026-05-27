import { LogOut } from 'lucide-react';
import { APP_TITLE, LOGO_SRC, adminNavigation, navigation } from '../constants.ts';

interface TopBarProps {
  activeView: string;
  adminToken: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function TopBar({ activeView, adminToken, onNavigate, onLogout }: TopBarProps) {
  const visibleNav = adminToken ? [...navigation, ...adminNavigation] : navigation;

  return (
    <header className="border-b border-[#e7d7b6] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <img className="h-12 w-20 shrink-0 object-contain sm:h-16 sm:w-36" src={LOGO_SRC} alt="Logo de Emaús Parejas" />
          <div className="min-w-0">
            <p className="max-w-full text-base font-semibold leading-tight text-[#8a5f13] sm:text-xl">{APP_TITLE}</p>
            <p className="mt-0.5 text-xs leading-snug text-[#6f6a60] sm:text-sm">Registro comunitario de fechas especiales</p>
          </div>
        </div>

        <nav className="grid grid-cols-1 gap-2 sm:flex sm:shrink-0 sm:items-center">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition sm:h-10 sm:px-4 ${
                  isActive
                    ? 'border-[#8a5f13] bg-[#8a5f13] text-white shadow-sm'
                    : 'border-[#e6d8bd] bg-white text-[#5f5140] hover:border-[#8a5f13] hover:text-[#8a5f13]'
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}

          {adminToken ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#e6d8bd] bg-white px-3 text-sm font-medium text-[#5f5140] transition hover:border-red-300 hover:text-red-600 sm:h-10 sm:px-4"
            >
              <LogOut size={17} aria-hidden="true" />
              Salir
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
