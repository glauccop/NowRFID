import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import {
  color,
  font,
  fontSize,
  radius,
  shadow,
  space,
  tone as tones,
} from './theme';

type ToastTone = 'positive' | 'critical' | 'info';

interface ToastState {
  message: string;
  tone: ToastTone;
}

const ICONS = { positive: CircleCheck, critical: CircleAlert, info: Info };
const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(
  () => undefined,
);

/** Horizon "mobile alert" toast: short, non-blocking confirmation above the navigation bar. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: ToastTone = 'positive') => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      setToast({ message, tone });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 2600);
    },
    [opacity],
  );

  const value = useMemo(() => show, [show]);
  const Icon = toast ? ICONS[toast.tone] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && Icon && (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[s.toast, { opacity, borderLeftColor: tones[toast.tone].fg }]}
        >
          <Icon size={20} color={tones[toast.tone].fg} />
          <Text style={s.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const s = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space.md1,
    right: space.md1,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm2,
    padding: space.sm2,
    borderRadius: radius.button,
    borderLeftWidth: 4,
    backgroundColor: color.surface,
    ...shadow,
    elevation: 8,
  },
  text: {
    flex: 1,
    fontFamily: font.bold,
    fontSize: fontSize.md,
    color: color.textPrimary,
  },
});
