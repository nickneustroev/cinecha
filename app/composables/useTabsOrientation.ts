export function useTabsOrientation() {
  const isMobile = useIsMobile()

  return computed(() => isMobile.value ? 'vertical' : 'horizontal')
}
