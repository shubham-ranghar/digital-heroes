"use client";

import {
  m,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
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

import { SteppedEdge } from "@/components/editorial/stepped-edge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useScrubFlag } from "@/hooks/use-scrub-flag";
import { cn } from "@/lib/utils";

export type CurtainSectionProps = {
  children: ReactNode;
  /** Surface tone, read by the site nav via `data-tone`. */
  tone: "cream" | "navy";
  edgeColor: string;
  surfaceClassName?: string;
  className?: string;
  /** Hold this section while the next one slides over it (md+, if it fits). */
  pin?: boolean;
};

type CurtainStackProps = {
  children: ReactNode;
  baseZIndex?: number;
  /** Colour directly above the first section, shown behind its stepped edge. */
  leadColor?: string;
};

/**
 * Feeds `cover` (0 = next section below the viewport, 1 = its top at the
 * viewport top) from framer's shared scroll tracker. Mounted only while a
 * section is actually pinned, so unpinned sections attach no scroll work.
 */
function PinCoverDriver({
  nextSectionRef,
  cover,
}: {
  nextSectionRef: RefObject<HTMLDivElement | null>;
  cover: MotionValue<number>;
}) {
  const { scrollYProgress } = useScroll({
    target: nextSectionRef,
    offset: ["start end", "start start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => cover.set(value));
  useEffect(() => {
    cover.set(scrollYProgress.get());
    return () => cover.set(0);
  }, [cover, scrollYProgress]);

  return null;
}

function CurtainSectionInner({
  index,
  totalCount,
  zIndex,
  tone,
  edgeColor,
  surfaceClassName,
  children,
  className,
  pin = false,
  sectionRef,
  nextSectionRef,
  previousColor,
}: CurtainSectionProps & {
  index: number;
  totalCount: number;
  zIndex: number;
  previousColor?: string;
  sectionRef: RefObject<HTMLDivElement | null>;
  nextSectionRef: RefObject<HTMLDivElement | null> | null;
}) {
  const reduceMotion = useReducedMotion();
  const mdUp = useMediaQuery("(min-width: 768px)");
  const innerRef = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(false);
  const cover = useMotionValue(0);
  const overlayOpacity = useTransform(cover, [0.12, 1], [0, 0.45]);
  const contentY = useTransform(cover, (value) => `${-4 * value}vh`);
  // Layers are promoted only while the next section is sliding over.
  useScrubFlag(cover, sectionRef);

  const canPin = pin && index < totalCount - 1 && nextSectionRef != null;

  useEffect(() => {
    const node = innerRef.current;
    if (!canPin || !node) {
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      setTall(node.scrollHeight > window.innerHeight * 1.05);
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(measure);
      }
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(node);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [canPin]);

  const pinActive = canPin && !tall && mdUp && !reduceMotion;

  return (
    <div
      ref={sectionRef}
      data-tone={tone}
      // Lets a section fill and compose to the pinned viewport frame
      // (`group-data-pinned/curtain:`) instead of leaving it blank below.
      data-pinned={pinActive ? "" : undefined}
      className={cn("group/curtain relative", surfaceClassName, className)}
      style={{ zIndex }}
    >
      {pinActive && nextSectionRef ? (
        <PinCoverDriver nextSectionRef={nextSectionRef} cover={cover} />
      ) : null}
      <SteppedEdge
        position="top"
        color={edgeColor}
        bandColor={previousColor}
        scrollTargetRef={sectionRef}
      />
      <div
        className={cn(
          pinActive && "sticky top-0 min-h-svh overflow-hidden",
        )}
      >
        <div ref={innerRef} className="relative">
          {pinActive ? (
            <m.div
              className="pointer-events-none absolute inset-0 z-0 bg-navy group-data-scrubbing/curtain:will-change-[opacity]"
              style={{ opacity: overlayOpacity }}
              aria-hidden
            />
          ) : null}
          <m.div
            className="relative z-10 group-data-scrubbing/curtain:will-change-transform"
            style={pinActive ? { y: contentY } : undefined}
          >
            {children}
          </m.div>
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

export function CurtainStack({
  children,
  baseZIndex = 10,
  leadColor,
}: CurtainStackProps) {
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
          previousColor={
            index === 0 ? leadColor : items[index - 1].props.edgeColor
          }
          {...child.props}
        />
      ))}
    </>
  );
}
