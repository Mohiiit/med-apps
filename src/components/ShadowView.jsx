import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Renders `children` inside a Shadow DOM root so each launched app is fully
// style-isolated: its <style> block and global-looking selectors can never
// leak into the store chrome, and vice-versa. Two apps with conflicting
// themes coexist with zero collisions.
//
// We use createPortal into the shadow root, which keeps the app in the same
// React tree (state/context/events all work normally).
export default function ShadowView({ children, className }) {
  const hostRef = useRef(null);
  const [root, setRoot] = useState(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    // Make the shadow host fill its container so apps that styled `body`
    // (remapped to :host) render edge-to-edge as intended.
    setRoot(shadow);
  }, []);

  return (
    <div ref={hostRef} className={className}>
      {root && createPortal(children, root)}
    </div>
  );
}
