"use client";

import Header from "@/components/HomePage/Header";
import Theme from "@/components/Theme/Theme";
import { useParams } from "next/navigation";

export default function ThemeLayout() {
  const params = useParams();
  const themeId = params?.id;
  return (
    <>
      <Header />
      {<Theme themeId={themeId}/>}
    </>
  );
}
