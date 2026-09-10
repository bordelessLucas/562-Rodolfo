import { router, type Href } from 'expo-router';

/** Volta na stack se possível; senão cai no destino informado. */
export function goBackOrReplace(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}
