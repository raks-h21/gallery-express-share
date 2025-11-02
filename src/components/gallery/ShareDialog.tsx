import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gallery } from "@/types/gallery";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Download, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import LZString from "lz-string";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: Gallery;
}

export const ShareDialog = ({ open, onOpenChange, gallery }: ShareDialogProps) => {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (open) {
      generateShareUrl();
    }
  }, [open, gallery]);

  const generateShareUrl = async () => {
    try {
      const shareData = {
        name: gallery.name,
        artworks: await Promise.all(
          gallery.artworks.map(async (artwork) => {
            const imgData = await fileToBase64(artwork.imgPath);
            const audioData = artwork.audioPath ? await fileToBase64(artwork.audioPath) : undefined;
            return {
              title: artwork.title,
              description: artwork.description,
              imgData,
              audioData,
            };
          })
        ),
      };

      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(shareData));
      const url = `${window.location.origin}?gallery=${compressed}`;
      setShareUrl(url);
    } catch (error) {
      console.error("Error generating share URL:", error);
      toast.error("Failed to generate share link");
    }
  };

  const fileToBase64 = async (path: string): Promise<string> => {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return path; // Return original path if conversion fails
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${gallery.name}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR code downloaded!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareToSocial = (platform: "twitter" | "facebook") => {
    const text = `Check out my gallery: ${gallery.name}`;
    const url = encodeURIComponent(shareUrl);
    
    if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, "_blank");
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            Share Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share URL */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-gallery-elevated border-border"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label>QR Code</Label>
            <div className="flex flex-col items-center gap-4 p-6 bg-gallery-elevated rounded-lg border border-border">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => shareToSocial("twitter")}
                variant="outline"
                className="w-full"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareToSocial("facebook")}
                variant="outline"
                className="w-full"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Anyone with this link or QR code can view your gallery
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
