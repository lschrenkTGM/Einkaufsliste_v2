import { MoreVertical, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ListSummary } from '@/hooks/useLists';

interface ListCardProps {
  list: ListSummary;
  onMenu: (list: ListSummary) => void;
}

export function ListCard({ list, onMenu }: ListCardProps) {
  const navigate = useNavigate();
  const open = list.itemsTotal - list.itemsChecked;
  const progress = list.itemsTotal > 0 ? list.itemsChecked / list.itemsTotal : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/list/${list.id}`)}
      onKeyDown={(event) => event.key === 'Enter' && navigate(`/list/${list.id}`)}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-paper-raised p-4 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lifted"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-2xl transition-transform duration-200 group-hover:scale-105">
        {list.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg leading-tight text-ink">{list.name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-sunken">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">
            {list.itemsChecked}/{list.itemsTotal} · {open} offen
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-sm text-ink-faint">
        <Users size={15} />
        {list.memberCount}
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onMenu(list);
        }}
        aria-label="Menü"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-paper-sunken hover:text-ink"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
