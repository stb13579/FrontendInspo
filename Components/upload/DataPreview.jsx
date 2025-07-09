import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DataPreview({ data }) {
  const enrichedCount = data.filter(event => event.is_enriched).length;
  const enrichmentRate = Math.round((enrichedCount / data.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Data Preview</CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {data.length} events
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {enrichmentRate}% enriched
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Enriched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 5).map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.event_type}</TableCell>
                    <TableCell>{event.user_id}</TableCell>
                    <TableCell>{event.country || 'Unknown'}</TableCell>
                    <TableCell>
                      {event.is_enriched ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.length > 5 && (
            <p className="text-sm text-slate-500 mt-4">
              Showing first 5 of {data.length} events
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}