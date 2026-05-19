import { useEffect, useRef } from 'react';

interface MsgBoxProps {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

const TYPE_CONFIG = {
  success: {
    icon: '✔',
    border: '#00FF7F',
    iconBg: '#003300',
    iconColor: '#00FF7F',
    titleColor: '#00FF7F',
  },
  error: {
    icon: '✖',
    border: '#FF4500',
    iconBg: '#330000',
    iconColor: '#FF4500',
    titleColor: '#FF4500',
  },
  warning: {
    icon: '⚠',
    border: '#FFD700',
    iconBg: '#332200',
    iconColor: '#FFD700',
    titleColor: '#FFD700',
  },
  info: {
    icon: 'ℹ',
    border: '#00BFFF',
    iconBg: '#001133',
    iconColor: '#00BFFF',
    titleColor: '#00BFFF',
  },
};

export function MsgBox({ title = 'NMHRUBY Tools thông báo !', message, type = 'info', onClose }: MsgBoxProps) {
  const cfg = TYPE_CONFIG[type];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', handleKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      <div
        ref={ref}
        tabIndex={0}
        className="relative mx-4 w-full max-w-lg rounded-lg outline-none"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
          border: `2px solid ${cfg.border}`,
          boxShadow: `0 0 30px ${cfg.border}44, 0 0 60px ${cfg.border}22, inset 0 0 30px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2 rounded-t-lg"
          style={{
            background: `linear-gradient(90deg, ${cfg.border}22, transparent)`,
            borderBottom: `1px solid ${cfg.border}44`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold"
              style={{ background: cfg.iconBg, color: cfg.iconColor, border: `1px solid ${cfg.border}` }}
            >
              {cfg.icon}
            </div>
            <span
              className="font-mono text-sm font-bold tracking-wider"
              style={{ color: cfg.titleColor, textShadow: `0 0 8px ${cfg.border}` }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="whitespace-pre-line font-mono text-sm leading-relaxed text-gray-200">
            {message}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center pb-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded font-mono text-sm font-bold tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${cfg.border}33, ${cfg.border}11)`,
              border: `1px solid ${cfg.border}`,
              color: cfg.border,
              boxShadow: `0 0 10px ${cfg.border}44`,
            }}
          >
            [ OK ]
          </button>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: cfg.border }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: cfg.border }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: cfg.border }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: cfg.border }} />
      </div>
    </div>
  );
}
