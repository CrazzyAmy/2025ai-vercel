import { redirect } from "next/navigation"
import { getCurrentUser } from "../action/auth-action"
import DashboardContent from "./dashboard-content"
import { useState } from 'react';
//import { useRouter } from 'next/navigation';
export default async function DashboardPage() {
  const user = await getCurrentUser()
  //const router = useRouter();
  if (!user) {
        redirect("/auth/login/surveyset");
        //router.push('/index/surveyset');
    }
  // Map user fields to match the User type expected by DashboardContent
  const mappedUser = {
    ...user,
    is_active: user.isActive,
    created_at: user.createdAt,
    role_name: user.role?.name,
    role_description: user.role?.description,
    permissions: user.role?.permissions || [],
  };
  return <DashboardContent user={mappedUser} />
}