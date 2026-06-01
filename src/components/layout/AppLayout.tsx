import { ReactNode, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useWishboard } from '@/hooks/useWishboard';
import { MascotInsights } from '@/components/shared/MascotInsights';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'wishboard-sidebar-collapsed';

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });

  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const { currentBalance } = useWishboard();
  
  // Determinar qual mascote mostrar baseado no saldo atual
  const mascotState = useMemo(() => {
    // Saldo maior que 100k: Dinero
    if (currentBalance > 100000) {
      return {
        show: true,
        image: 'https://i.ibb.co/35N0j9yz/dinero.png',
        message: 'Você é incrível! 💎',
        alt: 'Mascote Dinero',
        showBalloon: true,
        mood: 'happy' as const,
      };
    }
    
    // Saldo maior que 49k: Magnata
    if (currentBalance > 49000) {
      return {
        show: true,
        image: 'https://i.ibb.co/4ZD9TyQB/magnata.png',
        message: 'Magnata! 💰',
        alt: 'Mascote Magnata',
        showBalloon: true,
        mood: 'happy' as const,
      };
    }
    
    // Saldo entre 2001 e 49000: Feliz
    if (currentBalance > 2000) {
      return {
        show: true,
        image: 'https://i.ibb.co/35LrsnCg/feliz.png',
        message: 'Muito bem! 🎉',
        alt: 'Mascote Feliz',
        showBalloon: true,
        mood: 'happy' as const,
      };
    }
    
    // Saldo entre 501 e 2000: Neutro
    if (currentBalance > 500) {
      return {
        show: true,
        image: 'https://i.ibb.co/nqvHD4Jm/neutro.png',
        message: 'Ei, podemos melhorar!',
        alt: 'Mascote Neutro',
        showBalloon: false,
        mood: 'neutral' as const,
      };
    }
    
    // Saldo entre 0 e 500: Triste
    if (currentBalance >= 0) {
      return {
        show: true,
        image: 'https://i.ibb.co/sdJMwYmT/triste.png',
        message: '...',
        alt: 'Mascote Triste',
        showBalloon: false,
        mood: 'sad' as const,
      };
    }
    
    // Saldo negativo: Morri
    return {
      show: true,
      image: 'https://i.ibb.co/NdhY2yJL/morri.png',
      message: 'Socorro! 😰',
      alt: 'Mascote em Apuros',
      showBalloon: false,
      mood: 'sad' as const,
    };
  }, [currentBalance]); // Recalcula quando saldo mudar

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">
        <div className="container max-w-6xl py-6 px-4 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
      
      {/* Mascote de sucesso */}
      <AnimatePresence>
        {mascotState.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              y: [0, -10, 0]
            }}
            exit={{ opacity: 0, scale: 0, x: 100 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              x: { duration: 0.3 },
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50 group"
          >
            {/* Balão de fala - apenas para o mascote feliz, aparece no hover */}
            {mascotState.showBalloon && (
              <div
                className="absolute -top-16 -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="relative bg-white text-gray-800 px-3 py-2 rounded-2xl shadow-xl border-2 border-gray-200 whitespace-nowrap">
                  <p className="font-semibold text-sm">{mascotState.message}</p>
                  {/* Pontinha do balão */}
                  <div className="absolute -bottom-2 right-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
                    <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[11px] border-t-gray-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Hint para clicar - aparece ao hover quando não há balão */}
            {!mascotState.showBalloon && (
              <div
                className="absolute -top-16 -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="relative bg-white text-gray-800 px-3 py-2 rounded-2xl shadow-xl border-2 border-gray-200 whitespace-nowrap">
                  <p className="font-semibold text-sm">Ver insights 💡</p>
                  {/* Pontinha do balão */}
                  <div className="absolute -bottom-2 right-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
                    <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[11px] border-t-gray-200" />
                  </div>
                </div>
              </div>
            )}
            
            <img
              src={mascotState.image}
              alt={mascotState.alt}
              onClick={() => setIsInsightsOpen(true)}
              className="w-20 h-20 lg:w-24 lg:h-24 drop-shadow-2xl cursor-pointer hover:scale-110 transition-transform active:scale-95"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Insights */}
      <MascotInsights
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        mascotImage={mascotState.image}
        mascotAlt={mascotState.alt}
        mascotMood={mascotState.mood}
      />
    </div>
  );
};