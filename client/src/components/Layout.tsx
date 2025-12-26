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
import { Menu, X, User, LogOut, Image, PenTool, Heart } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/works", label: "作品一覧" },
  { href: "/philosophy", label: "Nivaの想映" },
  { href: "/services", label: "サービス" },
  { href: "/tools", label: "使用ツール" },
  { href: "/links", label: "SNS" },
  { href: "/contact", label: "依頼する" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-medium text-lg">
            <span className="gradient-text font-bold">Niva's Souei</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || undefined} alt={user.name || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
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
              <Button asChild variant="default" size="sm">
                <a href={getLoginUrl()}>ログイン</a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
    <footer className="bg-foreground text-background py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Niva's Souei</h3>
            <p className="text-background/70 text-sm leading-relaxed max-w-md">
              想いを映像に翻訳する。AIを活用したクリエイティブ表現で、
              あなたの「伝えたい」を形にします。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-4">コンテンツ</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link href="/works" className="hover:text-background transition-colors">
                  作品一覧
                </Link>
              </li>
              <li>
                <Link href="/philosophy" className="hover:text-background transition-colors">
                  Nivaの想映
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-background transition-colors">
                  サービス
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-background transition-colors">
                  使用ツール
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">お問い合わせ</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link href="/contact" className="hover:text-background transition-colors">
                  依頼フォーム
                </Link>
              </li>
              <li>
                <Link href="/links" className="hover:text-background transition-colors">
                  SNSリンク
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} Niva's Souei. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
