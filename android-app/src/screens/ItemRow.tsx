import React from 'react';
import { useApp } from '../state/AppState';
import { Pressable, Text, View } from 'react-native';
import type { ScanItem } from '../types';
import { Badge, colors, styles } from '../ui/components';

const TYPE_COLOR = {
  rfid: colors.primary,
  barcode: colors.warning,
  qr: colors.success,
};

export function ItemRow({
  item,
  onRemove,
}: {
  item: ScanItem;
  onRemove?: () => void;
}) {
  const { assetTypes, structure } = useApp();
  const type = assetTypes.find(t => t.sys_id === item.assetType);
  const room = structure?.locations.find(l => l.sys_id === item.location);
  const where = [
    type ? `${type.icon} ${type.name}` : item.location ? '❔ sem tipo' : '',
    room?.name,
  ]
    .filter(Boolean)
    .join(' · ');
  const main = item.captureType === 'rfid' ? item.epc : item.barcodeValue;
  const sub =
    item.captureType === 'rfid'
      ? [
          item.tid && `TID ${item.tid}`,
          item.rssi && `RSSI ${item.rssi}`,
          `x${item.readCount}`,
        ]
          .filter(Boolean)
          .join(' · ')
      : [item.symbology, `x${item.readCount}`].filter(Boolean).join(' · ');
  return (
    <View
      style={[
        styles.row,
        { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6 },
      ]}
    >
      <View style={styles.flex1}>
        <Text style={styles.mono} numberOfLines={2}>
          {main}
        </Text>
        <Text style={styles.muted}>{sub}</Text>
        {!!where && <Text style={styles.muted}>{where}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Badge
          text={item.captureType.toUpperCase()}
          color={TYPE_COLOR[item.captureType]}
        />
        {item.operation === 'write' && (
          <Badge text="GRAVADA" color={colors.danger} />
        )}
        {onRemove && (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Text style={{ color: colors.danger, fontWeight: '700' }}>
              remover
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
