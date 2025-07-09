import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Globe, 
  User, 
  Clock, 
  Hash, 
  Building,
  Monitor,
  Smartphone
} from 'lucide-react';

const DetailItem = ({ icon: Icon, label, value, children }) => {
  if (!value && !children) return null;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100">
      <div className="flex-shrink-0 w-8 text-slate-500 flex justify-center pt-1">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="text-base font-semibold text-slate-800 mt-1">
          {children || value}
        </div>
      </div>
    </div>
  );
};

const JsonViewer = ({ data }) => (
  <pre className="bg-slate-50 p-4 rounded-lg text-xs text-slate-700 overflow-x-auto">
    {JSON.stringify(data, null, 2)}
  </pre>
);

export default function EventDetail({ event, open, onClose }) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass-effect p-0">
        <DialogHeader className="p-6 border-b border-slate-200">
          <DialogTitle className="text-2xl font-bold text-slate-900">Event Details</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Details for event ID: <Badge variant="secondary">{event.event_id}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            <DetailItem icon={Hash} label="Event Type">
              <Badge className="text-base">{event.event_type}</Badge>
            </DetailItem>
            
            <DetailItem icon={Clock} label="Timestamp" value={format(new Date(event.timestamp), "MMM d, yyyy 'at' HH:mm:ss")} />
            
            <DetailItem icon={User} label="User / Device ID">
              <p>{event.user_id}</p>
              <p className="text-sm text-slate-500 font-normal">{event.device_id}</p>
            </DetailItem>
            
            <DetailItem icon={Globe} label="Location">
              <p>{event.city}, {event.region}, {event.country}</p>
            </DetailItem>

            <DetailItem icon={Building} label="Organization" value={event.organization} />

            <DetailItem icon={event.is_enriched ? CheckCircle : XCircle} label="Enrichment Status">
              <Badge variant={event.is_enriched ? "default" : "destructive"} className={event.is_enriched ? "bg-green-100 text-green-800" : ""}>
                {event.is_enriched ? 'Enriched' : 'Not Enriched'}
              </Badge>
              {event.is_enriched && (
                <p className="text-sm text-slate-500 font-normal mt-1">
                  Confidence: {Math.round(event.enrichment_confidence * 100)}%
                </p>
              )}
            </DetailItem>

            <div className="md:col-span-2">
                <DetailItem icon={Monitor} label="User Agent">
                  <p className="text-sm font-normal text-slate-600">{event.user_agent}</p>
                </DetailItem>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 my-4">Event Properties</h3>
              <JsonViewer data={event.event_properties} />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 my-4">User Properties</h3>
              <JsonViewer data={event.user_properties} />
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}