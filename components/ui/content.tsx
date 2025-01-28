"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Youtube,
  Mail,
  Loader2,
  Copy,
  Download,
  Sparkles,
  Info,
  Settings2,
  Check,
  RefreshCcw,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface EmailOptions {
  style: string;
  purpose: string;
  ageGroup: string;
  recipientName: string;
  context: string;
}

interface YouTubeOptions {
  videoType: string;
  targetAudience: string;
  contentStyle: string;
  duration: string;
  platform: string;
  toneStyle: string;
  context: string;
}

interface EmailParts {
  subject?: string;
  content?: string;
  analysis?: {
    formality?: string;
    purpose?: string;
    keyPoints?: string[];
  };
}

function Content() {
  const [emailInput, setEmailInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState<string>("");
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [showYouTubeOptions, setShowYouTubeOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAutoEnhance, setIsAutoEnhance] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [lastPrompt, setLastPrompt] = useState<{
    text: string;
    type: "email" | "youtube";
  } | null>(null);
  const MAX_CHARS = 2000;

  // Array of thinking messages
  const thinkingMessages = [
    "Analyzing your request...",
    "Crafting the perfect response...",
    "Applying writing best practices...",
    "Polishing the final touches...",
    "Almost ready...",
  ];

  const parseEmailResponse = (markdown: string): EmailParts => {
    const parts: EmailParts = {};

    // Extract subject
    const subjectMatch = markdown.match(/## Subject\s*\n([^\n]+)/);
    parts.subject = subjectMatch?.[1];

    // Extract content
    const contentMatch = markdown.match(
      /## Email Content\s*\n([\s\S]*?)(?=\n##|$)/
    );
    parts.content = contentMatch?.[1];

    // Extract analysis
    const formalityMatch = markdown.match(/Formality: ([^\n]+)/);
    const purposeMatch = markdown.match(/Purpose: ([^\n]+)/);
    const keyPointsSection = markdown.match(
      /Key Points:\s*\n([\s\S]*?)(?=\n##|$)/
    );

    if (keyPointsSection) {
      const keyPoints = keyPointsSection[1]
        .split("\n")
        .filter((point) => point.trim().startsWith("-"))
        .map((point) => point.trim().replace(/^-\s*/, ""));

      parts.analysis = {
        formality: formalityMatch?.[1],
        purpose: purposeMatch?.[1],
        keyPoints,
      };
    }

    return parts;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setIsCopied(true);
      toast.success("Copied to clipboard", {
        description: "Content has been copied to your clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy", {
        description: "Could not copy content to clipboard",
      });
    }
  };

  const downloadAsTxt = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([response], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "generated-content.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsDownloaded(true);
      toast.success("Downloaded successfully", {
        description: "Content has been downloaded as text file",
      });
      setTimeout(() => setIsDownloaded(false), 2000);
    } catch (err) {
      console.error("Failed to download:", err);
      toast.error("Failed to download", {
        description: "Could not download the content",
      });
    }
  };

  const enhancePrompt = async (input: string, type: "email" | "youtube") => {
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input, type }),
      });

      if (!res.ok) throw new Error("Failed to enhance prompt");

      const data = await res.json();
      return data.enhancedPrompt;
    } catch (err) {
      console.error("Error enhancing prompt:", err);
      toast.error("Failed to enhance prompt");
      return input;
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (input: string, type: "email" | "youtube") => {
    if (!input.trim()) return;
    if (input.length > MAX_CHARS) {
      toast.error("Input exceeds character limit", {
        description: `Please keep your input under ${MAX_CHARS} characters`,
      });
      return;
    }

    // Store the last prompt for regeneration
    setLastPrompt({ text: input, type });

    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);

    setIsLoading(true);
    setError(null);
    setResponse("");
    setIsCopied(false);
    setIsDownloaded(false);

    let messageIndex = 0;
    const thinkingInterval = setInterval(() => {
      setThinking(thinkingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % thinkingMessages.length;
    }, 2000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          type,
          emailOptions: type === "email" ? emailOptions : undefined,
          youtubeOptions: type === "youtube" ? youtubeOptions : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        try {
          const lines = chunk.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            const cleanLine = line.replace(/^data: /, "");
            if (cleanLine === "[DONE]") return;

            try {
              const data = JSON.parse(cleanLine);
              setResponse(
                (prev) =>
                  prev + (data.content || data.message || data.response || "")
              );
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              console.warn("Failed to parse chunk:", cleanLine);
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.warn("Error processing chunk:", chunk);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      type === "email" ? setEmailInput("") : setYoutubeInput("");
    } catch (error) {
      // Proper error type checking
      if (error instanceof Error && error.name === "AbortError") {
        setError("Generation stopped");
        toast.info("Generation stopped");
      } else {
        console.error("Error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    } finally {
      clearInterval(thinkingInterval);
      setThinking("");
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleRegenerate = () => {
    if (lastPrompt) {
      handleSubmit(lastPrompt.text, lastPrompt.type);
    }
  };

  const renderEmailResponse = () => {
    const emailParts = parseEmailResponse(response);
    if (!emailParts.subject) return null;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Subject</h2>
          <p className="text-base sm:text-lg">{emailParts.subject}</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Email Content</h2>
          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none bg-card rounded-lg p-3 sm:p-4 border">
            <ReactMarkdown>{emailParts.content || ""}</ReactMarkdown>
          </div>
        </div>

        {emailParts.analysis && (
          <>
            <Separator />

            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-primary flex items-center gap-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                Analysis
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Formality</p>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {emailParts.analysis.formality}
                  </Badge>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Purpose</p>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {emailParts.analysis.purpose}
                  </Badge>
                </div>
              </div>

              {emailParts.analysis.keyPoints &&
                emailParts.analysis.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Key Points</p>
                    <ul className="list-none space-y-1 sm:space-y-2">
                      {emailParts.analysis.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderEmailOptions = () => (
    <Collapsible
      open={showEmailOptions}
      onOpenChange={setShowEmailOptions}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4 text-xs sm:text-sm"
        >
          <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
          Email Options
          <Badge variant="secondary" className="ml-2 text-xs">
            {showEmailOptions ? "Hide" : "Show"}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        <div className="flex items-center justify-between mb-4 bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Auto-Enhance</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Automatically improve your prompts as you type
              </p>
            </div>
          </div>
          <Switch
            checked={isAutoEnhance}
            onCheckedChange={setIsAutoEnhance}
            aria-label="Toggle auto-enhance"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Style</Label>
            <Select
              value={emailOptions.style}
              onValueChange={(value) =>
                setEmailOptions((prev) => ({ ...prev, style: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Purpose</Label>
            <Select
              value={emailOptions.purpose}
              onValueChange={(value) =>
                setEmailOptions((prev) => ({ ...prev, purpose: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="application">Application</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Age Group</Label>
            <Select
              value={emailOptions.ageGroup}
              onValueChange={(value) =>
                setEmailOptions((prev) => ({ ...prev, ageGroup: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youth">Youth (13-17)</SelectItem>
                <SelectItem value="youngAdult">Young Adult (18-25)</SelectItem>
                <SelectItem value="adult">Adult (26-50)</SelectItem>
                <SelectItem value="senior">Senior (50+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Recipient Name</Label>
            <Input
              placeholder="Enter recipient name"
              value={emailOptions.recipientName}
              onChange={(e) =>
                setEmailOptions((prev) => ({
                  ...prev,
                  recipientName: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <Label className="text-xs sm:text-sm">Additional Context</Label>
          <Textarea
            placeholder="Any additional context or special instructions..."
            value={emailOptions.context}
            onChange={(e) =>
              setEmailOptions((prev) => ({ ...prev, context: e.target.value }))
            }
            className="min-h-[80px] text-xs sm:text-sm"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderYoutubeOptions = () => (
    <Collapsible
      open={showYouTubeOptions}
      onOpenChange={setShowYouTubeOptions}
      className="space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4 text-xs sm:text-sm"
        >
          <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
          Youtube Options
          <Badge variant="secondary" className="ml-2 text-xs">
            {showYouTubeOptions ? "Hide" : "Show"}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        <div className="flex items-center justify-between mb-4 bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <div>
              <p className="text-xs sm:text-sm font-medium">Auto-Enhance</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Automatically improve your prompts as you type
              </p>
            </div>
          </div>
          <Switch
            checked={isAutoEnhance}
            onCheckedChange={setIsAutoEnhance}
            aria-label="Toggle auto-enhance"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Video Type</Label>
            <Select
              value={youtubeOptions.videoType}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({ ...prev, videoType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select video type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="vlog">Vlog</SelectItem>
                <SelectItem value="shorts">Shorts</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Target Audience</Label>
            <Select
              value={youtubeOptions.targetAudience}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({
                  ...prev,
                  targetAudience: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kids">Kids (under 13)</SelectItem>
                <SelectItem value="teens">Teens (13-17)</SelectItem>
                <SelectItem value="youngAdults">
                  Young Adults (18-24)
                </SelectItem>
                <SelectItem value="adults">Adults (25+)</SelectItem>
                <SelectItem value="general">General Audience</SelectItem>
                <SelectItem value="technical">Technical Audience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Content Style</Label>
            <Select
              value={youtubeOptions.contentStyle}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({ ...prev, contentStyle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="entertaining">Entertaining</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="funny">Funny</SelectItem>
                <SelectItem value="dramatic">Dramatic</SelectItem>
                <SelectItem value="mysterious">Mysterious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Duration</Label>
            <Select
              value={youtubeOptions.duration}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({ ...prev, duration: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short ( 1 min)</SelectItem>
                <SelectItem value="medium">Medium (1-5 mins)</SelectItem>
                <SelectItem value="long">Long (5-10 mins)</SelectItem>
                <SelectItem value="extended">Extended (10+ mins)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Platform</Label>
            <Select
              value={youtubeOptions.platform}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({ ...prev, platform: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="shorts">YouTube Shorts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Tone Style</Label>
            <Select
              value={youtubeOptions.toneStyle}
              onValueChange={(value) =>
                setYoutubeOptions((prev) => ({ ...prev, toneStyle: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="dramatic">Dramatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <Label className="text-xs sm:text-sm">Additional Context</Label>
          <Textarea
            placeholder="Any additional context or special instructions..."
            value={youtubeOptions.context}
            onChange={(e) =>
              setYoutubeOptions((prev) => ({
                ...prev,
                context: e.target.value,
              }))
            }
            className="min-h-[80px] text-xs sm:text-sm"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  const [emailOptions, setEmailOptions] = useState<EmailOptions>({
    style: "professional",
    purpose: "business",
    ageGroup: "adult",
    recipientName: "",
    context: "",
  });

  const [youtubeOptions, setYoutubeOptions] = useState<YouTubeOptions>({
    videoType: "tutorial",
    targetAudience: "general",
    contentStyle: "informative",
    duration: "short",
    platform: "youtube",
    toneStyle: "casual",
    context: "",
  });

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2 text-xs sm:text-sm">
            <Mail size={48} color="blue" className="w-3 h-3 sm:w-4 sm:h-4" />
            Email Generator
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2 text-xs sm:text-sm">
            <Youtube size={48} color="red" className="w-3 h-3 sm:w-4 sm:h-4" />
            YouTube Script
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardContent className="pt-6">
              {renderEmailOptions()}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(emailInput, "email");
                }}
              >
                <div className="flex flex-col gap-4 mt-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe the email you want to generate..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[120px] pr-[140px] text-xs sm:text-sm"
                      maxLength={MAX_CHARS}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-3">
                      {emailInput.trim() && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isEnhancing) return;

                            setIsEnhancing(true);
                            try {
                              const enhanced = await enhancePrompt(
                                emailInput,
                                "email"
                              );
                              if (enhanced && enhanced !== emailInput) {
                                setEmailInput(enhanced);
                                toast.success("Prompt enhanced!", {
                                  description:
                                    "Your prompt has been improved for better results",
                                });
                              }
                            } catch (err) {
                              toast.error("Failed to enhance prompt");
                            } finally {
                              setIsEnhancing(false);
                            }
                          }}
                          disabled={isLoading || isEnhancing}
                          className="h-7 px-3 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-primary border-primary/20"
                        >
                          {isEnhancing ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              <span className="text-[10px] sm:text-xs font-medium">
                                Enhancing...
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              <span className="text-[10px] sm:text-xs font-medium">
                                Enhance
                              </span>
                            </>
                          )}
                        </Button>
                      )}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {emailInput.length}/{MAX_CHARS}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !emailInput.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Email...
                        </>
                      ) : (
                        "Generate Email"
                      )}
                    </Button>
                    {isLoading && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={handleStop}
                        className="shrink-0 hover:scale-105 transition-all duration-200"
                        title="Stop Generating"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube">
          <Card>
            <CardContent className="pt-6">
              {renderYoutubeOptions()}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(youtubeInput, "youtube");
                }}
              >
                <div className="flex flex-col gap-4 mt-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe your YouTube video idea..."
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      disabled={isLoading}
                      className="min-h-[120px] pr-[140px] text-xs sm:text-sm"
                      maxLength={MAX_CHARS}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-3">
                      {youtubeInput.trim() && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isEnhancing) return;

                            setIsEnhancing(true);
                            try {
                              const enhanced = await enhancePrompt(
                                youtubeInput,
                                "youtube"
                              );
                              if (enhanced && enhanced !== youtubeInput) {
                                setYoutubeInput(enhanced);
                                toast.success("Prompt enhanced!", {
                                  description:
                                    "Your prompt has been improved for better results",
                                });
                              }
                            } catch (err) {
                              toast.error("Failed to enhance prompt");
                            } finally {
                              setIsEnhancing(false);
                            }
                          }}
                          disabled={isLoading || isEnhancing}
                          className="h-7 px-3 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-primary border-primary/20"
                        >
                          {isEnhancing ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              <span className="text-[10px] sm:text-xs font-medium">
                                Enhancing...
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              <span className="text-[10px] sm:text-xs font-medium">
                                Enhance
                              </span>
                            </>
                          )}
                        </Button>
                      )}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {youtubeInput.length}/{MAX_CHARS}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !youtubeInput.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Script...
                        </>
                      ) : (
                        "Generate Script"
                      )}
                    </Button>
                    {isLoading && (
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={handleStop}
                        className="shrink-0 hover:scale-105 transition-all duration-200"
                        title="Stop Generating"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isLoading && thinking && (
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
              <p className="text-xs sm:text-sm text-muted-foreground animate-pulse">{thinking}</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mt-4 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {response && !error && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none overflow-x-auto text-xs sm:text-sm">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={!lastPrompt || isLoading}
                className="w-full sm:w-auto sm:mr-auto bg-blue-500/10 hover:bg-blue-500 hover:text-white border-blue-500/20 text-blue-500 transition-all duration-200 group"
              >
                <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Regenerate
              </Button>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className={cn(
                    "flex items-center gap-2 w-full sm:w-auto",
                    isCopied && "text-green-500"
                  )}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {isCopied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsTxt}
                  className={cn(
                    "flex items-center gap-2 w-full sm:w-auto",
                    isDownloaded && "text-green-500"
                  )}
                >
                  {isDownloaded ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloaded ? "Downloaded!" : "Download"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </Tabs>
      <Toaster />
    </div>
  );
}

export default Content;
