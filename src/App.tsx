import { useEffect, useState } from 'react';
import { AsciiHeader } from './components/AsciiHeader';
import { InfoBar } from './components/InfoBar';
import { MainMenu } from './components/MainMenu';
import { SubMenu } from './components/SubMenu';
import { TerminalContainer } from './components/TerminalContainer';
import { Divider } from './components/Divider';
import { useKeyStore } from './hooks/useKeyStore';
import { KeyData } from './hooks/useKeyStore';
import { MsgBox } from './components/MsgBox';

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const bootLines = [
    '> Khởi động NMH TOOLS v1.0.0...',
    '> Kiểm tra hệ thống...',
    '> Tải module bảo mật...',
    '> Kết nối máy chủ xác thực...',
    '> Hệ thống sẵn sàng !',
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="font-mono text-sm space-y-1">
        {lines.map((line, i) => (
          <div
            key={i}
            className="animate-pulse-once"
            style={{
              color: i === lines.length - 1 ? '#00FF7F' : '#1E90FF',
              textShadow: i === lines.length - 1 ? '0 0 8px #00FF7F' : '0 0 6px #1E90FF',
              animationDelay: `${i * 0.1}s`,
            }}
          >
            {line}
          </div>
        ))}
        <div className="mt-2" style={{ color: '#FFD700' }}>
          {'█'.repeat(Math.min(lines.length * 2, 10))}
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { activatedKey, saveKey } = useKeyStore();
  const [booted, setBooted] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState<KeyData | null>(null);

  // Check if already activated on mount — only trigger once after boot completes
  useEffect(() => {
    if (booted && activatedKey) {
      setShowSubMenu(true);
      setWelcomeBack(activatedKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  const handleActivated = (data: KeyData) => {
    saveKey(data);
    setTimeout(() => {
      setShowSubMenu(true);
    }, 1500);
  };

  if (!booted) {
    return (
      <div
        className="min-h-screen font-mono"
        style={{
          background: 'radial-gradient(ellipse at center, #050515 0%, #020208 60%, #000 100%)',
        }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />
        <BootSequence onDone={() => setBooted(true)} />
      </div>
    );
  }

  return (
    <TerminalContainer>
      {/* Welcome back msgbox */}
      {welcomeBack && (
        <MsgBox
          title="NMH TOOLS - Chào mừng trở lại !"
          message={`Xin chào ${welcomeBack.user} !\nKey của bạn vẫn còn hiệu lực.\nHạn sử dụng: ${welcomeBack.expiry}\nNgày hết hạn: ${welcomeBack.expired}\n\nChúc bạn sử dụng vui vẻ !`}
          type="success"
          onClose={() => setWelcomeBack(null)}
        />
      )}

      {/* ─── ASCII HEADER ─── */}
      <div
        className="mb-3 rounded-lg border overflow-hidden"
        style={{
          borderColor: '#ffffff11',
          background: 'linear-gradient(135deg, #030308 0%, #08081a 100%)',
          boxShadow: '0 0 40px #1E90FF11, inset 0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Title bar (fake PS window) */}
        <div
          className="flex items-center justify-between px-4 py-1.5"
          style={{
            background: 'linear-gradient(90deg, #0a0a1e, #0d0d22)',
            borderBottom: '1px solid #ffffff0a',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ background: '#FF5F57', boxShadow: '0 0 4px #FF5F57' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#FFBD2E', boxShadow: '0 0 4px #FFBD2E' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#28CA41', boxShadow: '0 0 4px #28CA41' }} />
            </div>
            <span className="font-mono text-xs" style={{ color: '#555' }}>
              Administrator: Windows PowerShell
            </span>
          </div>
          <span className="font-mono text-xs" style={{ color: '#333' }}>
            NMH TOOLS v1.0.0
          </span>
        </div>

        {/* ASCII art */}
        <div className="px-2 py-2">
          <AsciiHeader />
        </div>

        {/* Divider */}
        <div className="px-4">
          <Divider color="#1E90FF" />
        </div>

        {/* Info bar */}
        <div className="px-4 py-3">
          <InfoBar keyData={activatedKey} />
        </div>
      </div>

      {/* ─── MENU CHÍNH ─── */}
      {!showSubMenu && (
        <div className="mb-3">
          <MainMenu onActivated={handleActivated} />
        </div>
      )}

      {/* ─── MENU PHỤ ─── */}
      {showSubMenu && (
        <div className="mb-3 animate-fadeIn">
          <SubMenu />
        </div>
      )}

      {/* ─── Footer ─── */}
      <div className="mt-4 text-center">
        <Divider color="#333" />
        <div className="pt-2 font-mono text-xs" style={{ color: '#333' }}>
          NMH TOOLS v1.0.0 &nbsp;│&nbsp; Made by NMHRUBY &nbsp;│&nbsp; PowerShell Manager
        </div>
      </div>
    </TerminalContainer>
  );
}
