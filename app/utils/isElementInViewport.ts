export const isElementInViewport = (el: HTMLElement, percentage = 50) => {
  const { innerHeight, innerWidth } = window; // eslint-disable-line
  const { clientHeight, clientWidth } = document.documentElement; // eslint-disable-line

  const rect = el.getBoundingClientRect();

  const offScreenTop = 0 - (rect.height * percentage) / 100;

  return (
    rect.top >= offScreenTop &&
    rect.left >= 0 &&
    rect.bottom <= (innerHeight || clientHeight) &&
    rect.right <= (innerWidth || clientWidth)
  );
};
