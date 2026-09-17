import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

export function SubscriptionIcon({ size = 26, color = '#0F766E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="13" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M7 8h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M7 11h2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M13.5 13.5l1.5 1.5 3.5-3.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 17l1.5 3.5L16 17" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </Svg>
  );
}

export function TermsDocIcon({ size = 26, color = '#0F766E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2.5" width="16" height="19" rx="2.5" stroke={color} strokeWidth="1.8" />
      <Path d="M8 7h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M8 10.5h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M12 13.5c-1.5 0-2.8.8-2.8 2.2 0 1.8 2.8 3.3 2.8 3.3s2.8-1.5 2.8-3.3c0-1.4-1.3-2.2-2.8-2.2z"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.15"
      />
      <Path
        d="M11 15.5l.8.8 1.4-1.4"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SafetyBadgeIcon({ size = 26, color = '#0F766E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2.5" width="16" height="19" rx="3" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="7" r="1.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M12 10.5c-2 0-3.5 1-3.5 2.8 0 2.2 3.5 4.2 3.5 4.2s3.5-2 3.5-4.2c0-1.8-1.5-2.8-3.5-2.8z"
        stroke={color}
        strokeWidth="1.6"
        fill={color}
        fillOpacity="0.15"
      />
      <Path
        d="M10.8 13.2l1 1 1.8-1.8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrustRosetteIcon({ size = 26, color = '#0F766E' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9.5" r="5.5" stroke={color} strokeWidth="1.8" />
      <Path
        d="M10.2 9.5l1.3 1.3 2.5-2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8.5 14.5L7 21l5-2.5 5 2.5-1.5-6.5" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export function LargeDocShieldIcon({ size = 64, color = '#2DD4BF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 74" fill="none">
      <Rect x="12" y="8" width="40" height="52" rx="6" stroke={color} strokeWidth="3" />
      <Path d="M22 20h20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <Path d="M22 28h20" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Shield in center */}
      <Path
        d="M32 36c-5.5 0-9.5 2.8-9.5 7.5 0 6 9.5 11.5 9.5 11.5s9.5-5.5 9.5-11.5c0-4.7-4-7.5-9.5-7.5z"
        stroke={color}
        strokeWidth="2.8"
        fill={color}
        fillOpacity="0.25"
      />
      <Path
        d="M28.5 43.5l2.5 2.5 5-5"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DeactivateShieldIcon({ size = 26, color = '#14B8A6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5L5 6.5v6c0 4.5 3.5 8 7 9.5 3.5-1.5 7-5 7-9.5v-6l-7-3z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12.5" r="3" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

export function TrustHandsGraphic({ size = 68, color = '#0D7A74' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* 3 People heads */}
      <Circle cx="32" cy="12" r="4.5" fill={color} />
      <Circle cx="21" cy="18" r="3.8" fill={color} />
      <Circle cx="43" cy="18" r="3.8" fill={color} />
      {/* Center connection */}
      <Path
        d="M26 21c0-1.5 2.5-3 6-3s6 1.5 6 3c-1.5 2-3.5 3.5-6 3.5s-4.5-1.5-6-3.5z"
        fill={color}
      />
      {/* Left arm/shoulder */}
      <Path
        d="M14 27c0-3 3-5.5 6.5-6.5l3.5 5-4.5 4.5c-2.5-1-4.5-2.2-5.5-3z"
        fill={color}
      />
      {/* Right arm/shoulder */}
      <Path
        d="M50 27c0-3-3-5.5-6.5-6.5l-3.5 5 4.5 4.5c2.5-1 4.5-2.2 5.5-3z"
        fill={color}
      />
      {/* Handshake fingers / heart base */}
      <Path
        d="M32 49l-9-9c-2-2-2-5.5 0-7.5l4-4 5 5 5-5 4 4c2 2 2 5.5 0 7.5l-9 9z"
        fill={color}
      />
      {/* Interlaced grip lines (cutouts) */}
      <Path
        d="M27.5 33.5l9 9M36.5 33.5l-9 9M24.5 36.5l6 6M39.5 36.5l-6 6"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DeactivatePauseGraphic({ size = 76, color = '#0D7A74' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <Circle cx="36" cy="36" r="30" stroke={color} strokeWidth="4.5" />
      <Rect x="28" y="24" width="5" height="24" rx="2.5" fill={color} />
      <Rect x="39" y="24" width="5" height="24" rx="2.5" fill={color} />
    </Svg>
  );
}

export function DeleteTrashGraphic({ size = 68, color = '#FF0000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 68" fill="none">
      {/* Knob */}
      <Path d="M29 13c0-2.5 6-2.5 6 0" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Lid */}
      <Rect x="17" y="15" width="30" height="6" rx="3" stroke={color} strokeWidth="3" fill="none" />
      {/* Body */}
      <Path
        d="M21 23l2.8 30.5c.3 3.5 3.2 6.5 6.7 6.5h3c3.5 0 6.4-3 6.7-6.5L43 23"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner stripes */}
      <Rect x="27.5" y="30" width="3.5" height="18" rx="1.75" fill={color} />
      <Rect x="34" y="30" width="3.5" height="18" rx="1.75" fill={color} />
    </Svg>
  );
}

export function WarningTriangleGraphic({ size = 68, color = '#FF0000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 58" fill="none">
      <Path
        d="M29.2 5.5c1.4-2.4 4.2-2.4 5.6 0l25.6 44.5c1.4 2.4 0 5.5-2.8 5.5H6.4c-2.8 0-4.2-3.1-2.8-5.5L29.2 5.5z"
        fill={color}
      />
      <Rect x="30" y="20" width="4" height="15" rx="2" fill="#FFFFFF" />
      <Circle cx="32" cy="42" r="2.5" fill="#FFFFFF" />
    </Svg>
  );
}

export function LogoutDoorGraphic({ size = 68, color = '#0D7A74' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Outer Door Frame */}
      <Path
        d="M32 14h14v36H32"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small hinge indicators on frame */}
      <Path d="M46 22v4M46 42v4" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      {/* Swung open door in 3D perspective */}
      <Path
        d="M18 18L32 14v36l-14-4V18z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Doorknob on the door */}
      <Circle cx="28.5" cy="32.5" r="2" stroke={color} strokeWidth="2" />
      {/* Arrow pointing to right through doorway */}
      <Path
        d="M26 32h24M43 25l7 7-7 7"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LogoutModalIcon({ size = 44, color = '#0D7A74' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Frame */}
      <Path
        d="M24 13h-8c-1.65 0-3 1.35-3 3v16c0 1.65 1.35 3 3 3h8"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow */}
      <Path
        d="M18 24h18M30 17l7 7-7 7"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
