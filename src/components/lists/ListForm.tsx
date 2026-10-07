import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LIST_EMOJIS } from '@/lib/constants';

interface ListFormProps {
  initialName?: string;
  initialEmoji?: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: { name: string; emoji: string }) => void;
}

export function ListForm({
  initialName = '',
  initialEmoji = LIST_EMOJIS[0],
  submitLabel,
  submitting,
  onSubmit,
}: ListFormProps) {
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) {
      setError('Name muss 1–60 Zeichen lang sein');
      return;
    }
    setError(undefined);
    onSubmit({ name: trimmed, emoji });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={error}
        autoFocus
      />
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Emoji</p>
        <div className="grid grid-cols-6 gap-2">
          {LIST_EMOJIS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEmoji(option)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-colors duration-150 ${
                emoji === option
                  ? 'bg-primary-100 ring-2 ring-primary-500 dark:bg-primary-900/40'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
