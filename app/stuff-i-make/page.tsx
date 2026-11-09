import type { Metadata } from "next";
import Stuff from "@/components/stuff";

export const metadata: Metadata = {
  title: "Stuff I Make — Nguyễn Hữu Huy",
  description:
    "Phần mềm mình tự viết và phát hành, kèm bản tải cho Windows, macOS và Linux.",
};

export default function StuffPage() {
  return <Stuff />;
}
