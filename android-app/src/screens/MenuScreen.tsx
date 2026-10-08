import { ChevronRight, Settings, Wrench } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_VERSION } from '../network/serviceNow';
import { useNav } from '../ui/nav';
import type { StackScreen } from '../ui/nav';
import { Screen } from '../ui/components';
import { color, font, fontSize, radius, space, touch } from '../ui/theme';

const ENTRIES: {
  screen: StackScreen;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    screen: 'settings',
    label: 'Ajustes',
    hint: 'Instância ServiceNow, autenticação e opções do app',
    icon: Settings,
  },
  {
    screen: 'tools',
    label: 'Ferramentas',
    hint: 'Memória, lock, kill, localizar tag e configuração do leitor',
    icon: Wrench,
  },
];

/** Full-screen hub behind the gear: one big stacked button per function. */
export function MenuScreen() {
  const nav = useNav();
  return (
    <Screen>
      {ENTRIES.map(e => (
        <Pressable
          key={e.screen}
          onPress={() => nav.push(e.screen)}
          accessibilityRole="button"
          accessibilityLabel={e.label}
          style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
        >
          <View style={styles.icon}>
            <e.icon size={28} color={color.primary} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.label}>{e.label}</Text>
            <Text style={styles.hint}>{e.hint}</Text>
          </View>
          <ChevronRight size={22} color={color.textMuted} />
        </Pressable>
      ))}
      <Text style={styles.version}>NowRFID versão {APP_VERSION}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md1,
    minHeight: touch.min * 2,
    padding: space.md1,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  pressed: { backgroundColor: color.primarySoft },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primarySoft,
  },
  texts: { flex: 1, gap: space.xxs },
  label: {
    fontFamily: font.bold,
    fontSize: fontSize.md2,
    color: color.textPrimary,
  },
  version: {
    marginTop: space.lg2,
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: color.textMuted,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: color.textMuted,
  },
});
