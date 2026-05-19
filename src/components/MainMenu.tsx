import { useState, useRef, useEffect } from 'react';
import { validateKey } from '../utils/googleSheets';
import { KeyData } from '../hooks/useKeyStore';
import { MsgBox } from './MsgBox';

interface MsgState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface MainMenuProps {
  onActivated: (data: KeyData) => void;
}

const LOADER_FRAMES = ['▰▱▱▱▱▱▱▱▱▱', '▰▰▱▱▱▱▱▱▱▱', '▰▰▰▱▱▱▱▱▱▱', '▰▰▰▰▱▱▱▱▱▱', '▰▰▰▰▰▱▱▱▱▱', '▰▰▰▰▰▰▱▱▱▱', '▰▰▰▰▰▰▰▱▱▱', '▰▰▰▰▰▰▰▰▱▱', '▰▰▰▰▰▰▰▰▰▱', '▰▰▰▰▰▰▰▰▰▰'];

export function MainMenu({ onActivated }: MainMenuProps) {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderFrame, setLoaderFrame] = useState(0);
  const [msgState, setMsgState] = useState<MsgState | null>(null);
  const [logs, setLogs] = useState<{ text: string; color: string }[]>([
    { text: '> NMH TOOLS v1.0.0 - PowerShell Manager', color: '#00BFFF' },
    { text: '> Khởi động hệ thống...', color: '#ADFF2F' },
    { text: '> Sẵn sàng. Vui lòng nhập Key kích hoạt.', color: '#00FF7F' },
    { text: '', color: '#fff' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, color = '#fff') => {
    setLogs((prev) => [...prev, { text, color }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoaderFrame((f) => (f + 1) % LOADER_FRAMES.length);
    }, 120);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      addLog('> Lỗi: Vui lòng nhập Key trước khi xác nhận.', '#FF4500');
      return;
    }

    addLog(`> Đang xác thực Key: ${trimmed}`, '#FFD700');
    setLoading(true);

    try {
      const result = await validateKey(trimmed);

      if (result.status === 'valid') {
        const { row } = result;
        addLog(`> ✔ Key hợp lệ! Đang kích hoạt...`, '#00FF7F');
        addLog(`> User: ${row.user} | Expiry: ${row.expiry} | Expired: ${row.expired}`, '#00BFFF');
        setTimeout(() => {
          onActivated({
            key: row.key,
            expiry: row.expiry,
            expired: row.expired,
            user: row.user,
          });
          setMsgState({
            message: `Key '${row.key}' của bạn đã được kích hoạt thành công, cảm ơn bạn đã tin tưởng và ủng hộ`,
            type: 'success',
          });
          setLoading(false);
          setKeyInput('');
        }, 800);
      } else if (result.status === 'exploit') {
        addLog(`> ⚠ Phát hiện hành vi khai thác lỗ hổng!`, '#FFD700');
        setMsgState({
          message: `Key '${result.key}' bạn đang dùng đã cố tình sử dụng lỗ hổng, vui lòng báo lại Admin để được phần quà thích đáng !`,
          type: 'warning',
        });
        setLoading(false);
      } else {
        addLog(`> ✖ Key không hợp lệ: ${trimmed}`, '#FF4500');
        setMsgState({
          message: `Key '${result.key}' của bạn đã nhập sai, Key chỉ có 24 kí tự, nếu Key lỗi vui lòng liên hệ Admin để xử lý nhanh nhất`,
          type: 'error',
        });
        setLoading(false);
      }
    } catch {
      addLog('> ✖ Lỗi kết nối. Kiểm tra mạng và thử lại.', '#FF4500');
      setMsgState({
        message: 'Không thể kết nối đến máy chủ xác thực.\nVui lòng kiểm tra kết nối mạng và thử lại.',
        type: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <>
      {msgState && (
        <MsgBox
          message={msgState.message}
          type={msgState.type}
          onClose={() => setMsgState(null)}
        />
      )}

      <div
        className="rounded-lg border p-4"
        style={{
          background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 100%)',
          borderColor: '#1E90FF44',
          boxShadow: '0 0 20px #1E90FF22',
        }}
      >
        {/* Section title */}
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #1E90FF)' }} />
          <span
            className="font-mono text-sm font-bold tracking-[0.3em] uppercase"
            style={{ color: '#1E90FF', textShadow: '0 0 10px #1E90FF' }}
          >
            ══ MENU CHÍNH ══
          </span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #1E90FF, transparent)' }} />
        </div>

        {/* Terminal log area */}
        <div
          ref={logRef}
          className="mb-3 h-28 overflow-y-auto rounded border p-2 font-mono text-xs"
          style={{
            background: '#020208',
            borderColor: '#1E90FF22',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1E90FF22 transparent',
          }}
        >
          {logs.map((log, i) => (
            <div key={i} style={{ color: log.color }} className="leading-5">
              {log.text}
            </div>
          ))}
          {loading && (
            <div style={{ color: '#FFD700' }} className="leading-5">
              {'> Đang xác thực ' + LOADER_FRAMES[loaderFrame]}
            </div>
          )}
        </div>

        {/* Import Key section */}
        <div
          className="rounded border p-3"
          style={{ borderColor: '#1E90FF33', background: '#05050f' }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span style={{ color: '#1E90FF' }} className="text-sm">🔑</span>
            <span className="font-mono text-sm font-bold" style={{ color: '#00BFFF' }}>
              Import Key
            </span>
            <span className="ml-auto font-mono text-xs" style={{ color: '#555' }}>
              [24 ký tự]
            </span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm"
                style={{ color: '#1E90FF88' }}
              >
                PS&gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                placeholder="Nhập Key kích hoạt của bạn..."
                maxLength={50}
                disabled={loading}
                className="w-full rounded border py-2 pl-12 pr-3 font-mono text-sm outline-none transition-all disabled:opacity-50"
                style={{
                  background: '#020208',
                  borderColor: '#1E90FF44',
                  color: '#00FF7F',
                  caretColor: '#00FF7F',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E90FF';
                  e.target.style.boxShadow = '0 0 10px #1E90FF44';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#1E90FF44';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded px-4 py-2 font-mono text-sm font-bold tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #1E90FF33, #1E90FF11)',
                border: '1px solid #1E90FF',
                color: '#1E90FF',
                boxShadow: '0 0 10px #1E90FF44',
              }}
            >
              {loading ? '...' : '[ ACTIVATE ]'}
            </button>
          </div>

          <div className="mt-2 text-right font-mono text-xs" style={{ color: '#555' }}>
            Liên hệ Admin nếu Key gặp sự cố
          </div>
        </div>
      </div>
    </>
  );
}
