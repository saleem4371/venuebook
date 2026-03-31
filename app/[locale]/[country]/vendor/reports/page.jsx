"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReportHome() {
  const router = useRouter();
  const params = useParams();
  const basePath = `/${params?.locale}/${params?.country}/vendor/reports/revenue_report`;

  useEffect(() => {
    router.push(basePath);
  }, [basePath, router]);

  return null; // or a loading spinner
}