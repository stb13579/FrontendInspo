import React, { useState, useCallback } from "react";
import { DataSource, AmplitudeEvent } from "@/entities/all";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Database, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

import FileUploadZone from "../components/upload/FileUploadZone";
import ProcessingSteps from "../components/upload/ProcessingSteps";
import DataPreview from "../components/upload/DataPreview";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [sourceName, setSourceName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    { title: "Upload File", icon: Upload, description: "Select your Amplitude export file" },
    { title: "Extract Data", icon: FileText, description: "Parse events from your file" },
    { title: "Enrich IPs", icon: Zap, description: "Add location and organization data" },
    { title: "Save to Database", icon: Database, description: "Store enriched events" }
  ];

  const handleFileUpload = async (file) => {
    setError(null);
    setSuccess(false);
    setProcessing(true);
    setProgress(0);
    setCurrentStep(0);

    try {
      // Step 1: Upload file
      setCurrentStep(1);
      setProgress(25);
      const { file_url } = await UploadFile({ file });
      setUploadedFile({ file, file_url });
      setSourceName(file.name.replace(/\.[^/.]+$/, ""));

      // Step 2: Extract data
      setCurrentStep(2);
      setProgress(50);
      const extractResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: AmplitudeEvent.schema()
      });

      if (extractResult.status !== "success") {
        throw new Error(extractResult.details || "Failed to extract data");
      }

      let events = Array.isArray(extractResult.output) ? extractResult.output : [extractResult.output];
      setExtractedData(events);

      // Step 3: Enrich IP addresses
      setCurrentStep(3);
      setProgress(75);
      const enrichedEvents = await enrichIPAddresses(events);

      // Step 4: Save to database
      setCurrentStep(4);
      setProgress(100);
      await saveToDatabase(enrichedEvents, file_url);

      setSuccess(true);
    } catch (err) {
      setError(err.message || "An error occurred during processing");
    } finally {
      setProcessing(false);
    }
  };

  const enrichIPAddresses = async (events) => {
    const enrichedEvents = [];
    
    for (const event of events) {
      if (event.ip_address) {
        try {
          const enrichmentResult = await InvokeLLM({
            prompt: `Enrich this IP address with location and organization data. IP: ${event.ip_address}. 
                     Provide realistic location data based on the IP address pattern.`,
            response_json_schema: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
                region: { type: "string" },
                organization: { type: "string" },
                confidence: { type: "number" }
              }
            }
          });

          enrichedEvents.push({
            ...event,
            country: enrichmentResult.country,
            city: enrichmentResult.city,
            region: enrichmentResult.region,
            organization: enrichmentResult.organization,
            is_enriched: true,
            enrichment_confidence: enrichmentResult.confidence || 0.8
          });
        } catch (enrichError) {
          enrichedEvents.push({
            ...event,
            is_enriched: false,
            enrichment_confidence: 0
          });
        }
      } else {
        enrichedEvents.push({
          ...event,
          is_enriched: false,
          enrichment_confidence: 0
        });
      }
    }
    
    return enrichedEvents;
  };

  const saveToDatabase = async (events, fileUrl) => {
    // Create data source record
    const dataSource = await DataSource.create({
      name: sourceName,
      source_type: "amplitude_export",
      file_url: fileUrl,
      total_events: events.length,
      processed_events: events.length,
      enriched_events: events.filter(e => e.is_enriched).length,
      processing_status: "completed",
      date_range_start: events.length > 0 ? events[0].timestamp : null,
      date_range_end: events.length > 0 ? events[events.length - 1].timestamp : null
    });

    // Save events in batches
    const batchSize = 50;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await AmplitudeEvent.bulkCreate(batch);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setProcessing(false);
    setProgress(0);
    setCurrentStep(0);
    setExtractedData(null);
    setSourceName("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-slate-900">Data Upload</h1>
        <p className="text-lg text-slate-600">
          Upload your Amplitude export files for processing and enrichment
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="glass-effect">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="glass-effect border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Successfully processed {extractedData?.length || 0} events and saved to database!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="glass-effect premium-shadow border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Upload File</CardTitle>
              <p className="text-sm text-slate-500">
                Select your Amplitude export file (CSV or JSON)
              </p>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <FileUploadZone onFileUpload={handleFileUpload} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-semibold text-slate-900">{uploadedFile.file.name}</p>
                      <p className="text-sm text-slate-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sourceName">Source Name</Label>
                    <Input
                      id="sourceName"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Enter a name for this data source"
                    />
                  </div>

                  <Button 
                    onClick={resetUpload} 
                    variant="outline" 
                    className="w-full"
                    disabled={processing}
                  >
                    Upload Different File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {processing && (
            <ProcessingSteps 
              steps={steps} 
              currentStep={currentStep} 
              progress={progress}
            />
          )}
        </div>

        <div className="space-y-6">
          {extractedData && (
            <DataPreview data={extractedData} />
          )}
        </div>
      </div>
    </div>
  );
}