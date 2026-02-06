"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "35699213791";
const DEFAULT_MESSAGE = "Hi! I have a question about your products.";

export default function WhatsAppButton() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
    >
      <MessageCircle className="w-6 h-6" fill="currentColor" />
    </a>
  );
}
