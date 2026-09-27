import { Barcode, PenLine, QrCode, Radio, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../state/AppState';
import type { ScanItem } from '../types';
import { Badge, IconButton } from '../ui/components';
import { color, font, fontSize, palette, space, tone } from '../ui/theme';

const KIND = {
  rfid: { icon: Radio, tone: tone.primary, label: 'RFID' },
  barcode: { icon: Barcode, tone: tone.warning, label: 'Código de barras' },
  qr: { icon: QrCode, tone: tone.positive, label: 'QR Code' },
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
  const kind = KIND[item.captureType];
  const Icon = item.operation === 'write' ? PenLine : kind.icon;

  return (
    <View
      style={s.row}
      accessible
      accessibilityLabel={`${kind.label} ${main}${
        item.operation === 'write' ? ', gravada' : ''
      }`}
    >
      <View style={[s.leading, { backgroundColor: kind.tone.bg }]}>
        <Icon size={20} color={kind.tone.fg} />
      </View>
      <View style={s.body}>
        <Text style={s.main} numberOfLines={2}>
          {main}
        </Text>
        <Text style={s.sub}>{sub}</Text>
        {!!where && <Text style={s.sub}>{where}</Text>}
      </View>
      {item.operation === 'write' && <Badge text="GRAVADA" tone="critical" />}
      {onRemove && (
        <IconButton
          icon={Trash2}
          label="Remover item"
          tint={palette.critical3}
          onPress={onRemove}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm2,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.divider,
  },
  leading: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  main: {
    fontFamily: font.mono,
    fontSize: fontSize.md,
    color: color.textPrimary,
  },
  sub: {
    fontFamily: font.regular,
    fontSize: fontSize.sm,
    color: color.textTertiary,
  },
});
