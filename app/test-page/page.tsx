// /test-page/page.tsx
"use client";

import apiClient from "@/api/apiClient";
import { useEffect } from "react";

export default function TestPage() {
  // GET api/test/important 요청하기

  useEffect(() => {
    const fetchImportant = async () => {
      try {
        const response = await apiClient.get("/api/test/important");
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching important:", error);
      }
    };
    fetchImportant();
  }, []);

  return (
    <div>
      <h1>TestPage</h1>
    </div>
  );
}
