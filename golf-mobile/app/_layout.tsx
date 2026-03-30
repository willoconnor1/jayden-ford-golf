import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, InputAccessoryView, View, Text, Pressable, Keyboard, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { ToastProvider } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/theme/colors";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

// Set Inter as the default font for all Text components
const originalRender = (Text as any).render;
if (originalRender) {
  (Text as any).render = function (props: any, ref: any) {
    const fontMap: Record<string, string> = {
      "700": "Inter_700Bold",
      "bold": "Inter_700Bold",
      "600": "Inter_600SemiBold",
      "500": "Inter_500Medium",
    };
    const fw = props.style?.fontWeight ?? StyleSheet.flatten(props.style)?.fontWeight;
    const fontFamily = fontMap[String(fw)] ?? "Inter_400Regular";
    return originalRender.call(this, { ...props, style: [{ fontFamily }, props.style] }, ref);
  };
}

const golfTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (loaded && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthLoading]);

  if (!loaded || isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ToastProvider>
        <ThemeProvider value={golfTheme}>
          <Stack>
            {user ? (
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            )}
          </Stack>
        </ThemeProvider>
      </ToastProvider>
      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID="kb-dismiss">
          <View style={kbStyles.bar}>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => Keyboard.dismiss()} style={kbStyles.btn} hitSlop={8}>
              <Text style={kbStyles.btnText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </GestureHandlerRootView>
  );
}

const kbStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});
