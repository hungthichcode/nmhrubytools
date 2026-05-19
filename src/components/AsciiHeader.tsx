import React, { useEffect, useState } from 'react';

const ASCII_ART = `
███╗   ██╗███╗   ███╗██╗  ██╗    ████████╗ ██████╗  ██████╗ ██╗     ███████╗
████╗  ██║████╗ ████║██║  ██║    ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
██╔██╗ ██║██╔████╔██║███████║       ██║   ██║   ██║██║   ██║██║     ███████╗
██║╚██╗██║██║╚██╔╝██║██╔══██║       ██║   ██║   ██║██║   ██║██║     ╚════██║
██║ ╚████║██║ ╚═╝ ██║██║  ██║       ██║   ╚██████╔╝╚██████╔╝███████╗███████║
╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝       ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
`;

const RAINBOW_COLORS = [
  '#FF0000', '#FF4500', '#FF7F00', '#FFD700',
  '#ADFF2F', '#00FF7F', '#00FFFF', '#00BFFF',
  '#1E90FF', '#8A2BE2', '#FF00FF', '#FF69B4',
];

interface RainbowCharProps {
  char: string;
  index: number;
  offset: number;
}

function RainbowChar({ char, index, offset }: RainbowCharProps) {
  if (char === '\n' || char === ' ') return <>{char === '\n' ? '\n' : ' '}</>;
  const colorIndex = (index + offset) % RAINBOW_COLORS.length;
  return (
    <span style={{ color: RAINBOW_COLORS[colorIndex], textShadow: `0 0 8px ${RAINBOW_COLORS[colorIndex]}88` }}>
      {char}
    </span>
  );
}

export function AsciiHeader() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % RAINBOW_COLORS.length);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const lines = ASCII_ART.split('\n').filter((_, i, arr) => !(i === 0 && arr[0] === ''));

  return (
    <div className="relative overflow-hidden">
      {/* Scanline effect */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
      />
      <pre
        className="select-none text-center font-mono leading-tight"
        style={{ fontSize: 'clamp(5px, 1.1vw, 13px)', letterSpacing: '0.05em' }}
      >
        {lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {line.split('').map((char, charIdx) => (
              <RainbowChar
                key={charIdx}
                char={char}
                index={lineIdx * 80 + charIdx}
                offset={offset}
              />
            ))}
            {lineIdx < lines.length - 1 && '\n'}
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
}
