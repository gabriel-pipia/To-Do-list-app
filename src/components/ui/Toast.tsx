import React, { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    Layout,
    runOnJS,
    SlideInUp,
    SlideOutUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { ToastConfig } from '../../types/ui';
import { ThemedText } from './Text';

interface ToastProps {
    config: ToastConfig;
    onDismiss: (id: string) => void;
}

export function Toast({ config, onDismiss }: ToastProps) {
    const { colors, spacing } = useTheme();
    const BRUTAL_STYLES = {
        borderWidth: 3,
        borderColor: colors.textPrimary,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    };
    
    // Auto dismiss
    useEffect(() => {
        if (config.duration === 0) return; // 0 = infinite
        const timer = setTimeout(() => {
            onDismiss(config.id);
        }, config.duration || 4000);
        return () => clearTimeout(timer);
    }, [config.id, config.duration, onDismiss]);

    // Icons
    const getIcon = () => {
        switch (config.type) {
            case 'success': return <CheckCircle size={24} color={colors.success} />;
            case 'error': return <AlertCircle size={24} color={colors.error} />;
            case 'warning': return <AlertTriangle size={24} color={colors.accent} />;
            case 'info': return <Info size={24} color={colors.primary} />;
        }
    };

    const getBorderColor = () => {
        switch (config.type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.accent;
            case 'info': return colors.primary;
        }
    };

    // Gestures
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const pan = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            // Allow swiping up to dismiss
            if (event.translationY < 0) {
                translateY.value = event.translationY;
            } else {
                // Resistance when pulling down
                translateY.value = event.translationY * 0.2;
            }
        })
        .onEnd((event) => {
            if (event.translationY < -20) {
                runOnJS(onDismiss)(config.id);
            } else {
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View 
                entering={SlideInUp.duration(500).easing(Easing.out(Easing.cubic))} 
                exiting={SlideOutUp.duration(400).easing(Easing.in(Easing.cubic))}
                layout={Layout.duration(500).easing(Easing.out(Easing.cubic))}
                style={[
                    styles.container, 
                    { 
                        backgroundColor: colors.surface,
                        borderColor: colors.textPrimary,
                        borderRadius: 0,
                    },
                    BRUTAL_STYLES,
                    animatedStyle
                ]}
            >
                {Platform.OS === 'ios' ? (
                    <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, opacity: 0.95 }]} />
                )}
                
                <Pressable 
                    onPress={() => {
                        if (config.onPress) {
                            config.onPress();
                            onDismiss(config.id);
                        }
                    }}
                    style={[styles.contentContainer, { padding: spacing.md, gap: spacing.md }]}
                >
                    <View style={styles.iconContainer}>
                        {getIcon()}
                    </View>
                    
                    <View style={styles.textContainer}>
                        <ThemedText weight="bold" size="md" style={styles.title}>{config.title}</ThemedText>
                        {config.message && (
                            <ThemedText colorType="textSecondary" style={styles.message}>{config.message}</ThemedText>
                        )}
                    </View>

                    {config.action && (
                         <ThemedText 
                            weight="bold"
                            colorType="primary"
                            onPress={(e: any) => {
                                e.stopPropagation();
                                config.action?.onPress();
                            }}
                            style={[styles.action, { marginLeft: spacing.sm }]}
                         >
                            {config.action.label}
                         </ThemedText>
                    )}
                </Pressable>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: '90%',
        maxWidth: 400,
        overflow: 'hidden',
        borderWidth: 3,
        zIndex: 9999,
        minHeight: 60,
        marginBottom: 8,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        opacity: 0.9,
    },
    action: {
        fontSize: 14,
    }
});
