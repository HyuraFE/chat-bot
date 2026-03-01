import { ChatInterface } from "@/components/ChatInterface";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Sparkles, LogIn } from "lucide-react";

export default function Home() {
  return (
    <>
      <SignedIn>
        <ChatInterface />
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4 relative overflow-hidden">
          {/* Animated background glow specifically for login */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center max-w-md w-full animate-fadeIn">
            <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50 ring-1 ring-white/10 animate-float">
              <Sparkles size={36} className="text-white" />
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent mb-3">
              Astra Chat
            </h1>

            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Untuk mulai berkolaborasi dengan chatbot AI yang cerdas, silakan masuk ke akun Anda terlebih dahulu.
            </p>

            <SignInButton mode="modal">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]">
                <LogIn size={18} />
                <span>Masuk Sekarang</span>
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
