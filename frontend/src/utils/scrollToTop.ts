/** Reset all scroll positions — used when navigating (e.g. Start Chatting).
 * Landing page scrolls inside .main-content, not the window. */

function scrollEl(el: HTMLElement): void {
  el.scrollTop = 0
  el.scrollLeft = 0
  if (typeof el.scrollTo === 'function') el.scrollTo(0, 0)
}

export function scrollToTop(): void {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  const selectors = ['.main-content', '.layout', '.chat-page', '.chat-sidebar', '.messages-container']
  selectors.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (el instanceof HTMLElement) scrollEl(el)
      })
    } catch (_) {}
  })
}
