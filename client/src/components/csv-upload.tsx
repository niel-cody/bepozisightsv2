import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface CSVUploadProps {
  title?: string;
  description?: string;
  onUploadComplete?: (result: any) => void;
}

export function CSVUpload({ 
  title = "Upload Product Sales Data", 
  description = "Upload a CSV file with your product sales data",
  onUploadComplete 
}: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      // Check if this looks like product sales data
      const hasProductSalesFields = data.some(row => 
        row.Date && row.Venue && row.product_name && row.size && row.catergory
      );

      if (!hasProductSalesFields) {
        toast({
          title: "Invalid CSV format",
          description: "CSV must contain product sales data with Date, Venue, product_name, size, and catergory columns",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/upload/product-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      toast({
        title: "Upload successful",
        description: `Imported ${result.imported} product sales records`,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      onUploadComplete?.(result);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload CSV file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          data-testid="csv-upload-dropzone"
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          
          <Button
            variant="outline"
            className="mt-4"
            disabled={isUploading}
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-browse-files"
          >
            {isUploading ? 'Uploading...' : 'Browse Files'}
          </Button>
          
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file"
          />
        </div>

        {uploadResult && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-green-600 dark:text-green-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Upload Complete
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {uploadResult.message}
                </p>
                {uploadResult.total !== uploadResult.imported && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {uploadResult.total - uploadResult.imported} records were skipped due to missing data
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Expected CSV format:</p>
          <p>Date, Venue, product_name, size, catergory, reporting_group, qty_sold, nett_sales, ...</p>
        </div>
      </CardContent>
    </Card>
  );
}