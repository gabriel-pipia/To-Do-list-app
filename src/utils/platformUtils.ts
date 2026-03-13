import { Dimensions, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = !isWeb;

export function getMaxWidth(): number {
  if (isWeb) {
    const { width } = Dimensions.get('window');
    return Math.min(width, 480); // Cap at mobile width on web
  }
  return Dimensions.get('window').width;
}
