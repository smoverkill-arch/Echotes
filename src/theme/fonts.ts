import {
  Bitter_400Regular,
  Bitter_700Bold,
} from "@expo-google-fonts/bitter";
import {
  Cabin_400Regular,
  Cabin_600SemiBold,
  Cabin_700Bold,
} from "@expo-google-fonts/cabin";

export const appFonts = {
  Bitter_400Regular,
  Bitter_700Bold,
  Cabin_400Regular,
  Cabin_600SemiBold,
  Cabin_700Bold,
} as const;

export const fontFamily = {
  display: "Bitter_700Bold",
  displayRegular: "Bitter_400Regular",
  body: "Cabin_400Regular",
  bodySemiBold: "Cabin_600SemiBold",
  bodyBold: "Cabin_700Bold",
} as const;
