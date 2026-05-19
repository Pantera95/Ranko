import { MessageCircle } from "lucide-react";

export function WhatsAppFloating() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584147903498";
  const message = encodeURIComponent("Hola Ranko Parts, necesito ayuda con un repuesto.");

  return (
    <a
      aria-label="Escribir a Ranko Parts por WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 transition hover:scale-105"
      href={`https://wa.me/${number}?text=${message}`}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle size={26} />
    </a>
  );
}
