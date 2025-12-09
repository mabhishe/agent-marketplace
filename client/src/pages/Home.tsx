import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Zap, Cloud, Lock, Zap as ZapIcon, ArrowRight, Users, Gauge, Rocket } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Agent Marketplace</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button onClick={() => navigate("/marketplace")}>Browse Agents</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => (window.location.href = getLoginUrl())}>
                  Sign In
                </Button>
                <Button onClick={() => (window.location.href = getLoginUrl())}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Hire AI Agents Like Employees
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Deploy specialized, tool-enabled AI agents to automate your workflows. Choose between cloud-hosted or bring-your-own-cloud deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => navigate("/marketplace")} className="bg-blue-600 hover:bg-blue-700">
                  Browse Agents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-700/50 border-slate-600 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Cloud className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Flexible Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Deploy agents in our cloud or bring your own infrastructure for maximum control and security.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Lock className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  SOC2-ready architecture with VPC isolation, IAM controls, and zero-trust communication.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/50 border-slate-600 hover:border-blue-500 transition-colors">
              <CardHeader>
                <Rocket className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Quick Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Deploy agents in under 2 minutes with our streamlined onboarding and deployment process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <Gauge className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Cloud Cost Optimization</CardTitle>
              <CardDescription className="text-slate-300">
                Automatically identify and eliminate cloud spending waste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Analyze your cloud infrastructure, identify unused resources, and generate cost-saving recommendations automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <ZapIcon className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">CI/CD Automation</CardTitle>
              <CardDescription className="text-slate-300">
                Streamline your deployment pipelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Automate testing, building, and deployment workflows with intelligent agents that learn from your patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <Cloud className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Infrastructure Management</CardTitle>
              <CardDescription className="text-slate-300">
                Manage cloud resources at scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Deploy, update, and manage infrastructure across multiple cloud providers with a single agent.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Monitoring & Alerts</CardTitle>
              <CardDescription className="text-slate-300">
                Proactive system monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm">
                Monitor system health, detect anomalies, and trigger automated remediation actions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams automating their workflows with AI agents
          </p>
          {isAuthenticated ? (
            <Button size="lg" variant="secondary" onClick={() => navigate("/marketplace")}>
              Browse Agents Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={() => (window.location.href = getLoginUrl())}>
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">API Docs</a></li>
                <li><a href="#" className="hover:text-white">SDK</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 Agent Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
