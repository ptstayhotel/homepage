'use client';

/**
 * Tawk.to Live Chat Widget
 *
 * Integrates Tawk.to live chat widget using environment variables.
 * Only loads when properly configured (not using placeholder values).
 *
 * Configuration:
 * Set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID
 * in your .env.local file.
 *
 * Get these values from: https://dashboard.tawk.to
 * 1. Create an account or log in
 * 2. Go to Administration → Property Settings
 * 3. Find your Property ID and Widget ID in the JavaScript snippet
 */

import { useEffect } from 'react';
import { isTawkConfigured, getTawkConfig } from '@/config/brand';

// Extend Window interface for Tawk.to
declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      popup?: () => void;
      getWindowType?: () => string;
      getStatus?: () => string;
      isChatMaximized?: () => boolean;
      isChatMinimized?: () => boolean;
      isChatHidden?: () => boolean;
      isChatOngoing?: () => boolean;
      isVisitorEngaged?: () => boolean;
      endChat?: () => void;
      setAttributes?: (attributes: Record<string, string>, callback?: () => void) => void;
      addEvent?: (eventName: string, metadata?: Record<string, string>, callback?: () => void) => void;
      addTags?: (tags: string[], callback?: () => void) => void;
      removeTags?: (tags: string[], callback?: () => void) => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToWidget() {
  useEffect(() => {
    // Only load if properly configured
    if (!isTawkConfigured()) {
      return;
    }

    // Defer loading by 3 seconds to not block initial page load
    const timeout = setTimeout(() => {
      const { propertyId, widgetId } = getTawkConfig();

      // Initialize Tawk.to
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Create and load the script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

    // Add script to document
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Optional: Configure widget after load
    window.Tawk_API.onLoad = function () {
      // Widget loaded
    };
    }, 3000); // 3 second delay

    // Cleanup function
    return () => {
      clearTimeout(timeout);

      // Remove the script when component unmounts
      const tawkScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (tawkScript) tawkScript.remove();

      // Remove Tawk.to iframe
      const tawkIframe = document.querySelector('iframe[title*="Tawk"]');
      if (tawkIframe) tawkIframe.remove();

      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
    };
  }, []);

  // This component doesn't render anything visible
  // The Tawk.to widget creates its own floating button
  return null;
}

/**
 * Helper hook to interact with Tawk.to widget
 * Usage: const tawk = useTawkTo();
 *        tawk.maximize();
 */
export function useTawkTo() {
  const maximize = () => window.Tawk_API?.maximize?.();
  const minimize = () => window.Tawk_API?.minimize?.();
  const toggle = () => window.Tawk_API?.toggle?.();
  const hide = () => window.Tawk_API?.hideWidget?.();
  const show = () => window.Tawk_API?.showWidget?.();
  const endChat = () => window.Tawk_API?.endChat?.();

  const setVisitorAttributes = (attributes: Record<string, string>) => {
    window.Tawk_API?.setAttributes?.(attributes);
  };

  const addEvent = (name: string, data?: Record<string, string>) => {
    window.Tawk_API?.addEvent?.(name, data);
  };

  return {
    maximize,
    minimize,
    toggle,
    hide,
    show,
    endChat,
    setVisitorAttributes,
    addEvent,
    isLoaded: () => typeof window.Tawk_API !== 'undefined',
    isChatMaximized: () => window.Tawk_API?.isChatMaximized?.() ?? false,
    isChatOngoing: () => window.Tawk_API?.isChatOngoing?.() ?? false,
  };
}
