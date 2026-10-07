"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useResizeVersion } from "@/hooks/use-resize-version";
import { useSmoothScroll } from "@/lib/smooth-scroll-context";
import { cn } from "@/lib/utils";

export type CurtainSectionProps = {
  children: ReactNode;
  edgeColor: string;
  surfaceClassName?: string;
  className?: string;
  pin?: boolean;
};

type CurtainStackProps = {
  children: ReactNode;
  baseZIndex?: number;
};

/** 0 = next section fully below viewport; 1 = next section start at viewport top */
function useNextSectionCover(
  nextSectionRef: RefObject<HTMLDivElement | null> | null,
  enabled: boolean,
  resetKey: string | number,
) {
  const { lenis } = useSmoothScroll();
  const [cover, setCover] = useState(0);

  useEffect(() => {
    if (!enabled || !nextSectionRef) {
      return;
    }

    let rafId = 0;

    const measure = () => {
      const next = nextSectionRef.current;
      if (!next) {
        setCover(0);
        return;
      }

      const top = next.getBoundingClientRect().top;
      const vh = window.innerHeight;

      if (top >= vh - 0.5) {
        setCover(0);
        return;
      }

      const progress = 1 - top / vh;
      setCover(Math.max(0, Math.min(1, progress)));
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    lenis?.on("scroll", schedule);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      lenis?.off("scroll", schedule);
    };
  }, [enabled, nextSectionRef, resetKey, lenis]);

  if (!enabled || !nextSectionRef) {
    return 0;
  }

  return cover;
}

function CurtainSectionInner({
  index,
  totalCount,
  zIndex,
  edgeColor,
  surfaceClassName,
  children,
  className,
  pin = true,
  sectionRef,
  nextSectionRef,
}: CurtainSectionProps & {
  index: number;
  totalCount: number;
  zIndex: number;
  sectionRef: RefObject<HTMLDivElement | null>;
  nextSectionRef: RefObject<HTMLDivElement | null> | null;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mdUp = useMediaQuery("(min-width: 768px)");
  const resizeVersion = useResizeVersion();
  const innerRef = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(false);
  const layoutKey = `${pathname}:${resizeVersion}`;

  const isLast = index >= totalCount - 1;
  const hasNext = !isLast && nextSectionRef != null;

  useEffect(() => {
    const node = innerRef.current;
    if (!node) {
      return;
    }
    const measure = () => {
      setTall(node.scrollHeight > window.innerHeight * 1.05);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [layoutKey]);

  const pinActive = pin && !tall && mdUp && !reduceMotion && hasNext;
  const cover = useNextSectionCover(nextSectionRef, pinActive, layoutKey);

  const dimActive = cover > 0.12;
  const overlayOpacity = dimActive
    ? Math.min(0.45, ((cover - 0.12) / 0.88) * 0.45)
    : 0;
  const contentShiftVh = pinActive ? -4 * Math.min(1, cover) : 0;

  return (
    <div
      ref={sectionRef}
      className={cn("relative", surfaceClassName, className)}
      style={{ zIndex }}
    >
      <SteppedEdge
        position="top"
        color={edgeColor}
        scrollTargetRef={sectionRef}
        static={Boolean(reduceMotion)}
      />
      <div
        className={cn(
          pinActive && "sticky top-0 min-h-svh overflow-hidden",
        )}
      >
        <div ref={innerRef} className="relative">
          {pinActive && overlayOpacity > 0 ? (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-navy"
              style={{ opacity: overlayOpacity }}
              aria-hidden
            />
          ) : null}
          <motion.div
            className="relative z-10"
            style={
              pinActive
                ? {
                    y: `${contentShiftVh}vh`,
                    willChange: "transform",
                  }
                : undefined
            }
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** Marker only — rendered by `CurtainStack` (must be a direct child). */
export function CurtainSection(_props: CurtainSectionProps) {
  void _props;
  return null;
}

export function CurtainStack({ children, baseZIndex = 10 }: CurtainStackProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<
    CurtainSectionProps
  >[];

  const sectionRefs = useMemo(
    () =>
      items.map(() => ({ current: null as HTMLDivElement | null })),
    [items.length],
  );

  return (
    <>
      {items.map((child, index) => (
        <CurtainSectionInner
          key={index}
          index={index}
          totalCount={items.length}
          zIndex={baseZIndex + index}
          sectionRef={sectionRefs[index]}
          nextSectionRef={
            index < items.length - 1 ? sectionRefs[index + 1] : null
          }
          {...child.props}
        />
      ))}
    </>
  );
}
