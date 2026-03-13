import { TextProps, TextStyle, ViewProps, ViewStyle } from 'react-native';

export type BorderRadiusSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ThemedTextProps extends TextProps {
  style?: TextStyle | TextStyle[] | any;
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'label' | 'error';
  weight?: 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | number;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  fontFamily?: 'GoogleSans' | 'Kodchasan';
  colorType?: string;
  uppercase?: boolean;
  children: React.ReactNode;
}

export interface ThemedViewProps extends ViewProps {
  style?: ViewStyle | ViewStyle[] | any;
  themed?: boolean;
  scroll?: boolean;
  blur?: boolean;
  keyboardAvoiding?: boolean;
  safe?: boolean;
  edges?: any[];
  keyboardOffset?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  maxWidth?: boolean | number;
  children?: React.ReactNode;
  contentContainerStyle?: ViewStyle | ViewStyle[] | any;
}
