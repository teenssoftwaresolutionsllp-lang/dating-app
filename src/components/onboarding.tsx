import { PropsWithChildren, useEffect, useState, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function PrimaryButton({ children, style, ...props }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: theme.primaryButton },
        Platform.OS === 'web' && styles.webPointer,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.primaryButtonText, { color: theme.text }]}>{children}</Text>
    </Pressable>
  );
}

export function OptionButton({ children, style, ...props }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.optionButton,
        { backgroundColor: theme.optionButton },
        Platform.OS === 'web' && styles.webPointer,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.optionButtonText, { color: theme.text }]}>{children}</Text>
    </Pressable>
  );
}

export function LegalFooter({ isArtworkFullScreen }: { isArtworkFullScreen?: boolean }) {
  const theme = useTheme();
  const textColor = isArtworkFullScreen ? 'rgba(255, 255, 255, 0.7)' : theme.text;
  return (
    <Text style={[styles.legal, { color: textColor }]}>
      By Continuing, you agree with our <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>
    </Text>
  );
}

export function RelationshipArtwork({ variant }: { variant: 'welcome' | 'otp' }) {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  // Container width constrained for tablets and web
  const slideWidth = Math.min(windowWidth, 480);

  const bgStyle = {
    backgroundColor: isDark ? '#1F2022' : '#ffffff',
  };

  const dynamicHeight = '48%';

  if (variant === 'welcome') {
    const images = [
      require('@/assets/images/image 2.png'),
      require('@/assets/images/OTP.png'),
      require('@/assets/images/login3.png'),
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * slideWidth,
          animated: true,
        });
        setActiveIndex(nextIndex);
      }, 3000);

      return () => clearInterval(timer);
    }, [activeIndex, images.length, slideWidth]);

    const handleScroll = (event: any) => {
      const scrollOffset = event.nativeEvent.contentOffset.x;
      const width = event.nativeEvent.layoutMeasurement.width || slideWidth;
      const index = Math.round(scrollOffset / width);
      if (index !== activeIndex && index >= 0 && index < images.length) {
        setActiveIndex(index);
      }
    };

    const activeColor = theme.text;
    const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';

    return (
      <View style={[styles.artwork, bgStyle, { height: dynamicHeight }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={[styles.carouselScrollView, { width: slideWidth }]}
        >
          {images.map((img, idx) => (
            <View key={idx} style={[styles.carouselSlide, { width: slideWidth }]}>
              <Image
                source={img}
                style={styles.artworkImage}
                contentFit="cover"
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.indicatorContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicatorDot,
                { backgroundColor: activeIndex === idx ? activeColor : inactiveColor },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  // OTP variant
  const source = require('@/assets/images/login2.png');

  return (
    <View style={[styles.artwork, styles.otpArtwork, bgStyle, { height: dynamicHeight }]}>
      <View style={{ width: slideWidth, height: '100%' }}>
        <Image
          source={source}
          style={styles.artworkImage}
          contentFit="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryButton,
  },
  primaryButtonText: {
    color: '#000000',
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.optionButton,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#B9B9B9',
  },
  optionButtonText: {
    color: Colors.light.text,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
  },
  webPointer: {
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as any) : {}),
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  legal: {
    color: Colors.light.text,
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 10,
    textAlign: 'center',
  },
  link: {
    color: '#1769FF',
  },
  artwork: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 310,
    overflow: 'hidden',
    width: '100%',
  },
  otpArtwork: {
    height: 310,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  carouselScrollView: {
    height: '100%',
    alignSelf: 'center',
  },
  carouselSlide: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
