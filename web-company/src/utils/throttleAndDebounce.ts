// 节流函数
type Fn = (...args: any[]) => any;

export function throttle<T extends Fn>(fn: T, delay: number): T {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    if (now - last < delay) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, delay - (now - last));
    } else {
      last = now;
      fn.apply(this, args);
    }
  } as T;
}

// 防抖函数
export function debounce<T extends Fn>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  } as T;
} 