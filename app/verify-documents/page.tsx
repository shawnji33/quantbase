import type { Metadata } from "next"

import { VerifyDocuments } from "@/components/portfolio/verify-documents"

export const metadata: Metadata = {
  title: "Upload documents · Quantbase",
  robots: { index: false },
}

export default function VerifyDocumentsPage() {
  return <VerifyDocuments />
}
