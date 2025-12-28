import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Layout } from "@/components/Layout";
import { WorkCard, WorkCardSkeleton } from "@/components/WorkCard";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, SlidersHorizontal, Palette } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const typeOptions = [
  { value: "all", label: "すべて" },
  { value: "image", label: "画像" },
  { value: "video", label: "動画" },
  { value: "audio", label: "音声" },
  { value: "text", label: "テキスト" },
  { value: "web", label: "Webサイト" },
];

const originOptions = [
  { value: "all", label: "すべて" },
  { value: "client", label: "受注作品" },
  { value: "personal", label: "個人作品" },
];

const serviceTierOptions = [
  { value: "all", label: "すべて" },
  { value: "spot", label: "Spot Concept" },
  { value: "standard", label: "Standard Translation" },
  { value: "grand", label: "Grand Story" },
];

const sortOptions = [
  { value: "newest", label: "新着順" },
  { value: "popular", label: "人気順" },
];

export default function Works() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const [type, setType] = useState(params.get("type") || "all");
  const [origin, setOrigin] = useState(params.get("origin") || "all");
  const [serviceTier, setServiceTier] = useState(params.get("tier") || "all");
  const [sortBy, setSortBy] = useState<"newest" | "popular">(
    (params.get("sort") as "newest" | "popular") || "newest"
  );
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [searchInput, setSearchInput] = useState(params.get("q") || "");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedTool, setSelectedTool] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: tagsData } = trpc.tags.list.useQuery();
  const { data: toolsData } = trpc.tools.list.useQuery();

  const queryParams = useMemo(() => ({
    type: type !== "all" ? type as any : undefined,
    origin: origin !== "all" ? origin as any : undefined,
    serviceTier: serviceTier !== "all" ? serviceTier as any : undefined,
    toolId: selectedTool || undefined,
    tagIds: selectedTags.length > 0 ? selectedTags : undefined,
    keyword: keyword || undefined,
    sortBy,
    limit,
    offset: page * limit,
  }), [type, origin, serviceTier, selectedTool, selectedTags, keyword, sortBy, page]);

  const { data, isLoading } = trpc.works.list.useQuery(queryParams);

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(0);
  };

  const clearFilters = () => {
    setType("all");
    setOrigin("all");
    setServiceTier("all");
    setSelectedTags([]);
    setSelectedTool(null);
    setKeyword("");
    setSearchInput("");
    setPage(0);
  };

  const hasActiveFilters = type !== "all" || origin !== "all" || serviceTier !== "all" || 
    selectedTags.length > 0 || selectedTool !== null || keyword !== "";

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Origin Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">作品タイプ</label>
        <Select value={origin} onValueChange={(v) => { setOrigin(v); setPage(0); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {originOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Tier Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">サービス種別</label>
        <Select value={serviceTier} onValueChange={(v) => { setServiceTier(v); setPage(0); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {serviceTierOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tool Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">使用ツール</label>
        <Select 
          value={selectedTool?.toString() || "all"} 
          onValueChange={(v) => { setSelectedTool(v === "all" ? null : parseInt(v)); setPage(0); }}
        >
          <SelectTrigger>
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {toolsData?.map((tool: any) => (
              <SelectItem key={tool.id} value={tool.id.toString()}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      {tagsData && tagsData.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">タグ</label>
          <div className="flex flex-wrap gap-2">
            {tagsData.map((tag: any) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  );
                  setPage(0);
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          フィルターをクリア
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="section">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Works
            </p>
            <h1 className="text-3xl md:text-4xl font-serif text-[#2B3A42] flex items-center justify-center gap-3">
              <Palette className="h-8 w-8 md:h-9 md:w-9 text-gold" />
              作品一覧
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="キーワードで検索..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>検索</Button>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>フィルター</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category Tabs */}
            <Tabs value={type} onValueChange={(v) => { setType(v); setPage(0); }}>
              <TabsList className="w-full justify-start overflow-x-auto">
                {typeOptions.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Sort and Active Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "popular")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {data && (
                  <span className="text-sm text-muted-foreground">
                    {data.total}件の作品
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  クリア
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24 bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  フィルター
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Works Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <WorkCardSkeleton key={i} />)
                  : data?.works.map((work: any) => (
                      <WorkCard key={work.id} work={work} />
                    ))}
              </div>

              {!isLoading && (!data?.works || data.works.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    条件に一致する作品が見つかりませんでした
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      フィルターをクリア
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    前へ
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    次へ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
