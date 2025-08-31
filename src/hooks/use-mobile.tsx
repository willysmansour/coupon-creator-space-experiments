import { useState, useEffect } from 'react';

export interface MobileConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  breakpoint: number;
}

export const useMobile = (): MobileConfig => {
  const [config, setConfig] = useState<MobileConfig>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: 'lg',
    breakpoint: 1024,
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      
      let screenSize: MobileConfig['screenSize'] = 'lg';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;
      
      if (width < 640) {
        screenSize = 'xs';
        isMobile = true;
      } else if (width < 768) {
        screenSize = 'sm';
        isMobile = true;
      } else if (width < 1024) {
        screenSize = 'md';
        isTablet = true;
      } else if (width < 1280) {
        screenSize = 'lg';
        isDesktop = true;
      } else if (width < 1536) {
        screenSize = 'xl';
        isDesktop = true;
      } else {
        screenSize = '2xl';
        isDesktop = true;
      }

      setConfig({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        breakpoint: width,
      });
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    
    return () => window.removeEventListener('resize', updateConfig);
  }, []);

  return config;
};

// Utility functions for responsive design
export const getResponsiveClass = (
  mobile: string,
  tablet: string = mobile,
  desktop: string = tablet
) => {
  return `${mobile} md:${tablet} lg:${desktop}`;
};

export const getResponsiveSpacing = (
  mobile: number,
  tablet: number = mobile,
  desktop: number = tablet
) => {
  return {
    padding: `${mobile} md:${tablet} lg:${desktop}`,
    margin: `${mobile} md:${tablet} lg:${desktop}`,
    gap: `${mobile} md:${tablet} lg:${desktop}`,
  };
};

export const getResponsiveLayout = (
  mobile: 'stack' | 'grid' | 'flex',
  tablet: 'stack' | 'grid' | 'flex' = mobile,
  desktop: 'stack' | 'grid' | 'flex' = tablet
) => {
  const layouts = {
    stack: 'flex flex-col',
    grid: 'grid',
    flex: 'flex',
  };
  
  return `${layouts[mobile]} md:${layouts[tablet]} lg:${layouts[desktop]}`;
};
