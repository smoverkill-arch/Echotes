import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  type AccentColor,
  type TimelineDensity,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import { fontFamily } from "../../theme/fonts";
import { radius, spacing, touchTarget, typography } from "../../theme/tokens";

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const accentOptions: { key: AccentColor; label: string; swatch: string }[] = [
  { key: "green", label: "Verde", swatch: "#1dc98a" },
  { key: "slate", label: "Slate", swatch: "#3a6fdd" },
  { key: "amber", label: "Ambar", swatch: "#d9a432" },
];

const densityOptions: { key: TimelineDensity; label: string }[] = [
  { key: "compact", label: "Compacto" },
  { key: "normal", label: "Normal" },
  { key: "airy", label: "Espacoso" },
];

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const palette = useAppearancePalette();
  const mode = useAppearanceStore((state) => state.mode);
  const accent = useAppearanceStore((state) => state.accent);
  const density = useAppearanceStore((state) => state.density);
  const setMode = useAppearanceStore((state) => state.setMode);
  const setAccent = useAppearanceStore((state) => state.setAccent);
  const setDensity = useAppearanceStore((state) => state.setDensity);

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(10,15,12,0.6)" }]}>
        <View style={[styles.sheet, { backgroundColor: palette.surface }]}>
          <View style={[styles.handle, { backgroundColor: palette.borderStrong }]} />
          <Text style={[styles.eyebrow, { color: palette.primary }]}>Definicoes</Text>

          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: palette.text }]}>Modo escuro</Text>
              <Pressable
                accessibilityLabel="Alternar modo escuro"
                accessibilityRole="switch"
                accessibilityState={{ checked: mode === "dark" }}
                style={[
                  styles.switchTrack,
                  {
                    backgroundColor: mode === "dark" ? palette.primary : palette.border,
                  },
                ]}
                testID="settings-dark-mode-toggle"
                onPress={() => setMode(mode === "dark" ? "light" : "dark")}
              >
                <View
                  style={[
                    styles.switchThumb,
                    {
                      left: mode === "dark" ? 22 : 3,
                      backgroundColor: palette.white,
                    },
                  ]}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSubtle }]}>
              Cor de destaque
            </Text>
            <View style={styles.swatches}>
              {accentOptions.map((option) => {
                const isSelected = option.key === accent;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityLabel={`Usar destaque ${option.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={styles.swatchButton}
                    testID={`settings-accent-${option.key}`}
                    onPress={() => setAccent(option.key)}
                  >
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: option.swatch,
                          borderColor: isSelected ? palette.text : "transparent",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.swatchLabel,
                        { color: isSelected ? palette.text : palette.textMuted },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: palette.textSubtle }]}>
              Densidade
            </Text>
            <View style={[styles.segmented, { backgroundColor: palette.surfaceMuted }]}>
              {densityOptions.map((option) => {
                const isSelected = option.key === density;
                return (
                  <Pressable
                    key={option.key}
                    accessibilityLabel={`Usar densidade ${option.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.segment,
                      isSelected ? { backgroundColor: palette.surface } : null,
                    ]}
                    testID={`settings-density-${option.key}`}
                    onPress={() => setDensity(option.key)}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        { color: isSelected ? palette.text : palette.textMuted },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            accessibilityLabel="Fechar definicoes"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.closeButton,
              {
                borderColor: palette.border,
                backgroundColor: pressed ? palette.surfacePressed : palette.surface,
              },
            ]}
            testID="settings-close-button"
            onPress={onClose}
          >
            <Text style={[styles.closeLabel, { color: palette.text }]}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: radius.pill,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  section: {
    gap: spacing.md,
  },
  switchRow: {
    minHeight: touchTarget.min,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodySemiBold,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: radius.pill,
    position: "relative",
  },
  switchThumb: {
    position: "absolute",
    top: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  sectionLabel: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  swatches: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  swatchButton: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  swatchLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: radius.sm,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  closeButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
});
