import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { BRUTAL_STYLES } from '../lib/constants';
import { Button } from './ui';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, layout, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 24;

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      width: '90%' as any,
      maxWidth: layout.containerMaxWidth,
      borderRadius: 0, // Blocky tab bar
      ...BRUTAL_STYLES(colors),
    },
  ];

  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === 'day') return null;

  return (
    <View style={[styles.tabWrapper, { bottom: bottomOffset }]}>
      <View style={containerStyle}>
        {state.routes
          .filter(route => route.name !== 'day' && (descriptors[route.key].options as any).href !== null)
          .map((route) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === state.routes.indexOf(route);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem
                key={route.key}
                route={route}
                isFocused={isFocused}
                onPress={onPress}
                icon={options.tabBarIcon}
                colors={colors}
              />
            );
          })}
      </View>
    </View>
  );
}

function TabItem({
  route,
  isFocused,
  onPress,
  icon,
  colors,
}: {
  isFocused: boolean;
  route: any;
  onPress: () => void;
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  colors: any;
}) {
  const isAdd = route.name === 'add';

  if (isAdd) {
    return (
      <View style={styles.tabItem}>
        <Animated.View style={[styles.iconContainer]}>
          <Button
            type="icon"
            variant="primary"
            size="none"
            onPress={onPress}
            icon={icon?.({
              focused: true,
              color: colors.textPrimary,
              size: 26,
            })}
            style={{ width: 48, height: 48 }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.tabItem}>
      <Animated.View style={[styles.iconContainer]}>
        <Button
          type="icon"
          variant={isFocused ? 'primary' : 'ghost'}
          size="none"
          onPress={onPress}
          icon={icon?.({
            focused: isFocused,
            color: isFocused ? colors.textPrimary : colors.textTertiary,
            size: 26,
          })}
          style={{ width: 48, height: 48, borderRadius: 0 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    height: 72,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 48,
    height: 48,
    borderRadius: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonOuter: {
    width: 56,
    height: 56,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
