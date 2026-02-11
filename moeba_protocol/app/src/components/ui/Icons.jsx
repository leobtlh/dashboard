import React from 'react';

// Wrapper générique pour éviter la répétition (comme dans app.html)
const IconWrapper = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const Shield = ({ className }) => <IconWrapper className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconWrapper>;
export const Wind = ({ className }) => <IconWrapper className={className}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></IconWrapper>;
export const Activity = ({ className }) => <IconWrapper className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></IconWrapper>;
export const Wallet = ({ className }) => <IconWrapper className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></IconWrapper>;
export const AlertTriangle = ({ className }) => <IconWrapper className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></IconWrapper>;
export const TrendingUp = ({ className }) => <IconWrapper className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></IconWrapper>;
export const Lock = ({ className }) => <IconWrapper className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconWrapper>;
export const Plus = ({ className }) => <IconWrapper className={className}><path d="M5 12h14"/><path d="M12 5v14"/></IconWrapper>;
export const ArrowRight = ({ className }) => <IconWrapper className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></IconWrapper>;
export const ArrowLeft = ({ className }) => <IconWrapper className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></IconWrapper>;
export const CheckCircle2 = ({ className }) => <IconWrapper className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></IconWrapper>;
export const Building2 = ({ className }) => <IconWrapper className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></IconWrapper>;
export const Coins = ({ className }) => <IconWrapper className={className}><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></IconWrapper>;
export const FileText = ({ className }) => <IconWrapper className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></IconWrapper>;
export const Info = ({ className }) => <IconWrapper className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></IconWrapper>;
export const X = ({ className }) => <IconWrapper className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconWrapper>;
export const LogOut = ({ className }) => <IconWrapper className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></IconWrapper>;
export const RefreshCw = ({ className }) => <IconWrapper className={className}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></IconWrapper>;
export const Zap = ({ className }) => <IconWrapper className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconWrapper>;
export const UserCheck = ({ className }) => <IconWrapper className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></IconWrapper>;
export const Minimize2 = ({ className }) => <IconWrapper className={className}><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></IconWrapper>;
export const LayoutGrid = ({ className }) => <IconWrapper className={className}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></IconWrapper>;
export const List = ({ className }) => <IconWrapper className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></IconWrapper>;
export const ChevronDown = ({ className }) => <IconWrapper className={className}><polyline points="6 9 12 15 18 9"/></IconWrapper>;
export const Search = ({ className }) => <IconWrapper className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></IconWrapper>;
export const Calendar = ({ className }) => <IconWrapper className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></IconWrapper>;

export const Globe = ({ className }) => (
    <IconWrapper className={className}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2v20" />
            <path d="M12 2C6 2 6 22 12 22" />
            <path d="M12 2C18 2 18 22 12 22" />
        </svg>
    </IconWrapper>
);

export const Sun = ({ className }) => (
    <IconWrapper className={className}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </IconWrapper>
);

export const Moon = ({ className }) => <IconWrapper className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></IconWrapper>;
