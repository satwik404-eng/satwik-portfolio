export function Icon({ name, size = 18 }: { name: 'up-right' | 'down' | 'right' | 'left' | 'plus' | 'replay' | 'menu' | 'close' | 'up'; size?: number }) {
  const paths = {
    'up-right': 'M6 18 18 6M7 6h11v11',
    down: 'M12 4v15m-6-6 6 6 6-6',
    up: 'M12 20V5m-6 6 6-6 6 6',
    right: 'M4 12h15m-6-6 6 6-6 6',
    left: 'M20 12H5m6-6-6 6 6 6',
    plus: 'M12 5v14M5 12h14',
    replay: 'M4 11a8 8 0 1 1 2.5 6M4 5v6h6',
    menu: 'M3 8h18M3 16h18',
    close: 'm5 5 14 14M19 5 5 19',
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
