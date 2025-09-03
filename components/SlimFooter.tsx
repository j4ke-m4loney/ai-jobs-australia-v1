import Link from "next/link";
import Image from "next/image";

const SlimFooter = () => {
  return (
    <footer className="py-6 border-t border-border/30 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/aja-300x300-blue-logo.svg"
              alt="AI Jobs Australia"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-semibold text-foreground text-sm">
              AI Jobs Australia
            </span>
          </Link>

          {/* Divider for desktop */}
          <div className="hidden sm:block w-px h-4 bg-border/30"></div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SlimFooter;