import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, User, LogOut, Image, PenTool, Heart, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationCenter } from "./NotificationCenter";
import { ScrollToTop } from "./ScrollToTop";

const navLinks = [
  { href: "/works", label: "作品一覧" },
  { href: "/philosophy", label: "Nivaの想映" },
  { href: "/services", label: "料金プラン" },
  { href: "/tools", label: "使用ツール" },
  { href: "/links", label: "SNS" },
  { href: "/contact", label: "依頼する" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#2B3A42]/10' 
        : 'bg-transparent'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-serif text-lg">
            <span className="text-[#2B3A42] font-medium tracking-tight">Nivaの想映</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location === link.href
                      ? "text-gold bg-gold/10"
                      : "text-[#2B3A42]/70 hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {/* Notification Bell - only show when logged in */}
            {isAuthenticated && user && <NotificationCenter />}
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gold/10">
                    <Avatar className="h-9 w-9 border border-gold/30">
                      <AvatarImage src={user.avatar || undefined} alt={user.name || ""} />
                      <AvatarFallback className="bg-gold/20 text-gold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-[#2B3A42]">{user.name}</p>
                    <p className="text-xs text-[#5A6B75]">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      プロフィール
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/works/new" className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        作品を投稿
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile/likes" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      いいねした作品
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="bg-gold hover:bg-gold/90 text-[#F4F8FA] rounded-full">
                <a href={getLoginUrl()}>ログイン</a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gold/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-[#2B3A42]" /> : <Menu className="h-5 w-5 text-[#2B3A42]" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#2B3A42]/10 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location === link.href
                        ? "text-gold bg-gold/10"
                        : "text-[#2B3A42]/70 hover:text-gold hover:bg-gold/5"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#2B3A42] text-[#F4F8FA] py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-medium mb-4">Nivaの想映</h3>
            <p className="text-[#F4F8FA]/70 text-sm leading-relaxed max-w-md">
              音・映像・物語の「同期」。その一点が、心に波紋をつくる。
              AIを活用したワンストップ・クリエイションで、
              あなたの「伝えたい」を形にします。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-4 text-gold">コンテンツ</h4>
            <ul className="space-y-2 text-sm text-[#F4F8FA]/70">
              <li>
                <Link href="/works" className="hover:text-gold transition-colors">
                  作品一覧
                </Link>
              </li>
              <li>
                <Link href="/philosophy" className="hover:text-gold transition-colors">
                  Nivaの想映
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gold transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-gold transition-colors">
                  使用ツール
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4 text-gold">お問い合わせ</h4>
            <ul className="space-y-2 text-sm text-[#F4F8FA]/70">
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  依頼フォーム
                </Link>
              </li>
              <li>
                <Link href="/links" className="hover:text-gold transition-colors">
                  SNSリンク
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F4F8FA]/10 mt-12 pt-8 text-center text-sm text-[#F4F8FA]/50">
          <p>© {new Date().getFullYear()} Nivaの想映. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FA]">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}