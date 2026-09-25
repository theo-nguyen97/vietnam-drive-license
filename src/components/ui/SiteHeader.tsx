import { Logo } from "./Logo";
import { PlayerChip } from "./PlayerChip";
import { FontSizeToggle } from "./FontSizeToggle";
import { MobileTabBar } from "./MobileTabBar";
import { DesktopNav } from "./DesktopNav";

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-asphalt-950/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Logo />
            <DesktopNav />
          </div>
          <div className="flex items-center gap-2">
            <FontSizeToggle />
            <PlayerChip />
          </div>
        </div>
      </header>
      {/* Đặt ngoài <header>: backdrop-blur của header sẽ làm vị trí fixed bị tính theo header */}
      <MobileTabBar />
    </>
  );
}
