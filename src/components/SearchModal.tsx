import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchResult {
    id: string;
    title: string;
    image_url: string;
    type: "design" | "product";
}

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
}

export const SearchModal = ({ open, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
        if (!open) {
            setQuery("");
            setResults([]);
        }
    }, [open]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch(query.trim());
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setLoading(true);
        try {
            const { data: designs, error } = await supabase
                .from("designs")
                .select("id, title, image_url")
                .ilike("title", `%${searchQuery}%`)
                .limit(10);

            if (error) throw error;

            const searchResults: SearchResult[] = (designs || []).map((d) => ({
                id: d.id,
                title: d.title,
                image_url: d.image_url,
                type: "design" as const,
            }));

            setResults(searchResults);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(`/designs/${result.id}`);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="fixed top-0 left-0 right-0 bg-background border-b shadow-lg z-[101]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="container px-4 py-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Input
                            ref={inputRef}
                            placeholder="Search designs..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-lg border-0 shadow-none focus-visible:ring-0 px-0"
                        />
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {loading && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Searching...
                        </p>
                    )}

                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No results found for "{query}"
                        </p>
                    )}

                    {results.length > 0 && (
                        <div className="max-h-[60vh] overflow-y-auto">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Designs ({results.length})
                            </p>
                            <div className="space-y-1">
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={result.image_url}
                                                alt={result.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {result.type}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {query.trim().length < 2 && results.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Type at least 2 characters to search
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
