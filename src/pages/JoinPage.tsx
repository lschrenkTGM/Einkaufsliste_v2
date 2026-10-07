import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link2, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type Status = 'joining' | 'error' | 'done';

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>('joining');

  useEffect(() => {
    let active = true;

    async function join() {
      if (!code || !profile) {
        setStatus('error');
        return;
      }
      const { data, error } = await supabase.rpc('join_list_by_code', {
        _code: code,
        _user_id: profile.id,
      });
      if (!active) return;
      if (error || !data) {
        console.error(error);
        setStatus('error');
        return;
      }
      setStatus('done');
      navigate(`/list/${data}`, { replace: true });
    }

    join();
    return () => {
      active = false;
    };
  }, [code, navigate, profile]);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <Link2 size={28} />
        </div>
        <h1 className="font-display text-2xl text-ink">Einladung ungültig</h1>
        <p className="text-sm text-ink-muted">
          Der Code „{code}“ ist nicht gültig oder wurde bereits erneuert.
        </p>
        <Button onClick={() => navigate('/')}>Zur Übersicht</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <ShoppingBasket size={28} />
      </div>
      <p className="text-sm text-ink-muted">Trete Liste bei …</p>
    </div>
  );
}
