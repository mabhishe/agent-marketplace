import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Download, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Marketplace() {
  const [location, navigate] = useLocation();
  const [category, setCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const { data: agentsData, isLoading } = trpc.marketplace.listAgents.useQuery({
    limit,
    offset,
    category: category || undefined,
  });

  const { data: categories } = trpc.marketplace.getCategories.useQuery();

  const agents = agentsData?.agents || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Agent Marketplace</h1>
          <p className="text-lg text-slate-600">Discover and deploy AI agents for your workflows</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No agents found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/agent/${agent.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{agent.name}</CardTitle>
                      <CardDescription>{agent.category}</CardDescription>
                    </div>
                    {agent.icon && (
                      <img src={agent.icon} alt={agent.name} className="w-12 h-12 rounded-lg ml-2" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{agent.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{agent.rating || "0"}</span>
                      <span className="text-xs text-slate-500">({agent.reviewCount || 0})</span>
                    </div>
                    <Badge variant="outline">{agent.billingModel}</Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{agent.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>${(agent.basePrice || 0) / 100}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => navigate(`/agent/${agent.id}`)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {agents.length > 0 && (
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={agents.length < limit}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
