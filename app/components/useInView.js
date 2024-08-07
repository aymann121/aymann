import { useRef, useEffect } from 'react';

export default function useInView(callback) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(callback);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback]);

  return ref;
}
