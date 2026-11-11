import { Platform, NativeModules } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { IRtcEngine, RtcSurfaceView as RtcSurfaceViewType } from 'react-native-agora';

export type { IRtcEngine, RtcSurfaceViewType };

export enum ChannelProfileType {
  ChannelProfileCommunication = 0,
  ChannelProfileLiveBroadcasting = 1,
}

export enum ClientRoleType {
  ClientRoleBroadcaster = 1,
  ClientRoleAudience = 2,
}

let agoraModule: any = null;
let attempted = false;

/**
 * Checks if the app is currently running in Expo Go.
 */
function isRunningInExpoGo(): boolean {
  try {
    return (
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      Boolean(Constants.expoVersion)
    );
  } catch {
    return false;
  }
}

/**
 * Checks if the Agora native binary is actually compiled into the current build.
 */
function isAgoraNativeLinked(): boolean {
  if (Platform.OS === 'web') return false;
  if (isRunningInExpoGo()) return false;

  try {
    const hasTurbo =
      typeof (globalThis as any)?.__turboModuleProxy === 'function' &&
      Boolean((globalThis as any).__turboModuleProxy('AgoraRtcNg'));

    const hasNative = Boolean((NativeModules as any)?.AgoraRtcNg);

    return hasTurbo || hasNative;
  } catch {
    return false;
  }
}

/**
 * Safely load react-native-agora if available (native development build).
 * In Expo Go, Web, or unlinked environments, this returns null without calling
 * require('react-native-agora'), completely preventing the linking error popup.
 */
export function getAgora(): any {
  if (attempted) {
    return agoraModule;
  }
  attempted = true;

  // Never attempt to load native package in Expo Go, web, or when native module is missing
  if (!isAgoraNativeLinked()) {
    agoraModule = null;
    return null;
  }

  try {
    const module = require('react-native-agora');
    if (
      module &&
      (typeof module.default === 'function' ||
        typeof module.createAgoraRtcEngine === 'function')
    ) {
      agoraModule = module;
      return agoraModule;
    }
  } catch (err: any) {
    console.warn('[Agora] Failed to load Agora module:', err?.message);
    agoraModule = null;
  }

  return agoraModule;
}

export function isAgoraSupported(): boolean {
  return isAgoraNativeLinked() && Boolean(getAgora());
}

export function createSafeAgoraEngine(): IRtcEngine | null {
  if (!isAgoraSupported()) return null;
  const agora = getAgora();
  if (!agora) return null;

  try {
    const creator = agora.default || agora.createAgoraRtcEngine;
    if (typeof creator === 'function') {
      return creator();
    }
  } catch (err) {
    console.warn('[Agora] Failed to create Agora RTC engine:', err);
  }
  return null;
}
