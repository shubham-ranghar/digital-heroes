import { editorialParenLabel } from "@/lib/typography-editorial";
import { cn } from "@/lib/utils";

type ParenLabelProps = {
  children: string;
  className?: string;
};

export function ParenLabel({ children, className }: ParenLabelProps) {
  return (
    <span className={cn(editorialParenLabel, className)}>
      ( {children} )
    </span>
  );
}
