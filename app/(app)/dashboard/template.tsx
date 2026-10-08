import { AppRouteFade } from "@/components/motion/app-route-fade";

export default function Template({ children }: { children: React.ReactNode }) {
  return <AppRouteFade>{children}</AppRouteFade>;
}
