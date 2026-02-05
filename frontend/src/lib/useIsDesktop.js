import { useEffect, useState } from "react";

export default function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (event) => setDesktop(event.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else {
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  return desktop;
}
