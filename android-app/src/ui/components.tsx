import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {
  color,
  font,
  fontSize,
  palette,
  radius,
  shadow,
  space,
  tone as tones,
  Tone,
  touch,
} from './theme';

/** Legacy names kept so every screen picks up the Horizon palette. */
export const colors = {
  bg: color.background,
  card: color.surface,
  text: color.textPrimary,
  muted: color.textMuted,
  border: color.border,
  primary: color.primary,
  success: color.positive,
  warning: color.warning,
  danger: color.critical,
  info: color.info,
  dark: color.header,
};

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Card({
  title,
  icon: Icon,
  children,
  right,
}: {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {(title || right) && (
        <View style={styles.row}>
          <View style={styles.titleRow}>
            {Icon && <Icon size={18} color={color.primary} />}
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: {
    bg: color.primary,
    fg: color.textOnPrimary,
    border: color.primary,
  },
  secondary: { bg: color.surface, fg: color.primary, border: color.primary },
  tertiary: { bg: 'transparent', fg: color.primary, border: 'transparent' },
  danger: {
    bg: color.critical,
    fg: color.textOnPrimary,
    border: color.critical,
  },
  success: {
    bg: color.positive,
    fg: color.textOnPrimary,
    border: color.positive,
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon: Icon,
  disabled,
  busy,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: LucideIcon;
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            pressed && variant === 'primary' ? color.primaryPressed : v.bg,
          borderColor: v.border,
          opacity: disabled ? 0.4 : pressed && variant !== 'primary' ? 0.7 : 1,
        },
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.buttonInner}>
          {Icon && <Icon size={18} color={v.fg} />}
          <Text style={[styles.buttonText, { color: v.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Icon-only action with a 44×44 tappable area. */
export function IconButton({
  icon: Icon,
  label,
  onPress,
  tint = color.primary,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  tint?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
      ]}
    >
      <Icon size={20} color={tint} />
    </Pressable>
  );
}

/** Floating action button: the screen's main action, within thumb reach. */
export function Fab({
  icon: Icon,
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
}) {
  const bg = variant === 'danger' ? color.critical : color.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: pressed ? color.primaryPressed : bg,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Icon size={22} color={color.textOnPrimary} />
      <Text style={styles.fabText}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={color.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={label}
        {...props}
        onFocus={e => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, props.style]}
      />
    </View>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={[styles.row, styles.toggle]}>
      <Text style={[styles.text, styles.flex1]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: palette.primary0, false: palette.neutral3 }}
        thumbColor={value ? color.primary : palette.neutral0}
      />
    </View>
  );
}

/** Horizon choice input rendered as selectable chips. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const TONE_BY_COLOR: Record<string, Tone> = {
  [colors.primary]: 'primary',
  [colors.success]: 'positive',
  [colors.danger]: 'critical',
  [colors.warning]: 'warning',
  [colors.info]: 'info',
  [colors.muted]: 'neutral',
};

/** Horizon highlighted value / tag. `color` accepts the legacy colours above. */
export function Badge({
  text,
  color: legacy,
  tone,
}: {
  text: string;
  color?: string;
  tone?: Tone;
}) {
  const t = tones[tone ?? TONE_BY_COLOR[legacy ?? ''] ?? 'primary'];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

export function KeyValue({ k, v }: { k: string; v?: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{k}</Text>
      <Text style={styles.mono}>
        {v === undefined || v === '' ? '—' : String(v)}
      </Text>
    </View>
  );
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

/** Horizon empty state: icon, headline, guidance and an optional action. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={28} color={color.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
      {action}
    </View>
  );
}

export const styles = StyleSheet.create({
  screenScroll: { flex: 1, backgroundColor: color.background },
  screen: {
    flexGrow: 1,
    padding: space.sm2,
    gap: space.sm2,
    backgroundColor: color.background,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: space.md1,
    gap: space.sm2,
    ...shadow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  cardTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md2,
    color: color.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  button: {
    minHeight: touch.min,
    paddingHorizontal: space.md1,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  buttonText: { fontFamily: font.bold, fontSize: fontSize.md1 },
  iconButton: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: touch.min / 2,
  },
  fab: {
    position: 'absolute',
    right: space.md1,
    bottom: space.md1,
    minHeight: 56,
    paddingHorizontal: space.lg,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    ...shadow,
    elevation: 6,
  },
  fabText: {
    fontFamily: font.bold,
    fontSize: fontSize.md1,
    color: color.textOnPrimary,
  },
  field: { gap: space.xs },
  label: {
    fontFamily: font.bold,
    fontSize: fontSize.sm,
    color: color.textSecondary,
  },
  input: {
    minHeight: touch.min,
    borderWidth: 1,
    borderColor: color.borderStrong,
    borderRadius: radius.button,
    paddingHorizontal: space.sm2,
    paddingVertical: space.sm,
    color: color.textPrimary,
    backgroundColor: color.surface,
    fontFamily: font.regular,
    fontSize: fontSize.md1,
  },
  inputFocused: { borderColor: color.primary, borderWidth: 2 },
  toggle: { minHeight: touch.min },
  text: {
    fontFamily: font.regular,
    color: color.textPrimary,
    fontSize: fontSize.md1,
  },
  muted: {
    fontFamily: font.regular,
    color: color.textTertiary,
    fontSize: fontSize.md,
  },
  mono: {
    fontFamily: font.mono,
    color: color.textPrimary,
    fontSize: fontSize.md,
    flexShrink: 1,
    textAlign: 'right',
  },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  segment: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: space.sm2,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  segmentActive: {
    backgroundColor: palette.primary0,
    borderColor: color.primary,
  },
  segmentText: {
    fontFamily: font.bold,
    color: color.textSecondary,
    fontSize: fontSize.md,
  },
  segmentTextActive: { color: palette.primary2 },
  badge: {
    borderRadius: radius.chip,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  badgeText: { fontFamily: font.bold, fontSize: fontSize.sm },
  flex1: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: space.lg2, gap: space.sm },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md1,
    color: color.textPrimary,
  },
  emptyMessage: {
    fontFamily: font.regular,
    fontSize: fontSize.md,
    color: color.textTertiary,
    textAlign: 'center',
    paddingHorizontal: space.lg,
  },
});
