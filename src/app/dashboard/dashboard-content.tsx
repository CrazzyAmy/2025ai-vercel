"use client"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Users, Shield, Settings, LogOut, UserCheck, Lock, Activity, BarChart3 } from "lucide-react"
import { logout } from "../action/auth-action"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  is_active: boolean
  created_at: Date
  role_name: string
  role_description: string
  permissions: Array<{
    id: string
    name: string
    description: string
    resource: string
    action: string
  }>
}

interface DashboardContentProps {
  user: User
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const hasPermission = (resource: string, action: string) => {
    return user.permissions.some((p) => p.resource === resource && p.action === action)
  }

  const canManageUsers =
    hasPermission("user", "create") || hasPermission("user", "update") || hasPermission("user", "delete")
  const canManageRoles = hasPermission("role", "manage")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Platform Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {user.role_name}
              </Badge>
              <form action={logout}>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(" ")[0]}!</h2>
          <p className="text-gray-600">
            You have {user.role_name} access with {user.permissions.length} permissions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Status</p>
                  <p className="text-2xl font-bold text-green-600">{user.is_active ? "Active" : "Inactive"}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <p className="text-2xl font-bold text-blue-600">{user.role_name}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permissions</p>
                  <p className="text-2xl font-bold text-purple-600">{user.permissions.length}</p>
                </div>
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-2xl font-bold text-orange-600">{new Date(user.created_at).getFullYear()}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Navigation Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManageUsers && (
                <Link href="/dashboard/users">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
              )}

              {canManageRoles && (
                <Link href="/dashboard/roles">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Roles & Permissions
                  </Button>
                </Link>
              )}

              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <UserCheck className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>

              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Permissions Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Your Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{permission.name}</p>
                      <p className="text-xs text-gray-600">{permission.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {permission.resource}:{permission.action}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
