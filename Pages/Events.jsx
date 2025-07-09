
import React, { useState, useEffect } from "react";
import { AmplitudeEvent } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import EventDetail from "../components/events/EventDetail";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [enrichmentFilter, setEnrichmentFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedEventType, selectedCountry, enrichmentFilter]);

  const loadEvents = async () => {
    try {
      const eventsData = await AmplitudeEvent.list("-timestamp", 500);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEventType !== "all") {
      filtered = filtered.filter(event => event.event_type === selectedEventType);
    }

    if (selectedCountry !== "all") {
      filtered = filtered.filter(event => event.country === selectedCountry);
    }

    if (enrichmentFilter !== "all") {
      filtered = filtered.filter(event => 
        enrichmentFilter === "enriched" ? event.is_enriched : !event.is_enriched
      );
    }

    setFilteredEvents(filtered);
  };

  const getUniqueEventTypes = () => {
    return [...new Set(events.map(e => e.event_type).filter(Boolean))];
  };

  const getUniqueCountries = () => {
    return [...new Set(events.map(e => e.country).filter(Boolean))];
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEventType("all");
    setSelectedCountry("all");
    setEnrichmentFilter("all");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="glass-effect">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-slate-900">Event Explorer</h1>
        <p className="text-lg text-slate-600">
          Browse and analyze your Amplitude events
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {getUniqueEventTypes().map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {getUniqueCountries().map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={enrichmentFilter} onValueChange={setEnrichmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Enrichment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="enriched">Enriched Only</SelectItem>
                <SelectItem value="not_enriched">Not Enriched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredEvents.length} events
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {filteredEvents.filter(e => e.is_enriched).length} enriched
              </Badge>
            </div>
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="glass-effect premium-shadow border-0">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow 
                    key={event.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <TableCell className="font-medium">{event.event_type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{event.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">
                          {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.country ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{event.city}, {event.country}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.organization ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{event.organization}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.is_enriched ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enriched
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Raw
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <EventDetail 
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
