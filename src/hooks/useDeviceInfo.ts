import { useState } from 'react';

export interface DeviceInfo {
  deviceName: string;
  edition: string;
  version: string;
}

export function useDeviceInfo(): DeviceInfo {
  const [info] = useState<DeviceInfo>({
    deviceName: 'DESKTOP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    edition: 'Windows 11 Pro',
    version: '23H2 (Build 22631)',
  });
  return info;
}
