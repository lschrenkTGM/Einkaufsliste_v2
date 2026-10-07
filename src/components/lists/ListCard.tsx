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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/list/${list.id}`)}
      onKeyDown={(event) => event.key === 'Enter' && navigate(`/list/${list.id}`)}
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors duration-150 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
    >
      <span className="text-2xl">{list.emoji}</span>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">{list.name}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {list.itemsChecked} / {list.itemsTotal} erledigt · {open} offen
        </p>
      </div>
      <div className="flex items-center gap-1 text-sm text-neutral-400">
        <Users size={16} />
        {list.memberCount}
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onMenu(list);
        }}
        aria-label="Menü"
        className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
