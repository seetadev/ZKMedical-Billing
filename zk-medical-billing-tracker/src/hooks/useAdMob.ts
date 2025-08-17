import { useEffect } from 'react';
import { useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import { adMobService } from '../services/AdMobService';
import { BannerAdPosition } from '@capacitor-community/admob';

interface UseAdMobOptions {
  showOnEnter?: boolean;
  position?: BannerAdPosition;
  hideOnLeave?: boolean;
}

export const useAdMob = (options: UseAdMobOptions = {}) => {
  const { 
    showOnEnter = true, 
    position = BannerAdPosition.BOTTOM_CENTER,
    hideOnLeave = true 
  } = options;

  useIonViewDidEnter(() => {
    if (showOnEnter) {
      adMobService.showBannerAd(position);
    }
  });

  useIonViewWillLeave(() => {
    if (hideOnLeave) {
      adMobService.hideBannerAd();
    }
  });

  return {
    showAd: () => adMobService.showBannerAd(position),
    hideAd: () => adMobService.hideBannerAd(),
    resumeAd: () => adMobService.resumeBannerAd()
  };
};