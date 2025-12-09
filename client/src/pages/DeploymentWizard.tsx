import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type DeploymentStep = "type" | "provider" | "config" | "confirm";

export default function DeploymentWizard() {
  const params = useParams();
  const [, navigate] = useLocation();
  const agentId = parseInt(params?.id || "0");

  const [step, setStep] = useState<DeploymentStep>("type");
  const [deploymentType, setDeploymentType] = useState<"saas" | "byoc">("saas");
  const [cloudProvider, setCloudProvider] = useState<"gcp" | "aws" | "azure">("gcp");

  const { data: agent, isLoading: agentLoading } = trpc.marketplace.getAgentDetail.useQuery(agentId);
  const createDeploymentMutation = trpc.deployment.createDeployment.useMutation({
    onSuccess: (result) => {
      toast.success("Deployment created successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create deployment");
    },
  });

  const handleDeploy = async () => {
    try {
      await createDeploymentMutation.mutateAsync({
        agentId,
        deploymentType,
        cloudProvider: deploymentType === "byoc" ? cloudProvider : undefined,
      });
    } catch (error) {
      console.error("Deployment error:", error);
    }
  };

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
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
          <Button variant="ghost" onClick={() => navigate(`/agent/${agentId}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agent
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Deploy {agent.name}</h1>
          <p className="text-slate-600 mt-2">Follow the steps to deploy this agent</p>
        </div>
      </div>

      {/* Wizard */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {(["type", "provider", "config", "confirm"] as const).map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s
                      ? "bg-blue-600 text-white"
                      : (["type", "provider", "config", "confirm"].indexOf(s) <
                          ["type", "provider", "config", "confirm"].indexOf(step)
                        ? "bg-green-600 text-white"
                        : "bg-slate-200 text-slate-600")
                  }`}
                >
                  {["type", "provider", "config", "confirm"].indexOf(s) <
                  ["type", "provider", "config", "confirm"].indexOf(step) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 3 && <div className="flex-1 h-1 mx-2 bg-slate-200"></div>}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {step === "type" && "Select Deployment Type"}
                {step === "provider" && "Choose Cloud Provider"}
                {step === "config" && "Configure Deployment"}
                {step === "confirm" && "Review & Deploy"}
              </CardTitle>
              <CardDescription>
                {step === "type" && "Choose how you want to deploy this agent"}
                {step === "provider" && "Select your cloud infrastructure provider"}
                {step === "config" && "Configure deployment settings"}
                {step === "confirm" && "Review your deployment configuration"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Selection */}
              {step === "type" && (
                <RadioGroup value={deploymentType} onValueChange={(v) => setDeploymentType(v as "saas" | "byoc")}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value="saas" id="saas" />
                      <Label htmlFor="saas" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Cloud Hosted (SaaS)</div>
                        <div className="text-sm text-slate-600">
                          Agent runs in our managed cloud infrastructure. Simple setup, no infrastructure needed.
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <RadioGroupItem value="byoc" id="byoc" />
                      <Label htmlFor="byoc" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Your Cloud (BYOC)</div>
                        <div className="text-sm text-slate-600">
                          Agent runs in your own cloud account. Maximum security and control.
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {/* Provider Selection */}
              {step === "provider" && deploymentType === "byoc" && (
                <div className="space-y-4">
                  <Label>Select your cloud provider</Label>
                  <Select value={cloudProvider} onValueChange={(v) => setCloudProvider(v as "gcp" | "aws" | "azure")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                      <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      You'll need to provide cloud credentials for the selected provider to proceed.
                    </div>
                  </div>
                </div>
              )}

              {/* Configuration */}
              {step === "config" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Deployment Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Deployment Type:</span>
                        <span className="font-semibold capitalize">{deploymentType}</span>
                      </div>
                      {deploymentType === "byoc" && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cloud Provider:</span>
                          <span className="font-semibold uppercase">{cloudProvider}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Agent:</span>
                        <span className="font-semibold">{agent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Version:</span>
                        <span className="font-semibold">v{agent.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {step === "confirm" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      Ready to deploy {agent.name}. Click "Deploy" to proceed.
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Agent:</span>
                        <span className="font-semibold">{agent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span className="font-semibold capitalize">{deploymentType}</span>
                      </div>
                      {deploymentType === "byoc" && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Provider:</span>
                          <span className="font-semibold uppercase">{cloudProvider}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Billing:</span>
                        <span className="font-semibold">${(agent.basePrice || 0) / 100} per task</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (step === "type") navigate(`/agent/${agentId}`);
                else if (step === "provider") setStep("type");
                else if (step === "config") setStep(deploymentType === "byoc" ? "provider" : "type");
                else if (step === "confirm") setStep("config");
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (step === "type") setStep(deploymentType === "byoc" ? "provider" : "config");
                else if (step === "provider") setStep("config");
                else if (step === "config") setStep("confirm");
                else if (step === "confirm") handleDeploy();
              }}
              disabled={createDeploymentMutation.isPending}
            >
              {step === "confirm"
                ? createDeploymentMutation.isPending
                  ? "Deploying..."
                  : "Deploy"
                : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
