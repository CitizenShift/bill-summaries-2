"use client"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DataTableProps {
    rows: any;
}

export function DataTable({ rows } : DataTableProps) {
    const router = useRouter();

    const handleViewClick = (session_id: string) => {
        router.push(`/sessions/${session_id}`);
    }

    return (
        <Table>
            <TableCaption>A list of recent legislative sessions</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Session ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Name</TableHead>
                    <TableHead className="text-right">View Session Bills</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row: any) => (
                    <TableRow key={row?.session_id}>
                        <TableCell className="font-medium">{row?.session_id}</TableCell>
                        <TableCell>{row?.state_abbr}</TableCell>
                        <TableCell>{row?.session_tag}</TableCell>
                        <TableCell className="text-right">{row?.name}</TableCell>
                        <TableCell className="text-right">
                            <Button size="icon-sm" aria-label="Submit" variant="outline" onClick={() => handleViewClick(row?.session_id)}>
                                <ArrowRight />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
