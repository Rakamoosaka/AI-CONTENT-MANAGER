"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ToasterProvider() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <Toaster
      closeButton
      position={isMobile ? "bottom-center" : "top-right"}
      toastOptions={{
        duration: 3600,
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
          actionButton: "app-toast-action",
          cancelButton: "app-toast-cancel",
          closeButton: "app-toast-close",
          success: "app-toast-success",
          error: "app-toast-error",
          info: "app-toast-info",
          warning: "app-toast-warning",
          loading: "app-toast-loading",
        },
      }}
    />
  );
}
