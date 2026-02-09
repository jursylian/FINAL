import React, { useEffect } from "react";

import useIsDesktop from "../lib/useIsDesktop.js";

export function ModalStackRoot({ open, onClose, allowMobile = false, children }) {
  const isDesktop = useIsDesktop();
  const canShow = Boolean(open) && (isDesktop || allowMobile);

  useEffect(() => {
    if (!canShow) return;
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canShow, onClose]);

  useEffect(() => {
    if (!canShow) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [canShow]);

  if (!canShow) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

export function ModalWindow({
  preset = "post",
  zClass = "z-[91]",
  className = "",
  fullScreen = false,
  children,
}) {
  if (fullScreen) {
    return (
      <div className={["absolute inset-0", zClass].join(" ")}>
        <div
          onClick={(event) => event.stopPropagation()}
          className={[
            "h-full w-full overflow-hidden bg-white",
            "rounded-none max-w-none max-h-none",
            className,
          ].join(" ")}
        >
          {children}
        </div>
      </div>
    );
  }

  const sizeStyle =
    preset === "create"
      ? {
          width: "min(900px, calc(100% - 32px))",
          height: "min(600px, calc(100% - 64px))",
        }
      : {
          width: "min(1002px, 90vw)",
          height: "min(722px, 90vh)",
        };

  return (
    <div
      className={[
        "absolute inset-x-0 top-0 flex justify-center px-4 pt-6",
        zClass,
      ].join(" ")}
    >
      <div
        style={sizeStyle}
        onClick={(event) => event.stopPropagation()}
        className={[
          "w-full max-w-[92vw] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default function ModalShell({
  open,
  onClose,
  preset = "post",
  scope = "global",
  children,
}) {
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!open || !isDesktop) return;
    function handleKey(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, isDesktop, onClose]);

  useEffect(() => {
    if (!open || !isDesktop || scope === "local") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, isDesktop, scope]);

  if (!open || !isDesktop) {
    return null;
  }

  const sizeStyle =
    preset === "create"
      ? {
          width: "min(900px, calc(100vw - 32px))",
          height: "min(600px, calc(100vh - 32px))",
        }
      : {
          width: "min(1112px, calc(100vw - 32px))",
          height: "min(722px, calc(100vh - 32px))",
        };

  if (preset === "menu") {
    const containerClass =
      scope === "local"
        ? "absolute inset-0 z-[80] flex items-center justify-center"
        : "fixed inset-0 z-[80] flex items-center justify-center";
    return (
      <div className={containerClass} onClick={onClose}>
        <div className="absolute inset-0 bg-black/40" />
        <div
          onClick={(event) => event.stopPropagation()}
          className="relative z-[81] w-[360px] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {children}
        </div>
      </div>
    );
  }

  const wrapperClass =
    scope === "local"
      ? "absolute inset-0 z-[70]"
      : "fixed inset-0 z-[100]";

  return (
    <div className={wrapperClass} onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-[101] flex h-full w-full items-start justify-center px-4 pt-6">
        <div
          style={sizeStyle}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-[92vw] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
