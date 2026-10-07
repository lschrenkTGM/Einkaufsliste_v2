import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link2, ShoppingCart } from 'lucide-react';
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
        <Link2 size={40} className="text-neutral-400" />
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Einladung ungültig
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Der Code „{code}“ ist nicht gültig oder wurde bereits erneuert.
        </p>
        <Button onClick={() => navigate('/')}>Zur Übersicht</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShoppingCart size={40} className="animate-pulse text-primary-600" />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Trete Liste bei …</p>
    </div>
  );
}
