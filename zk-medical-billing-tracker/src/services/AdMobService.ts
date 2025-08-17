import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdMobBannerSize } from '@capacitor-community/admob';
import { isPlatform } from '@ionic/react';

class AdMobService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (isPlatform('capacitor')) {
        await AdMob.initialize({
          testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Add your test device ID
        });
        this.isInitialized = true;
        console.log('AdMob initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  async showBannerAd(position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER) {
    if (!this.isInitialized || !isPlatform('capacitor')) {
      console.log('AdMob not initialized or not on mobile platform');
      return;
    }

    const options: BannerAdOptions = {
      adId: 'ca-app-pub-3940256099942544/6300978111', // Test ad unit ID - replace with your actual ad unit ID
      adSize: BannerAdSize.BANNER,
      position: position,
      margin: 0,
      isTesting: true, // Set to false in production
    };

    try {
      await AdMob.showBanner(options);
      console.log('Banner ad shown successfully');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  }

  async hideBannerAd() {
    if (!this.isInitialized || !isPlatform('capacitor')) {
      return;
    }

    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden successfully');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  async resumeBannerAd() {
    if (!this.isInitialized || !isPlatform('capacitor')) {
      return;
    }

    try {
      await AdMob.resumeBanner();
      console.log('Banner ad resumed successfully');
    } catch (error) {
      console.error('Failed to resume banner ad:', error);
    }
  }
}

export const adMobService = new AdMobService();