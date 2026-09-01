import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export function GovernmentIdIcon({ size = 52, color = '#6B7280' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Background Document */}
      <Rect
        x="18"
        y="10"
        width="34"
        height="44"
        rx="4"
        stroke={color}
        strokeWidth="2.5"
        fill="#FFFFFF"
      />
      {/* Foreground Document */}
      <Rect
        x="12"
        y="14"
        width="34"
        height="44"
        rx="4"
        stroke={color}
        strokeWidth="2.5"
        fill="#FFFFFF"
      />
      {/* Document header line */}
      <Rect x="17" y="20" width="14" height="4" rx="2" fill={color} />
      {/* List items */}
      <Circle cx="19" cy="30" r="1.5" fill={color} />
      <Path d="M23 30H39" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      <Circle cx="19" cy="36" r="1.5" fill={color} />
      <Path d="M23 36H39" stroke={color} strokeWidth="2" strokeLinecap="round" />

      <Circle cx="19" cy="42" r="1.5" fill={color} />
      <Path d="M23 42H39" stroke={color} strokeWidth="2" strokeLinecap="round" />

      <Circle cx="19" cy="48" r="1.5" fill={color} />
      <Path d="M23 48H33" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function SelfieScanIcon({ size = 52, color = '#6B7280' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Viewfinder Corners */}
      {/* Top Left */}
      <Path
        d="M14 22V16C14 14.8954 14.8954 14 16 14H22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Top Right */}
      <Path
        d="M42 14H48C49.1046 14 50 14.8954 50 16V22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bottom Left */}
      <Path
        d="M14 42V48C14 49.1046 14.8954 50 16 50H22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bottom Right */}
      <Path
        d="M42 50H48C49.1046 50 50 49.1046 50 48V42"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Person Silhouette */}
      <Circle cx="32" cy="27" r="6" fill={color} />
      <Path
        d="M22 43C22 37.4772 26.4772 33 32 33C37.5228 33 42 37.4772 42 43V44H22V43Z"
        fill={color}
      />
    </Svg>
  );
}
