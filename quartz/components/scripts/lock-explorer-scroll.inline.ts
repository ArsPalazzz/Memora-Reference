const LOCK_CLASS = "mobile-no-scroll"
const BODY_LOCK_CLASS = "explorer-scroll-locked"

let lastTouchY = 0
let savedScrollY = 0
let locked = false

const isScrollable = (el: Element): boolean => {
  const { overflowY } = getComputedStyle(el)
  return overflowY === "auto" || overflowY === "scroll"
}

const canScrollInDirection = (start: EventTarget | null, deltaY: number): boolean => {
  if (!(start instanceof Element) || deltaY === 0) return false

  let node: Element | null = start
  while (node && node !== document.body) {
    if (isScrollable(node) && node.scrollHeight > node.clientHeight + 1) {
      const atTop = node.scrollTop <= 0
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      if (deltaY < 0 && !atTop) return true
      if (deltaY > 0 && !atBottom) return true
    }
    node = node.parentElement
  }
  return false
}

const lockBody = () => {
  if (locked) return
  locked = true
  savedScrollY = window.scrollY
  document.body.classList.add(BODY_LOCK_CLASS)
  document.body.style.position = "fixed"
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.left = "0"
  document.body.style.right = "0"
  document.body.style.width = "100%"
}

const unlockBody = () => {
  if (!locked) return
  locked = false
  document.body.classList.remove(BODY_LOCK_CLASS)
  document.body.style.position = ""
  document.body.style.top = ""
  document.body.style.left = ""
  document.body.style.right = ""
  document.body.style.width = ""
  window.scrollTo(0, savedScrollY)
}

const syncLock = () => {
  if (document.documentElement.classList.contains(LOCK_CLASS)) lockBody()
  else unlockBody()
}

document.addEventListener(
  "touchstart",
  (event) => {
    lastTouchY = event.touches[0]?.clientY ?? 0
  },
  { passive: true },
)

document.addEventListener(
  "touchmove",
  (event) => {
    if (!document.documentElement.classList.contains(LOCK_CLASS)) return
    const y = event.touches[0]?.clientY ?? lastTouchY
    const deltaY = lastTouchY - y
    lastTouchY = y
    if (!canScrollInDirection(event.target, deltaY)) event.preventDefault()
  },
  { passive: false },
)

document.addEventListener(
  "wheel",
  (event) => {
    if (!document.documentElement.classList.contains(LOCK_CLASS)) return
    if (!canScrollInDirection(event.target, event.deltaY)) event.preventDefault()
  },
  { passive: false },
)

const observer = new MutationObserver(syncLock)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
syncLock()

document.addEventListener("nav", () => {
  unlockBody()
  syncLock()
})
