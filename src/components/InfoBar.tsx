import { useEffect, useState } from 'react';
import { KeyData } from '../hooks/useKeyStore';

interface InfoBarProps {
  keyData: KeyData | null;
}

function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try standard parse first
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Try dd/mm/yyyy
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d2 = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
}

function getDaysFromToday(expired: string): number | null {
  const end = parseFlexibleDate(expired);
  if (!end) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTotalDays(expiry: string, expired: string): number | null {
  const start = parseFlexibleDate(expiry);
  const end = parseFlexibleDate(expired);
  if (!start || !end) return null;
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function DaysBar({ days, total }: { days: number; total: number }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (days / total) * 100)) : 0;
  const color = pct > 60 ? '#00FF7F' : pct > 25 ? '#FFD700' : '#FF4500';
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full" style={{ background: '#1a1a2e' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}

export function InfoBar({ keyData }: InfoBarProps) {
  const [deviceName, setDeviceName] = useState('LOADING...');
  const edition = 'Windows 11 Pro';
  const version = '23H2 (Build 22631)';
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem('nmhtools_device_id');
    if (stored) {
      setDeviceName(stored);
    } else {
      const id = 'DESKTOP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('nmhtools_device_id', id);
      setDeviceName(id);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const daysLeft = keyData ? getDaysFromToday(keyData.expired) : null;
  const totalDays = keyData ? getTotalDays(keyData.expiry, keyData.expired) : null;

  const Separator = () => (
    <span className="mx-1.5 text-gray-700 select-none">│</span>
  );

  const Label = ({ text }: { text: string }) => (
    <span className="text-gray-600 text-xs font-mono">{text}:</span>
  );

  const Value = ({ text, color = '#00FFFF' }: { text: string; color?: string }) => (
    <span className="text-xs font-bold font-mono" style={{ color, textShadow: `0 0 5px ${color}55` }}>
      {text || '---'}
    </span>
  );

  return (
    <div
      className="rounded border px-4 py-2.5"
      style={{
        background: 'linear-gradient(135deg, #020210 0%, #040416 100%)',
        borderColor: '#1E90FF22',
      }}
    >
      {/* Row 1: Device Info */}
      <div className="flex flex-wrap items-center gap-1">
        <Label text="Device" />
        <Value text={deviceName} color="#00BFFF" />
        <Separator />
        <Label text="Edition" />
        <Value text={edition} color="#ADFF2F" />
        <Separator />
        <Label text="Version" />
        <Value text={version} color="#FFD700" />
        <Separator />
        <Label text="Software" />
        <Value text="v1.0.0" color="#FF69B4" />
        <span className="ml-auto font-mono text-xs" style={{ color: '#444' }}>
          {now.toLocaleTimeString('vi-VN')} — {now.toLocaleDateString('vi-VN')}
        </span>
      </div>

      {/* Divider */}
      <div
        className="my-1.5 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #1E90FF33, transparent)' }}
      />

      {/* Row 2: Key Info */}
      <div className="flex flex-wrap items-center gap-1">
        <Label text="User" />
        <Value text={keyData?.user || '---'} color="#FF69B4" />
        <Separator />
        <Label text="Hạn Sử Dụng" />
        <Value text={keyData?.expiry || '---'} color="#00FF7F" />
        <Separator />
        <Label text="Ngày Hết Hạn" />
        <Value text={keyData?.expired || '---'} color="#FF4500" />
        <Separator />
        <Label text="Còn Lại" />
        {daysLeft !== null ? (
          <Value
            text={daysLeft > 0 ? `${daysLeft} ngày` : 'ĐÃ HẾT HẠN'}
            color={daysLeft > 30 ? '#00FF7F' : daysLeft > 7 ? '#FFD700' : '#FF0000'}
          />
        ) : (
          <Value text="---" color="#444" />
        )}
        <Separator />
        <Label text="Trạng Thái" />
        <Value
          text={keyData ? (daysLeft !== null && daysLeft > 0 ? '✔ ACTIVE' : '⚠ EXPIRED') : '✖ CHƯA KÍCH HOẠT'}
          color={keyData ? (daysLeft !== null && daysLeft > 0 ? '#00FF7F' : '#FFD700') : '#FF4500'}
        />
      </div>

      {/* Progress bar if key active */}
      {keyData && daysLeft !== null && totalDays !== null && totalDays > 0 && (
        <DaysBar days={Math.max(0, daysLeft)} total={totalDays} />
      )}
    </div>
  );
}
