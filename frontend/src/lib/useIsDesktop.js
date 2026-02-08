import { useEffect, useState } from "react";

export default function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    if (typeof window.matchMedia !== "function") {
      return window.innerWidth >= 768;
    }
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (typeof window.matchMedia !== "function") {
      const handler = () => setDesktop(window.innerWidth >= 768);
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }

    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (event) => setDesktop(event.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return desktop;
}
