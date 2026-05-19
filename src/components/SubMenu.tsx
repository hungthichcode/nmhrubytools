import { useState } from 'react';
import { MsgBox } from './MsgBox';

interface Command {
  id: string;
  group: string;
  groupColor: string;
  groupIcon: string;
  label: string;
  description: string;
  command: string;
  url: string;
  color: string;
  icon: string;
}

const COMMANDS: Command[] = [
  {
    id: 'activate-win',
    group: 'Group 1: Activate Windows & Office',
    groupColor: '#00BFFF',
    groupIcon: '🪟',
    label: 'Activate Windows & Office',
    description: 'Kích hoạt Windows & Office bản quyền miễn phí bằng Microsoft Activation Scripts',
    command: 'irm https://get.activated.win | iex',
    url: 'https://get.activated.win',
    color: '#00BFFF',
    icon: '⚡',
  },
  {
    id: 'install-office',
    group: 'Group 2: Installer Office',
    groupColor: '#FF69B4',
    groupIcon: '📦',
    label: 'Office Tool Plus Installer',
    description: 'Cài đặt Microsoft Office dễ dàng với Office Tool Plus',
    command: 'irm https://officetool.plus | iex',
    url: 'https://officetool.plus',
    color: '#FF69B4',
    icon: '📥',
  },
];

interface RunState {
  id: string;
  status: 'running' | 'done';
}

export function SubMenu() {
  const [runState, setRunState] = useState<RunState | null>(null);
  const [msgBox, setMsgBox] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleRun = (cmd: Command) => {
    setRunState({ id: cmd.id, status: 'running' });
    setTimeout(() => {
      setRunState({ id: cmd.id, status: 'done' });
      setMsgBox({
        message: `Lệnh PowerShell (Administrator) đã được sao chép vào clipboard!\n\nLệnh:\n${cmd.command}\n\nHãy mở PowerShell với quyền Administrator và dán lệnh vào để thực thi.`,
        type: 'success',
      });
      // Copy to clipboard
      navigator.clipboard.writeText(cmd.command).catch(() => {});
      setTimeout(() => setRunState(null), 2000);
    }, 1200);
  };

  const handleCopy = (cmd: Command) => {
    navigator.clipboard.writeText(cmd.command).then(() => {
      setCopied(cmd.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const groupedCommands: Record<string, Command[]> = {};
  for (const cmd of COMMANDS) {
    if (!groupedCommands[cmd.group]) groupedCommands[cmd.group] = [];
    groupedCommands[cmd.group].push(cmd);
  }

  return (
    <>
      {msgBox && (
        <MsgBox
          message={msgBox.message}
          type={msgBox.type}
          onClose={() => setMsgBox(null)}
        />
      )}

      <div
        className="rounded-lg border p-4"
        style={{
          background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 100%)',
          borderColor: '#8A2BE244',
          boxShadow: '0 0 20px #8A2BE222',
        }}
      >
        {/* Section title */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #8A2BE2)' }} />
          <span
            className="font-mono text-sm font-bold tracking-[0.3em] uppercase"
            style={{ color: '#8A2BE2', textShadow: '0 0 10px #8A2BE2' }}
          >
            ══ MENU PHỤ ══
          </span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #8A2BE2, transparent)' }} />
        </div>

        <div className="space-y-4">
          {Object.entries(groupedCommands).map(([groupName, cmds]) => {
            const firstCmd = cmds[0];
            return (
              <div key={groupName}>
                {/* Group header */}
                <div
                  className="mb-2 flex items-center gap-2 rounded px-3 py-1.5"
                  style={{
                    background: `${firstCmd.groupColor}11`,
                    border: `1px solid ${firstCmd.groupColor}33`,
                  }}
                >
                  <span>{firstCmd.groupIcon}</span>
                  <span
                    className="font-mono text-xs font-bold tracking-wider uppercase"
                    style={{ color: firstCmd.groupColor, textShadow: `0 0 8px ${firstCmd.groupColor}` }}
                  >
                    {groupName}
                  </span>
                </div>

                {/* Commands in group */}
                {cmds.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="mb-2 ml-2 rounded-lg border p-3 transition-all duration-200"
                    style={{
                      background: '#020208',
                      borderColor: `${cmd.color}22`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${cmd.color}66`;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${cmd.color}22`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${cmd.color}22`;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Command label */}
                    <div className="mb-1.5 flex items-center gap-2">
                      <span>{cmd.icon}</span>
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: cmd.color, textShadow: `0 0 6px ${cmd.color}66` }}
                      >
                        {cmd.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-2 text-xs" style={{ color: '#888' }}>
                      {cmd.description}
                    </p>

                    {/* Command preview */}
                    <div
                      className="mb-3 flex items-center gap-2 rounded border px-3 py-1.5"
                      style={{ background: '#000', borderColor: `${cmd.color}33` }}
                    >
                      <span className="font-mono text-xs" style={{ color: '#555' }}>PS&gt;</span>
                      <code className="flex-1 font-mono text-xs" style={{ color: '#ADFF2F' }}>
                        {cmd.command}
                      </code>
                    </div>

                    {/* Note */}
                    <div
                      className="mb-3 rounded px-2 py-1.5 text-xs font-mono"
                      style={{ background: '#FFD70011', border: '1px solid #FFD70033', color: '#FFD700' }}
                    >
                      ⚠ Yêu cầu chạy PowerShell với quyền <strong>Administrator</strong>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRun(cmd)}
                        disabled={runState?.id === cmd.id}
                        className="flex-1 rounded py-2 font-mono text-sm font-bold tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-wait"
                        style={{
                          background: runState?.id === cmd.id && runState.status === 'done'
                            ? '#00FF7F22'
                            : `linear-gradient(135deg, ${cmd.color}33, ${cmd.color}11)`,
                          border: `1px solid ${runState?.id === cmd.id && runState.status === 'done' ? '#00FF7F' : cmd.color}`,
                          color: runState?.id === cmd.id && runState.status === 'done' ? '#00FF7F' : cmd.color,
                          boxShadow: `0 0 10px ${cmd.color}33`,
                        }}
                      >
                        {runState?.id === cmd.id
                          ? runState.status === 'running'
                            ? '[ ĐANG CHẠY... ]'
                            : '[ ✔ HOÀN THÀNH ]'
                          : '[ CHẠY LỆNH ]'}
                      </button>

                      <button
                        onClick={() => handleCopy(cmd)}
                        className="rounded px-3 py-2 font-mono text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background: copied === cmd.id ? '#00FF7F22' : '#ffffff0a',
                          border: `1px solid ${copied === cmd.id ? '#00FF7F' : '#444'}`,
                          color: copied === cmd.id ? '#00FF7F' : '#888',
                        }}
                        title="Sao chép lệnh"
                      >
                        {copied === cmd.id ? '✔' : '📋'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* How to use guide */}
        <div
          className="mt-4 rounded border p-3"
          style={{ borderColor: '#ADFF2F22', background: '#ADFF2F08' }}
        >
          <div className="mb-1 font-mono text-xs font-bold" style={{ color: '#ADFF2F' }}>
            📖 HƯỚNG DẪN SỬ DỤNG:
          </div>
          <ol className="space-y-1 font-mono text-xs" style={{ color: '#666' }}>
            <li>1. Nhấn <span style={{ color: '#ADFF2F' }}>[CHẠY LỆNH]</span> để sao chép lệnh vào clipboard</li>
            <li>2. Mở <span style={{ color: '#00BFFF' }}>PowerShell</span> với quyền <span style={{ color: '#FF4500' }}>Administrator</span></li>
            <li>3. Dán lệnh (Ctrl+V) và nhấn Enter để thực thi</li>
          </ol>
        </div>
      </div>
    </>
  );
}
