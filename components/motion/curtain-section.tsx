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

import {
  SteppedEdge,
  type SteppedEdgeScale,
} from "@/components/editorial/stepped-edge";
import { ScrollFade } from "@/components/motion/scroll-fade";
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
  /**
   * Stepped edge at this section's top seam. Ration it: a page carries at
   * most a few, one of them `dramatic`; every other seam is flat (`none`).
   */
  edge?: SteppedEdgeScale | "none";
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
  edge = "standard",
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
  // A depth cue, not a blackout: cream dimmed further turns muddy grey.
  const overlayOpacity = useTransform(cover, [0.12, 1], [0, 0.18]);
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
      {edge !== "none" ? (
        <SteppedEdge
          position="top"
          color={edgeColor}
          bandColor={previousColor}
          scrollTargetRef={sectionRef}
          scale={edge}
        />
      ) : null}
      <div
        className={cn(
          pinActive && "sticky top-0 min-h-svh overflow-hidden",
        )}
      >
        <div ref={innerRef} className="relative">
          {/* Above the content (z-20), so the whole pinned frame dims as the
              next section slides over; beneath it, only the strip uncovered
              by the content's parallax dimmed, which read as a grey seam. */}
          {pinActive ? (
            <m.div
              className="pointer-events-none absolute inset-0 z-20 bg-navy group-data-scrubbing/curtain:will-change-[opacity]"
              style={{ opacity: overlayOpacity }}
              aria-hidden
            />
          ) : null}
          <m.div
            className="relative z-10 group-data-scrubbing/curtain:will-change-transform"
            style={pinActive ? { y: contentY } : undefined}
          >
            {/* Content fades as one unit against the full section's travel
                (the outer div spans the pin spacer; the sticky frame doesn't). */}
            <ScrollFade measureRef={sectionRef}>{children}</ScrollFade>
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
