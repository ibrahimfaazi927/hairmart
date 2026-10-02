import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hairmart.salon',
  appName: 'Hair Mart Studio',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
