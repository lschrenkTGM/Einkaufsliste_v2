import { ShoppingCart } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <ShoppingCart size={40} className="text-primary-600" />
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Einkaufsliste</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Login/Registrierung kommt in Phase 2</p>
    </div>
  );
}
