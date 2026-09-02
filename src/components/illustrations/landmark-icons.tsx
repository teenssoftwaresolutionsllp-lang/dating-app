import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polygon, G } from 'react-native-svg';

const strokeColor = '#333333';
const strokeWidth = 1.6;

export function HyderabadIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Charminar Structure */}
        {/* Base */}
        <Rect x="8" y="28" width="34" height="16" rx="1" fill="none" />
        {/* Main Arch */}
        <Path d="M20 44V34C20 31.5 22 30 25 30C28 30 30 31.5 30 34V44" fill="none" />
        {/* Side Arches */}
        <Path d="M12 44V38C12 36 13.5 35 15 35C16.5 35 18 36 18 38V44" fill="none" />
        <Path d="M32 44V38C32 36 33.5 35 35 35C36.5 35 38 36 38 38V44" fill="none" />
        {/* Upper Balcony */}
        <Rect x="6" y="24" width="38" height="4" fill="none" />
        {/* 4 Towers / Minarets */}
        <Rect x="8" y="12" width="5" height="12" fill="none" />
        <Rect x="37" y="12" width="5" height="12" fill="none" />
        <Rect x="18" y="16" width="4" height="8" fill="none" />
        <Rect x="28" y="16" width="4" height="8" fill="none" />
        {/* Minaret Domes */}
        <Path d="M8 12C8 9 10.5 7 10.5 7C10.5 7 13 9 13 12" fill="none" />
        <Path d="M37 12C37 9 39.5 7 39.5 7C39.5 7 42 9 42 12" fill="none" />
        {/* Small center dome */}
        <Path d="M21 16C21 13 25 11 25 11C25 11 29 13 29 16" fill="none" />
      </G>
    </Svg>
  );
}

export function DelhiIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* India Gate Structure */}
        {/* Base */}
        <Line x1="4" y1="44" x2="46" y2="44" />
        <Rect x="8" y="38" width="34" height="6" fill="none" />
        {/* Pillars */}
        <Rect x="10" y="18" width="10" height="20" fill="none" />
        <Rect x="30" y="18" width="10" height="20" fill="none" />
        {/* Central Arch */}
        <Path d="M20 38V28C20 23 23.5 21 25 21C26.5 21 30 23 30 28V38" fill="none" />
        {/* Top Cornice */}
        <Rect x="7" y="14" width="36" height="4" fill="none" />
        {/* Upper Attic */}
        <Rect x="12" y="8" width="26" height="6" fill="none" />
        {/* Top Feature */}
        <Rect x="19" y="5" width="12" height="3" fill="none" />
      </G>
    </Svg>
  );
}

export function ChennaiIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Temple Gopuram Pyramid Tier Structure */}
        <Line x1="4" y1="44" x2="46" y2="44" />
        {/* Level 1 - Base Arch */}
        <Rect x="8" y="34" width="34" height="10" fill="none" />
        <Path d="M21 44V38C21 36 23 35 25 35C27 35 29 36 29 38V44" fill="none" />
        {/* Tier 2 */}
        <Polygon points="10,34 13,24 37,24 40,34" fill="none" />
        <Line x1="20" y1="24" x2="20" y2="34" />
        <Line x1="25" y1="24" x2="25" y2="34" />
        <Line x1="30" y1="24" x2="30" y2="34" />
        {/* Tier 3 */}
        <Polygon points="14,24 17,15 33,15 36,24" fill="none" />
        <Line x1="22" y1="15" x2="22" y2="24" />
        <Line x1="28" y1="15" x2="28" y2="24" />
        {/* Top Crown Kalashas */}
        <Rect x="18" y="10" width="14" height="5" fill="none" />
        <Line x1="20" y1="6" x2="20" y2="10" />
        <Line x1="25" y1="5" x2="25" y2="10" />
        <Line x1="30" y1="6" x2="30" y2="10" />
      </G>
    </Svg>
  );
}

export function BengaluruIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Vidhana Soudha Structure */}
        <Line x1="4" y1="44" x2="46" y2="44" />
        <Rect x="8" y="30" width="34" height="14" fill="none" />
        {/* Columns */}
        <Line x1="14" y1="30" x2="14" y2="44" />
        <Line x1="20" y1="30" x2="20" y2="44" />
        <Line x1="25" y1="30" x2="25" y2="44" />
        <Line x1="30" y1="30" x2="30" y2="44" />
        <Line x1="36" y1="30" x2="36" y2="44" />
        {/* Grand Steps */}
        <Rect x="18" y="38" width="14" height="6" fill="none" />
        {/* Roof line */}
        <Rect x="6" y="26" width="38" height="4" fill="none" />
        {/* Center Dome */}
        <Path d="M17 26C17 18 21 14 25 14C29 14 33 18 33 26" fill="none" />
        {/* Side Domes */}
        <Path d="M8 26C8 21 11 19 13 26" fill="none" />
        <Path d="M37 26C37 19 40 21 42 26" fill="none" />
        {/* Top Spire */}
        <Line x1="25" y1="8" x2="25" y2="14" />
        <Circle cx="25" cy="7" r="1.5" />
      </G>
    </Svg>
  );
}

export function ThiruvananthapuramIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Kerala Houseboat / Shikara */}
        {/* Water lines */}
        <Path d="M4 42C10 40 15 44 22 42C29 40 35 44 46 42" />
        <Path d="M8 46C14 44 19 48 26 46C33 44 39 48 44 46" opacity={0.6} />
        {/* Boat Hull */}
        <Path d="M6 34C14 38 34 38 44 32L40 37C30 41 12 41 6 34Z" fill="none" />
        {/* Curved Thatched Roof */}
        <Path d="M12 34C12 20 22 18 34 22C38 24 40 31 40 34" fill="none" />
        {/* Roof Textures / Ribs */}
        <Line x1="18" y1="33" x2="18" y2="22" />
        <Line x1="24" y1="34" x2="24" y2="20" />
        <Line x1="30" y1="34" x2="30" y2="21" />
        <Line x1="35" y1="33" x2="35" y2="23" />
        {/* Front Canopy */}
        <Path d="M6 34L12 28" />
      </G>
    </Svg>
  );
}

export function AhmedabadIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <G stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Statue of Unity Monument */}
        <Line x1="8" y1="44" x2="42" y2="44" />
        {/* Base Pedestal */}
        <Polygon points="14,44 16,36 34,36 36,44" fill="none" />
        <Rect x="18" y="32" width="14" height="4" fill="none" />
        {/* Statue Figure Outline */}
        <Path d="M22 32L21 20C19 18 18 14 20 12C22 10 28 10 30 12C32 14 31 18 29 20L28 32" fill="none" />
        {/* Head */}
        <Circle cx="25" cy="11" r="3.5" fill="none" />
        {/* Draped Shawl/Vest details */}
        <Path d="M20 16C23 18 27 18 30 16" />
        <Line x1="25" y1="18" x2="25" y2="32" />
      </G>
    </Svg>
  );
}
