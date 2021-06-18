export interface ScannerProps {
  maxAttempts: number;
  scanDurationInSeconds: number;
  onScan: (durationInSeconds: number) => void;
}

export interface Scanner {
  reset: () => void;
  scan: () => void;
  resetAndScan: () => void;
  /*
  reScan as a quick fix for dealing async event flow, todo: redux like state management.
  This is to be called only when it's safe to rescan (ie after scan has finished, so that we wont scan while
  trying to connect to a device
  ).
   */
  reScan: () => void;
  hasRunMaxAttempts: () => boolean;
}

const Scanner = ({
  maxAttempts = 1,
  scanDurationInSeconds = 3000,
  onScan
}: ScannerProps): Scanner => {
  type ScanStatus = 'scanning' | 'idle';
  let scanStatus: ScanStatus = 'idle';
  let currentIteration = 0;

  const reset = (): void => {
    currentIteration = 0;
    scanStatus = 'idle';
  };

  const scan = (allowedStatus: ScanStatus): void => {
    if (scanStatus === allowedStatus && currentIteration < maxAttempts) {
      scanStatus = 'scanning';
      currentIteration = ++currentIteration;
      onScan(scanDurationInSeconds);
    }
  };

  return {
    reset,
    scan: () => scan('idle'),
    reScan: () => scan('scanning'),
    resetAndScan: () => {
      reset();
      scan('idle');
    },
    hasRunMaxAttempts: () => currentIteration >= maxAttempts
  };
};

export default Scanner;
