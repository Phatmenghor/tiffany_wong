"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  services?: string[];
  onSubmit: (review: {
    title: string;
    comment: string;
    rating: number;
    serviceUsed?: string;
  }) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  businessName,
  services = [],
  onSubmit,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !title || !comment) {
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit({
        title,
        comment,
        rating,
        serviceUsed: selectedService || undefined,
      });

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setSelectedService("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Share your experience with {businessName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          {services.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Service (Optional)
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your experience"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !title || !comment}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
