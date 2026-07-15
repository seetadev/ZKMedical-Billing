export interface ThemeColors {
  primaryColor: string;
  primaryColorRgb: string;
  primaryColorShade: string;
  primaryColorTint: string;
  primaryContrast: string;
  primaryContrastRgb: string;
  secondaryColor: string;
  secondaryColorRgb: string;
  secondaryContrast: string;
  secondaryContrastRgb: string;
  secondaryShade: string;
  secondaryTint: string;
  backgroundColor: string;
}

export const applyTheme = (colors: ThemeColors) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.style.setProperty('--ion-color-primary', colors.primaryColor);
  root.style.setProperty('--ion-color-primary-rgb', colors.primaryColorRgb);
  root.style.setProperty('--ion-color-primary-shade', colors.primaryColorShade);
  root.style.setProperty('--ion-color-primary-tint', colors.primaryColorTint);
  root.style.setProperty('--ion-color-primary-contrast', colors.primaryContrast);
  root.style.setProperty('--ion-color-primary-contrast-rgb', colors.primaryContrastRgb);

  root.style.setProperty('--ion-color-secondary', colors.secondaryColor);
  root.style.setProperty('--ion-color-secondary-rgb', colors.secondaryColorRgb);
  root.style.setProperty('--ion-color-secondary-shade', colors.secondaryShade);
  root.style.setProperty('--ion-color-secondary-tint', colors.secondaryTint);
  root.style.setProperty('--ion-color-secondary-contrast', colors.secondaryContrast);
  root.style.setProperty('--ion-color-secondary-contrast-rgb', colors.secondaryContrastRgb);

  root.style.setProperty('--ion-background-color', colors.backgroundColor);
};
