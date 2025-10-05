import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Download, Video, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handlePlay = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL to play",
        variant: "destructive",
      });
      return;
    }

    const encodedUrl = encodeURIComponent(videoUrl.trim());
    setLocation(`/Play/${encodedUrl}`);
  };

  const handleDownload = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL to download",
        variant: "destructive",
      });
      return;
    }

    const encodedUrl = encodeURIComponent(videoUrl.trim());
    setLocation(`/Down/${encodedUrl}`);
  };

  const handleSampleVideo = () => {
    const sampleUrl = "https://content.jwplatform.com/videos/bkaovAYt-injeKYZS.mp4";
    setVideoUrl(sampleUrl);
    toast({
      title: "Sample Video Loaded",
      description: "You can now play or download this sample video",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Video className="w-12 h-12 text-primary mr-3" data-testid="icon-video" />
              <h1 className="text-4xl font-bold" data-testid="text-title">JW Player</h1>
            </div>
            <p className="text-muted-foreground text-lg" data-testid="text-subtitle">
              Enhanced video player with fixed background issues
            </p>
          </div>

          {/* Main Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-card-title">
                <Play className="w-5 h-5 text-primary" />
                Video Player
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl" data-testid="label-video-url">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full"
                  data-testid="input-video-url"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handlePlay}
                  className="flex-1 flex items-center gap-2"
                  data-testid="button-play"
                >
                  <Play className="w-4 h-4" />
                  Play Video
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  className="flex-1 flex items-center gap-2"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>

              <Button
                onClick={handleSampleVideo}
                variant="outline"
                className="w-full"
                data-testid="button-sample"
              >
                Load Sample Video
              </Button>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-features-title">
                <Info className="w-5 h-5 text-primary" />
                Fixed Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2" data-testid="feature-stretching">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Changed stretching mode from 'uniform' to 'fill' to eliminate dark backgrounds</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-background">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Removed semi-transparent black background from player skin</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-aspect">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Adjusted aspect ratio handling to match video dimensions</span>
                </li>
                <li className="flex items-start gap-2" data-testid="feature-colors">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Video now fills entire container with original colors</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
