"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BookmarkIcon, FolderIcon, PlusIcon, Grid3x3Icon, ListIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useApiService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { LEGISCAN_STATUS_LABELS } from "@/app/utils/constants/constants";
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

type Bill = {
    id: string
    number: string
    title: string
    sponsor: string
    status: string
    category: string
    summary: string
    savedDate: string
    albums: string[]
}

type Album = {
    id: string
    name: string
    description: string
    color: string
    billCount: number
    createdAt: string
}

export default function SavedBillsPage() {
    const apiService = useApiService()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<"bills" | "albums">("bills")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
    const [showAlbumFilter, setShowAlbumFilter] = useState(false)

    const [albums] = useState<Album[]>(initialAlbums)

    const fetchSavedBills = async () => {
        try {
            const response: any = await apiService.get('/api/saved_bills');
            return response?.savedBills;
        } catch (error) {
            console.log(error)
        }
    }

    const { data: saved, isLoading } = useQuery({
        queryKey: ["savedBills"],
        queryFn: fetchSavedBills,
        enabled: !!user?.id,
    });

    const savedBills = useMemo(() => {
        const initialBills = Array.isArray(saved) ? saved : [];
        const mappedBills = initialBills?.map((bill: any) => (
            {
                id: bill?.bill_id,
                number: bill?.bill_number,
                title: bill?.title,
                sponsor: bill?.sponsors?.[0]?.name ?? "Unknown",
                status: LEGISCAN_STATUS_LABELS[bill.status] ?? "Unknown",
                category: bill?.subjects?.[0]?.subject_name ?? "Unknown",
                summary: bill?.description,
                savedDate: bill?.savedDate ?? "2025-01-01",
                albums: [],
            }
        ));
        return mappedBills;
    }, [saved]);

    const filteredBills = useMemo(() => {
        return savedBills?.filter((bill: any) => {
            const matchesSearch =
                bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bill.number.toLowerCase().includes(searchQuery.toLowerCase())
            // const matchesAlbum = selectedAlbum ? bill.albums.includes(selectedAlbum) : true
            return matchesSearch
        });
    }, [searchQuery, savedBills]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 md:max-w-md">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search saved bills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                    disabled
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-lg border">
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("grid")}
                                        className="rounded-r-none"
                                        disabled
                                    >
                                        <Grid3x3Icon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("list")}
                                        className="rounded-l-none"
                                        disabled
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner className="h-8 w-8 text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Loading saved bills...</p>
                        </div>

                        {/* Skeleton loaders */}
                        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "space-y-4"}>
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="transition-shadow">
                                    <CardHeader>
                                        <div className="flex gap-2 mb-2">
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {/*<div className="mb-6">*/}
                {/*    <div className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">*/}
                {/*        <button*/}
                {/*            onClick={() => setActiveTab("bills")}*/}
                {/*            className={`inline-flex h-full items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${*/}
                {/*                activeTab === "bills"*/}
                {/*                    ? "bg-background text-foreground shadow-sm"*/}
                {/*                    : "text-foreground hover:bg-background/50"*/}
                {/*            }`}*/}
                {/*        >*/}
                {/*            <BookmarkIcon className="h-4 w-4" />*/}
                {/*            Saved Bills*/}
                {/*        </button>*/}
                {/*        <button*/}
                {/*            onClick={() => setActiveTab("albums")}*/}
                {/*            className={`inline-flex h-full items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${*/}
                {/*                activeTab === "albums"*/}
                {/*                    ? "bg-background text-foreground shadow-sm"*/}
                {/*                    : "text-foreground hover:bg-background/50"*/}
                {/*            }`}*/}
                {/*        >*/}
                {/*            <FolderIcon className="h-4 w-4" />*/}
                {/*            Albums*/}
                {/*        </button>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Bills Tab Content */}
                {activeTab === "bills" && (
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 md:max-w-md">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search saved bills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {/*<div className="relative">*/}
                                {/*    <Button*/}
                                {/*        variant="outline"*/}
                                {/*        className="gap-2 bg-transparent"*/}
                                {/*        onClick={() => setShowAlbumFilter(!showAlbumFilter)}*/}
                                {/*    >*/}
                                {/*        <FolderIcon className="h-4 w-4" />*/}
                                {/*        {selectedAlbum ? albums.find((a) => a.id === selectedAlbum)?.name : "All Albums"}*/}
                                {/*    </Button>*/}
                                {/*    {showAlbumFilter && (*/}
                                {/*        <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-md border bg-popover p-1 shadow-md">*/}
                                {/*            <button*/}
                                {/*                onClick={() => {*/}
                                {/*                    setSelectedAlbum(null)*/}
                                {/*                    setShowAlbumFilter(false)*/}
                                {/*                }}*/}
                                {/*                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"*/}
                                {/*            >*/}
                                {/*                All Albums*/}
                                {/*            </button>*/}
                                {/*            {albums.map((album) => (*/}
                                {/*                <button*/}
                                {/*                    key={album.id}*/}
                                {/*                    onClick={() => {*/}
                                {/*                        setSelectedAlbum(album.id)*/}
                                {/*                        setShowAlbumFilter(false)*/}
                                {/*                    }}*/}
                                {/*                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"*/}
                                {/*                >*/}
                                {/*                    {album.name}*/}
                                {/*                </button>*/}
                                {/*            ))}*/}
                                {/*        </div>*/}
                                {/*    )}*/}
                                {/*</div>*/}
                                <div className="flex rounded-lg border">
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("grid")}
                                        className="rounded-r-none"
                                    >
                                        <Grid3x3Icon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon"
                                        onClick={() => setViewMode("list")}
                                        className="rounded-l-none"
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Bills Grid/List */}
                        {filteredBills.length === 0 ? (
                            <Card className="py-12">
                                <CardContent className="flex flex-col items-center gap-2 text-center">
                                    <BookmarkIcon className="h-12 w-12 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold">No saved bills</h3>
                                    <p className="text-sm text-muted-foreground">Bills you save from the feed will appear here</p>
                                    <Link href="/">
                                        <Button className="mt-4">Go to Feed</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "space-y-4"}>
                                {filteredBills.map((bill) => (
                                    <Card key={bill.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline">{bill.number}</Badge>
                                                        <Badge variant="secondary">{bill.status}</Badge>
                                                        <Badge variant="outline">{bill.category}</Badge>
                                                    </div>
                                                    <CardTitle className="mb-2 text-lg">{bill.title}</CardTitle>
                                                    <CardDescription>{bill.sponsor}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{bill.summary}</p>
                                            {bill.albums.length > 0 && (
                                                <div className="mb-3 flex flex-wrap gap-2">
                                                    {bill.albums.map((albumId) => {
                                                        const album = albums.find((a) => a.id === albumId)
                                                        return album ? (
                                                            <Badge key={albumId} variant="secondary" className="gap-1">
                                                                <FolderIcon className="h-3 w-3" />
                                                                {album.name}
                                                            </Badge>
                                                        ) : null
                                                    })}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                Saved {new Date(bill.savedDate).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Albums Tab Content */}
                {activeTab === "albums" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">My Albums</h3>
                                <p className="text-sm text-muted-foreground">Organize your saved bills into collections</p>
                            </div>
                            <Button className="gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Create Album
                            </Button>
                        </div>

                        {/* Albums Grid */}
                        <div className="grid gap-6 md:grid-cols-3">
                            {albums.map((album) => (
                                <Card key={album.id} className="transition-shadow hover:shadow-md">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: album.color + "20" }}
                                            >
                                                <FolderIcon className="h-6 w-6" style={{ color: album.color }} />
                                            </div>
                                        </div>
                                        <CardTitle className="mt-4">{album.name}</CardTitle>
                                        <CardDescription>{album.description || "No description"}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{album.billCount} bills</span>
                                            <Button variant="link" className="h-auto p-0">
                                                View →
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

// Mock initial data
const initialAlbums: Album[] = [
    {
        id: "1",
        name: "Healthcare Policy",
        description: "Bills related to healthcare reform and access",
        color: "hsl(210, 70%, 50%)",
        billCount: 3,
        createdAt: "2024-01-10",
    },
    {
        id: "2",
        name: "Environmental Action",
        description: "Climate and environmental legislation",
        color: "hsl(142, 70%, 45%)",
        billCount: 2,
        createdAt: "2024-01-12",
    },
    {
        id: "3",
        name: "Priority Tracking",
        description: "High priority bills to monitor",
        color: "hsl(25, 70%, 50%)",
        billCount: 4,
        createdAt: "2024-01-08",
    },
]

const initialSavedBills: Bill[] = [
    {
        id: "1",
        number: "H.R. 2847",
        title: "Clean Energy Innovation Act",
        sponsor: "Rep. Johnson (D-CA)",
        status: "In Committee",
        category: "Environment",
        summary:
            "A bill to establish a national clean energy innovation program and provide incentives for renewable energy development.",
        savedDate: "2024-01-20",
        albums: ["2", "3"],
    },
    {
        id: "2",
        number: "S. 1523",
        title: "Healthcare Access Expansion Act",
        sponsor: "Sen. Martinez (D-NY)",
        status: "Passed Senate",
        category: "Healthcare",
        summary: "Legislation to expand healthcare coverage and reduce prescription drug costs for Americans.",
        savedDate: "2024-01-21",
        albums: ["1", "3"],
    },
    {
        id: "3",
        number: "H.R. 3891",
        title: "Education Funding Reform Bill",
        sponsor: "Rep. Williams (R-TX)",
        status: "In Committee",
        category: "Education",
        summary: "Reforms federal education funding formulas and increases support for rural school districts.",
        savedDate: "2024-01-19",
        albums: [],
    },
]