import type { Metadata } from "next";
import Productivity from "@/components/productivity";

export const metadata: Metadata = {
  title: "My Productivity — Nguyễn Hữu Huy",
  description:
    "Tech mình dùng hằng ngày: software, agent, CLI, code — và góc setup thay đổi qua từng năm.",
};

export default function ProductivityPage() {
  return <Productivity />;
}
