import type { ReactNode, RefObject } from "react";
import { AmbientMesh } from "../liquid-glass/ambient-mesh";

type WorkspaceFrameProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  mobileNavigation: ReactNode;
  overlays?: ReactNode;
  children: ReactNode;
  scrollRootRef: RefObject<HTMLDivElement | null>;
};

export function WorkspaceFrame({
  sidebar,
  topbar,
  mobileNavigation,
  overlays,
  children,
  scrollRootRef
}: WorkspaceFrameProps) {
  return (
    <main className="n-liquid-canvas relative isolate h-[100dvh] overflow-hidden text-app-text">
      <AmbientMesh className="-z-10" />

      <div className="relative z-10 flex h-full min-h-0 gap-2 p-2 sm:gap-3 sm:p-3 lg:gap-4 lg:p-4">
        {sidebar}

        <section className="n-liquid-panel n-radius-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border">
          <div className="relative z-30 shrink-0 p-2 pb-0 sm:p-3 sm:pb-0">
            {topbar}
          </div>

          <div
            ref={scrollRootRef}
            data-app-scroll-root
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          >
            <div className="app-enter relative px-3 pb-24 pt-3 sm:px-4 sm:pt-4 lg:px-5 lg:pb-6">
              {children}
            </div>
          </div>

          {mobileNavigation}
          {overlays}
        </section>
      </div>
    </main>
  );
}
