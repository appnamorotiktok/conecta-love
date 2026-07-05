"use client";

import { useEffect } from "react";

export function SetReferralCookie({ code }: { code: string }) {
  useEffect(() => {
    const maxAge = 60 * 60 * 24 * 30; // 30 dias
    document.cookie = `ref_code=${code}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }, [code]);

  return null;
}
