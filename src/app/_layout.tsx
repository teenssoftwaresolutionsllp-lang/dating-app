import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		DM_Sans_400Regular: DMSans_400Regular,
		DM_Sans_500Medium: DMSans_500Medium,
		DM_Sans_700Bold: DMSans_700Bold,
		DM_Serif_Display_400Regular: DMSerifDisplay_400Regular,
	});

	if (!fontsLoaded) return null;

	return (
		<>
			<Stack screenOptions={{ headerShown: false }} />
			<AnimatedSplashOverlay />
		</>
	);
}
