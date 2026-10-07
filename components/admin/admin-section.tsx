import { SectionHeading } from "@/components/ui/section-heading";

type AdminSectionProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: React.ReactNode;
};

export function AdminSection({
  title,
  description,
  eyebrow = "Admin",
  actions,
}: AdminSectionProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {actions}
    </div>
  );
}
