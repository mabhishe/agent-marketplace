import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Zap, Settings, Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: deployments = [] } = trpc.deployment.listDeployments.useQuery();
  const { data: subscriptions = [] } = trpc.billing.listSubscriptions.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "deploying":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "stopped":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-2">Welcome back, {user?.name || "User"}!</p>
            </div>
            <Button onClick={() => navigate("/marketplace")}>Browse Agents</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="deployments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Deployments Tab */}
          <TabsContent value="deployments" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Deployments</h2>
              <Button onClick={() => navigate("/marketplace")}>
                <Plus className="w-4 h-4 mr-2" />
                New Deployment
              </Button>
            </div>

            {deployments.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-slate-600 mb-4">No deployments yet</p>
                  <Button onClick={() => navigate("/marketplace")}>
                    Deploy Your First Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            Agent Deployment #{deployment.id}
                            <Badge className={getStatusColor(deployment.status)}>
                              {deployment.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {deployment.deploymentType === "saas" ? "Cloud Hosted" : "BYOC"} • {deployment.cloudProvider || "N/A"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/deployment/${deployment.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Logs</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Stop Deployment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Type</p>
                          <p className="font-semibold capitalize">{deployment.deploymentType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Created</p>
                          <p className="font-semibold">{new Date(deployment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">URL</p>
                          <p className="font-semibold text-sm truncate">{deployment.deploymentUrl || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Provider</p>
                          <p className="font-semibold capitalize">{deployment.cloudProvider || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Your Subscriptions</h2>

            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-slate-600 mb-4">No active subscriptions</p>
                  <Button onClick={() => navigate("/marketplace")}>
                    Browse Agents to Subscribe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Agent Subscription #{subscription.id}
                            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                              {subscription.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {subscription.billingModel} • ${(subscription.pricePerUnit || 0) / 100}/unit
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Current Usage</p>
                          <p className="font-semibold">{subscription.currentUsage || 0} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Renewal Date</p>
                          <p className="font-semibold">
                            {subscription.renewalDate
                              ? new Date(subscription.renewalDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Monthly Cost</p>
                          <p className="font-semibold">${(subscription.pricePerUnit || 0) / 100}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Role</p>
                  <p className="font-semibold capitalize">{user?.role}</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloud Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">Manage your cloud provider credentials for BYOC deployments</p>
                <Button variant="outline">Add Cloud Credentials</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
