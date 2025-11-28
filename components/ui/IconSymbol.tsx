// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'bolt.fill': 'flash-on',
  'timer': 'timer',
  'target': 'gps-fixed',
  'checkmark.shield.fill': 'verified-user',
  'gearshape.fill': 'settings',
  'gearshape.2.fill': 'settings',
  'shield.fill': 'shield',
  'lightbulb.fill': 'lightbulb',
  'cpu': 'memory',
  'slider.horizontal.3': 'tune',
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'list.number': 'format-list-numbered',
  'list.bullet': 'menu',
  'star.fill': 'star',
  'chart.bar.fill': 'bar-chart',
  'doc.text.fill': 'description',
  'person.fill': 'person',
  'globe': 'language',
  'checklist': 'playlist-add-check',
  'arrow.up.right': 'open-in-new',
  'exclamationmark.triangle.fill': 'warning',
  'person.2.fill': 'people',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'wrench.fill': 'build',
  'arrow.triangle.2.circlepath': 'sync',
  'sparkles': 'auto-awesome',
  'link': 'link',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
