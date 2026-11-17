import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'error' | 'success' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

type ToastListener = (options: ToastOptions | null) => void;

class ToastManager {
  private listener: ToastListener | null = null;

  register(listener: ToastListener) {
    this.listener = listener;
  }

  unregister() {
    this.listener = null;
  }

  show(message: string, type: ToastType = 'error', duration = 3500) {
    if (this.listener) {
      this.listener({ message, type, duration });
    }
  }

  hide() {
    if (this.listener) {
      this.listener(null);
    }
  }
}

export const toast = new ToastManager();

export const showToast = (message: string, type: ToastType = 'error', duration = 3500) => {
  toast.show(message, type, duration);
};

export const AppToastOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    toast.register((options) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (!options) {
        dismissToast();
        return;
      }

      setCurrentToast(options);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 140,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      hideTimer.current = setTimeout(() => {
        dismissToast();
      }, options.duration || 3500);
    });

    return () => {
      toast.unregister();
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentToast(null);
    });
  };

  if (!currentToast) return null;

  const isError = currentToast.type === 'error';
  const isSuccess = currentToast.type === 'success';

  const iconName = isError
    ? 'alert-circle'
    : isSuccess
    ? 'checkmark-circle'
    : 'information-circle';

  const accentColor = isError ? '#FF3B30' : isSuccess ? '#34C759' : '#00E4E8';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 16),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismissToast}
        style={[styles.toastCard, { borderLeftColor: accentColor }]}
      >
        <Ionicons name={iconName} size={22} color={accentColor} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.messageText} numberOfLines={3}>
            {currentToast.message}
          </Text>
        </View>
        <Ionicons name="close" size={18} color="#8E8E93" style={styles.closeIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DM_Sans_500Medium',
    lineHeight: 19,
  },
  closeIcon: {
    marginLeft: 8,
  },
});

