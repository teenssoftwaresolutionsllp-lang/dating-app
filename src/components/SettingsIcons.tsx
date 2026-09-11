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
