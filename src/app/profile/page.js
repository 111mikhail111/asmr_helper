"use client";


import Header from "@/components/HomePage/Header";
import ProfilePage from "@/components/Profile/Profile";

export default function ProfileLayout() {
  return (
    <>
      <Header />
      {<ProfilePage/>
      }
    </>
  );
}
