import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Download, Zap, ArrowLeft } from "lucide-react";

export default function AgentDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const agentId = parseInt(params?.id || "0");

  const { data: agent, isLoading } = trpc.marketplace.getAgentDetail.useQuery(agentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
          <p className="text-center text-slate-600 mt-8">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/marketplace")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex items-start gap-6">
            {agent.icon && (
              <img src={agent.icon} alt={agent.name} className="w-24 h-24 rounded-lg" />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{agent.name}</h1>
              <p className="text-lg text-slate-600 mb-4">{agent.description}</p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <Badge>{agent.category}</Badge>
                <Badge variant="outline">v{agent.version}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{agent.rating || "0"}</span>
                  <span className="text-sm text-slate-500">({agent.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-4">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Billing Model</p>
                        <p className="font-semibold">{agent.billingModel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Base Price</p>
                        <p className="font-semibold">${(agent.basePrice || 0) / 100}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Downloads</p>
                        <p className="font-semibold">{agent.downloadCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Status</p>
                        <p className="font-semibold capitalize">{agent.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                {agent.tools && agent.tools.length > 0 ? (
                  agent.tools.map((tool) => (
                    <Card key={tool.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{tool.toolName}</CardTitle>
                        <CardDescription>{tool.toolType}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 mb-2">{tool.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{tool.permissionLevel}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-slate-600">No tools available</p>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {agent.reviews && agent.reviews.length > 0 ? (
                  agent.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-slate-600">No reviews yet</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deploy This Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Price per task</p>
                  <p className="text-3xl font-bold">${(agent.basePrice || 0) / 100}</p>
                </div>
                <Button className="w-full" size="lg" onClick={() => navigate(`/deploy/${agent.id}`)}>
                  Deploy Agent
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Downloads</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {agent.downloadCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {agent.rating || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Version</span>
                  <span className="font-semibold">v{agent.version}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
