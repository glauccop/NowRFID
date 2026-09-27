import {
  ArrowLeft,
  Bluetooth,
  BluetoothOff,
  Bug,
  Layers,
  type LucideIcon,
  PenLine,
  ScanLine,
  Settings as SettingsIcon,
  Wrench,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { installReaderDebugTap } from './src/reader/chainway';
import { BatchScreen } from './src/screens/BatchScreen';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { DebugScreen } from './src/screens/DebugScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { WriteScreen } from './src/screens/WriteScreen';
import { AppStateProvider, useApp } from './src/state/AppState';
import { NavContext, StackScreen } from './src/ui/nav';
import { color, font, fontSize, palette, space, touch } from './src/ui/theme';
import { ToastProvider } from './src/ui/toast';

installReaderDebugTap();

type Tab = 'scan' | 'write' | 'batch' | 'tools' | 'settings';

// Horizon: at most five destinations in the navigation bar.
const TABS: {
  key: Tab;
  label: string;
  title: string;
  icon: LucideIcon;
  Screen: React.ComponentType;
}[] = [
  {
    key: 'scan',
    label: 'Escanear',
    title: 'Escanear bens',
    icon: ScanLine,
    Screen: ScanScreen,
  },
  {
    key: 'write',
    label: 'Gravar',
    title: 'Gravar etiqueta',
    icon: PenLine,
    Screen: WriteScreen,
  },
  {
    key: 'batch',
    label: 'Lote',
    title: 'Lote atual',
    icon: Layers,
    Screen: BatchScreen,
  },
  {
    key: 'tools',
    label: 'Ferramentas',
    title: 'Ferramentas de tag',
    icon: Wrench,
    Screen: ToolsScreen,
  },
  {
    key: 'settings',
    label: 'Ajustes',
    title: 'Ajustes',
    icon: SettingsIcon,
    Screen: SettingsScreen,
  },
];

const STACK: Record<
  StackScreen,
  { title: string; Screen: React.ComponentType }
> = {
  connect: { title: 'Leitor RFID', Screen: ConnectScreen },
  debug: { title: 'Console de debug', Screen: DebugScreen },
};

function ReaderChip({ onPress }: { onPress: () => void }) {
  const { connection, readerInfo } = useApp();
  const connected = connection.status === 'connected';
  const label = connected
    ? readerInfo.battery !== undefined
      ? `R6 · ${readerInfo.battery}%`
      : 'R6 conectado'
    : connection.status === 'connecting'
    ? 'Conectando…'
    : 'Conectar leitor';
  const Icon = connected ? Bluetooth : BluetoothOff;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Leitor: ${label}`}
      style={({ pressed }) => [
        styles.chip,
        connected ? styles.chipOn : styles.chipOff,
        pressed && styles.pressed,
      ]}
    >
      <Icon
        size={16}
        color={connected ? palette.logoGreen : palette.neutral0}
      />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function Shell() {
  const { ready, settings, batch } = useApp();
  const [tab, setTab] = useState<Tab>('scan');
  const [stack, setStack] = useState<StackScreen[]>([]);

  const nav = useMemo(
    () => ({
      push: (screen: StackScreen) => setStack(s => [...s, screen]),
      pop: () => setStack(s => s.slice(0, -1)),
    }),
    [],
  );

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) {
        nav.pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, nav]);

  if (!ready) {
    return <ActivityIndicator style={styles.flex} color={color.primary} />;
  }

  const top = stack[stack.length - 1];
  const current = TABS.find(t => t.key === tab)!;
  const Active = top ? STACK[top].Screen : current.Screen;
  const title = top ? STACK[top].title : current.title;

  return (
    <NavContext.Provider value={nav}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          {top ? (
            <Pressable
              onPress={nav.pop}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={styles.back}
            >
              <ArrowLeft size={22} color={color.headerText} />
            </Pressable>
          ) : (
            <Image
              source={require('./src/assets/logo-mark.png')}
              style={styles.logo}
              accessibilityLabel="NowRFID"
            />
          )}
          <View style={styles.titles}>
            <Text style={styles.appName}>NowRFID</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {!top && settings.debugEnabled && (
            <Pressable
              onPress={() => nav.push('debug')}
              accessibilityRole="button"
              accessibilityLabel="Abrir console de debug"
              style={styles.back}
            >
              <Bug size={20} color={palette.neutral3} />
            </Pressable>
          )}
          {!top && <ReaderChip onPress={() => nav.push('connect')} />}
        </View>

        <View style={styles.flex}>
          <Active />
        </View>

        {!top && (
          <View style={styles.tabBar} accessibilityRole="tablist">
            {TABS.map(t => {
              const active = tab === t.key;
              const tint = active ? color.navSelected : color.textMuted;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t.label}
                  style={styles.tab}
                >
                  <View
                    style={[styles.tabIcon, active && styles.tabIconActive]}
                  >
                    <t.icon size={22} color={tint} />
                    {t.key === 'batch' && batch.items.length > 0 && (
                      <View style={styles.count}>
                        <Text style={styles.countText}>
                          {batch.items.length > 99 ? '99+' : batch.items.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.tabText, { color: tint }]}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </SafeAreaView>
    </NavContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppStateProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm2,
    paddingHorizontal: space.sm2,
    paddingVertical: space.sm,
    backgroundColor: color.header,
  },
  logo: { width: 36, height: 36 },
  back: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  appName: {
    fontFamily: font.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    color: palette.logoGreen,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: font.bold,
    fontSize: fontSize.md2,
    color: color.headerText,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 32,
    paddingHorizontal: space.sm2,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipOn: {
    borderColor: palette.logoGreen,
    backgroundColor: 'rgba(98,203,75,0.12)',
  },
  chipOff: {
    borderColor: palette.neutral7,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipText: {
    fontFamily: font.bold,
    fontSize: fontSize.sm,
    color: color.headerText,
  },
  pressed: { opacity: 0.7 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingTop: space.xs,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    paddingHorizontal: space.md1,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tabIconActive: { backgroundColor: palette.primary0 },
  tabText: { fontFamily: font.bold, fontSize: fontSize.xs + 1 },
  count: {
    position: 'absolute',
    top: -2,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: palette.critical2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.bold, fontSize: 10, color: '#FFFFFF' },
});
