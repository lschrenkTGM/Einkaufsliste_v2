import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface JoinDialogProps {
  open: boolean;
  onClose: () => void;
}

export function JoinDialog({ open, onClose }: JoinDialogProps) {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    onClose();
    navigate(`/join/${trimmed}`);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Liste beitreten">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Einladungscode"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="z.B. A3F9C21B"
          autoFocus
        />
        <Button type="submit">Beitreten</Button>
      </form>
    </Sheet>
  );
}
