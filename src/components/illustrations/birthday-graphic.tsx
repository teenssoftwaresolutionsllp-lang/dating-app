import React from 'react';
import Svg, { Circle, Path, G, Rect, Line, Polygon, Ellipse } from 'react-native-svg';

export function BirthdayGraphic({ width = 300, height = 160 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 180" fill="none">
      {/* Background shadow / base */}
      <Ellipse cx="160" cy="165" rx="140" ry="10" fill="#EEF2FF" />

      {/* Balloons */}
      <G>
        {/* Yellow Balloon */}
        <Line x1="120" y1="50" x2="125" y2="100" stroke="#CBD5E1" strokeWidth="1.5" />
        <Ellipse cx="120" cy="45" rx="12" ry="16" fill="#FBBF24" />
        <Polygon points="118,61 122,61 120,64" fill="#F59E0B" />

        {/* Blue Balloon */}
        <Line x1="140" y1="48" x2="135" y2="98" stroke="#CBD5E1" strokeWidth="1.5" />
        <Ellipse cx="140" cy="42" rx="11" ry="15" fill="#818CF8" />
        <Polygon points="138,57 142,57 140,60" fill="#6366F1" />
      </G>

      {/* Confetti */}
      <G opacity={0.7}>
        <Circle cx="190" cy="30" r="2" fill="#F43F5E" />
        <Circle cx="205" cy="45" r="2.5" fill="#3B82F6" />
        <Circle cx="175" cy="40" r="2" fill="#10B981" />
        <Rect x="210" y="25" width="4" height="4" fill="#F59E0B" transform="rotate(20 210 25)" />
        <Rect x="180" y="20" width="3" height="6" fill="#8B5CF6" transform="rotate(-30 180 20)" />
      </G>

      {/* Person 1 (Far Left - Man with Bottle) */}
      <G>
        {/* Body/Shirt */}
        <Path d="M80 110C80 98 88 92 98 92C108 92 116 98 116 110V160H80V110Z" fill="#6B21A8" />
        {/* Legs */}
        <Rect x="86" y="140" width="10" height="25" fill="#1E293B" />
        <Rect x="100" y="140" width="10" height="25" fill="#1E293B" />
        {/* Head & Hat */}
        <Circle cx="98" cy="78" r="10" fill="#FCA5A5" />
        <Polygon points="98,60 90,75 106,75" fill="#F59E0B" />
        {/* Bottle Raised */}
        <Path d="M78 80L84 95" stroke="#FCA5A5" strokeWidth="4" strokeLinecap="round" />
        <Rect x="72" y="65" width="8" height="18" rx="2" fill="#047857" />
      </G>

      {/* Person 2 (Woman with arms up) */}
      <G>
        <Path d="M115 118C115 106 122 102 132 102C142 102 149 106 149 118V160H115V118Z" fill="#334155" />
        <Rect x="120" y="145" width="9" height="20" fill="#475569" />
        <Rect x="134" y="145" width="9" height="20" fill="#475569" />
        <Circle cx="132" cy="88" r="9" fill="#FDBA74" />
        <Polygon points="132,70 125,85 139,85" fill="#EF4444" />
      </G>

      {/* Person 3 (Woman standing middle) */}
      <G>
        <Path d="M148 112C148 100 156 96 166 96C176 96 184 100 184 112V160H148V112Z" fill="#D97706" />
        <Rect x="153" y="140" width="10" height="25" fill="#B45309" />
        <Rect x="168" y="140" width="10" height="25" fill="#B45309" />
        <Circle cx="166" cy="82" r="10" fill="#FED7AA" />
        <Polygon points="166,64 158,79 174,79" fill="#3B82F6" />
      </G>

      {/* Gift Box on Floor */}
      <G>
        <Rect x="175" y="142" width="22" height="22" rx="3" fill="#E0E7FF" />
        <Rect x="184" y="142" width="4" height="22" fill="#F43F5E" />
        <Rect x="175" y="151" width="22" height="4" fill="#F43F5E" />
        <Circle cx="186" cy="141" r="3" fill="#F43F5E" />
      </G>

      {/* Person 4 (Man holding Cake) */}
      <G>
        <Path d="M192 115C192 103 200 98 210 98C220 98 228 103 228 115V160H192V115Z" fill="#93C5FD" />
        <Rect x="197" y="142" width="10" height="23" fill="#1E3A8A" />
        <Rect x="212" y="142" width="10" height="23" fill="#1E3A8A" />
        <Circle cx="210" cy="85" r="9.5" fill="#FDE68A" />
        <Polygon points="210,67 203,82 217,82" fill="#F59E0B" />
        {/* Cake in hands */}
        <Rect x="180" y="106" width="24" height="14" rx="2" fill="#F472B6" />
        <Rect x="182" y="103" width="20" height="4" fill="#FFFFFF" />
        {/* Candles */}
        <Line x1="187" y1="103" x2="187" y2="98" stroke="#F59E0B" strokeWidth="1.5" />
        <Line x1="192" y1="103" x2="192" y2="98" stroke="#EF4444" strokeWidth="1.5" />
        <Line x1="197" y1="103" x2="197" y2="98" stroke="#3B82F6" strokeWidth="1.5" />
      </G>

      {/* Person 5 & 6 (Right Side Friends) */}
      <G>
        {/* Woman standing */}
        <Path d="M232 110C232 98 240 94 250 94C260 94 268 98 268 110V160H232V110Z" fill="#FCD34D" />
        <Rect x="237" y="140" width="10" height="25" fill="#78350F" />
        <Rect x="252" y="140" width="10" height="25" fill="#78350F" />
        <Circle cx="250" cy="80" r="10" fill="#FECDD3" />
        <Polygon points="250,62 242,77 258,77" fill="#10B981" />

        {/* Man on far right cheering */}
        <Path d="M266 112C266 100 274 95 284 95C294 95 302 100 302 112V160H266V112Z" fill="#475569" />
        <Rect x="271" y="142" width="10" height="23" fill="#0F172A" />
        <Rect x="286" y="142" width="10" height="23" fill="#0F172A" />
        <Circle cx="284" cy="82" r="9.5" fill="#FDE68A" />
        <Polygon points="284,64 277,79 291,79" fill="#8B5CF6" />
      </G>
    </Svg>
  );
}
