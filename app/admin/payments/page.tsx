'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/billing');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--gold-400)', fontSize: '14px' }}>
      Loading Hair Mart POS Billing...
    </div>
  );
}
