import React from 'react';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

export function FemaleAvatar({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Background circle / glow */}
      <Circle cx="60" cy="60" r="50" fill="#FFF3E0" />
      
      <G>
        {/* Hair Back */}
        <Path
          d="M32 50C32 30 42 20 60 20C78 20 88 30 88 50C88 68 85 82 82 85C78 88 42 88 38 85C35 82 32 68 32 50Z"
          fill="#8D4925"
        />
        
        {/* Neck */}
        <Rect x="54" y="70" width="12" height="15" rx="3" fill="#FAD1B0" />

        {/* Clothing - Orange sweater */}
        <Path
          d="M35 105C35 90 44 82 60 82C76 82 85 90 85 105V115H35V105Z"
          fill="#F26522"
        />
        
        {/* Collar details */}
        <Path
          d="M52 82C52 87 68 87 68 82"
          stroke="#D84A07"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Face */}
        <Path
          d="M42 48C42 38 50 34 60 34C70 34 78 38 78 48C78 62 70 72 60 72C50 72 42 62 42 48Z"
          fill="#FAD1B0"
        />

        {/* Ears */}
        <Circle cx="41" cy="50" r="4" fill="#FAD1B0" />
        <Circle cx="79" cy="50" r="4" fill="#FAD1B0" />

        {/* Hair Front / Bangs */}
        <Path
          d="M40 44C44 32 55 30 60 33C65 30 76 32 80 44C74 38 66 37 60 40C54 37 46 38 40 44Z"
          fill="#6E3414"
        />

        {/* Eyebrows */}
        <Path d="M48 45C50 44 54 44 55 46" stroke="#4A200B" strokeWidth="2" strokeLinecap="round" />
        <Path d="M65 46C66 44 70 44 72 45" stroke="#4A200B" strokeWidth="2" strokeLinecap="round" />

        {/* Eyes */}
        <Circle cx="51" cy="50" r="2.5" fill="#2C1810" />
        <Circle cx="69" cy="50" r="2.5" fill="#2C1810" />

        {/* Nose */}
        <Path d="M60 52V55" stroke="#E3A880" strokeWidth="2" strokeLinecap="round" />

        {/* Smile */}
        <Path
          d="M52 60C54 64 66 64 68 60"
          stroke="#B5392B"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}

export function MaleAvatar({ size = 110 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Background circle */}
      <Circle cx="60" cy="60" r="50" fill="#E8F4F8" />
      
      <G>
        {/* Hair Back */}
        <Path
          d="M38 42C38 26 48 20 60 20C72 20 82 26 82 42V50H38V42Z"
          fill="#5D4037"
        />

        {/* Neck */}
        <Rect x="54" y="70" width="12" height="15" fill="#FAD1B0" />

        {/* Inner Shirt (Dark) */}
        <Path d="M52 82L60 92L68 82H52Z" fill="#1A237E" />

        {/* Clothing - Beige Blazer */}
        <Path
          d="M32 105C32 90 42 82 52 82L60 98L68 82C78 82 88 90 88 105V115H32V105Z"
          fill="#E5C3A6"
        />
        
        {/* Blazer Lapels */}
        <Path d="M42 84L52 96V115" stroke="#C59B79" strokeWidth="2" />
        <Path d="M78 84L68 96V115" stroke="#C59B79" strokeWidth="2" />

        {/* Face */}
        <Path
          d="M42 46C42 36 50 32 60 32C70 32 78 36 78 46C78 60 70 72 60 72C50 72 42 60 42 46Z"
          fill="#FAD1B0"
        />

        {/* Ears */}
        <Circle cx="40" cy="50" r="4.5" fill="#FAD1B0" />
        <Circle cx="80" cy="50" r="4.5" fill="#FAD1B0" />

        {/* Hair Top */}
        <Path
          d="M38 40C40 25 50 20 60 20C72 20 82 25 84 38C76 34 68 34 60 37C52 34 44 34 38 40Z"
          fill="#4E342E"
        />

        {/* Eyebrows */}
        <Path d="M47 44H55" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M65 44H73" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes */}
        <Circle cx="51" cy="50" r="2.5" fill="#1C100B" />
        <Circle cx="69" cy="50" r="2.5" fill="#1C100B" />

        {/* Nose */}
        <Path d="M60 51V56" stroke="#E3A880" strokeWidth="2" strokeLinecap="round" />

        {/* Broad Smile with teeth */}
        <Path
          d="M52 60C54 65 66 65 68 60Z"
          fill="#FFFFFF"
          stroke="#B5392B"
          strokeWidth="2"
        />
      </G>
    </Svg>
  );
}
