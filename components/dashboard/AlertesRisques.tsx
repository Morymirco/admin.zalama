'use client';

import React, { useEffect, useState } from 'react';
import { avisService, Avis } from '@/services/avisService';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AlertesRisques() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAvis() {
      setLoading(true);
      const data = await avisService.getLastAvis(3);
      setAvis(data);
      setLoading(false);
    }
    fetchAvis();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--zalama-primary)]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[var(--zalama-blue)]">
        Derniers avis
      </h2>
      <div className="space-y-3">
        {avis.length > 0 ? (
          <>
            {avis.map((a) => (
              <div key={a.id} className="p-4 rounded-lg bg-[var(--zalama-bg-light)] border border-[var(--zalama-border)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">
                    {a.type_retour === 'positif' ? (
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-5 h-5 text-red-600" />
                    )}
                  </span>
                  <span className="font-semibold text-[var(--zalama-text)]">Note : {a.note}/5</span>
                  <span className="text-xs text-[var(--zalama-text-secondary)] ml-auto">{new Date(a.date_avis).toLocaleString('fr-FR')}</span>
                </div>
                <div className="text-sm text-[var(--zalama-text-secondary)]">{a.commentaire}</div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => router.push('/dashboard/avis')}
                className="bg-blue-500 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg hover:bg-[var(--zalama-bg-lighter)]"
              >
                Voir tout
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-[var(--zalama-text-secondary)]">
            Aucun avis pour le moment
          </div>
        )}
      </div>
    </div>
  );
}