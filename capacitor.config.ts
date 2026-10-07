import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hairmart.admin',
  appName: 'Hair Mart Admin',
  webDir: 'public',
  server: {
    url: 'https://hairmart.vercel.app/admin',
    androidScheme: 'https',
  },
};

export default config;