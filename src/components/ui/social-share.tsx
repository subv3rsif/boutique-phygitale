'use client';

import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export function SocialShare({ url, title, description, image, className }: SocialShareProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on mount
  useEffect(() => {
    const checkMobile = () => {
      // Check both screen size and touch capability
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowOptions(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowOptions(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    // On mobile: use native share sheet if available
    // On desktop: always show custom menu for better UX
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        setShowOptions(false);
      } catch (err) {
        // User cancelled or error occurred - show custom menu as fallback
        console.log('Share cancelled or failed:', err);
        setShowOptions(!showOptions);
      }
    } else {
      // Desktop or no native share: show custom share options
      setShowOptions(!showOptions);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Share Button */}
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="lg"
        className="gap-2 bg-background hover:bg-muted transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>Partager</span>
      </Button>

      {/* Share Options Popup */}
      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
              className="fixed inset-0 z-40"
            />

            {/* Options Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-premium-lg overflow-hidden z-50"
            >
              <div className="p-2 space-y-1">
                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <Facebook className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Facebook</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <Twitter className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Twitter</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center">
                    <Linkedin className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">LinkedIn</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">WhatsApp</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Email</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left border-t border-border mt-1 pt-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {copied ? 'Lien copié !' : 'Copier le lien'}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
