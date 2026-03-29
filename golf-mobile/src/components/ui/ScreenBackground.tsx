import { ImageBackground, View, StyleSheet } from "react-native";

interface ScreenBackgroundProps {
  image: string;
}

export function ScreenBackground({ image }: ScreenBackgroundProps) {
  return (
    <ImageBackground
      source={{ uri: image }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
});
