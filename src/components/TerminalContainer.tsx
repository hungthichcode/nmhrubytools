import { ReactNode } from 'react';

interface TerminalContainerProps {
  children: ReactNode;
}

export function TerminalContainer({ children }: TerminalContainerProps) {
  return (
    <div
      className="min-h-screen w-full font-mono"
      style={{
        background: 'radial-gradient(ellipse at center, #050515 0%, #020208 60%, #000 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* CRT scanline effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.4) 2px, rgba(0, 0, 0, 0.4) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Animated grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(#1E90FF 1px, transparent 1px),
            linear-gradient(90deg, #1E90FF 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
