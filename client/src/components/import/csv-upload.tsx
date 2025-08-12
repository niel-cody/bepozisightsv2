import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}

export default function CSVUpload() {
  const [csvData, setCsvData] = useState("");
  const [tableName, setTableName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const importMutation = useMutation<ImportResult, Error, { csvData: string; tableName: string }>({
    mutationFn: async ({ csvData, tableName }) => {
      const response = await apiRequest("/api/import/csv", "POST", {
        csvData,
        tableName
      });
      return response;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message,
        });
        setCsvData("");
        setTableName("");
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: result.message,
        });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import CSV data. Please try again.",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setCsvData(text);
        };
        reader.readAsText(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload a CSV file.",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvData.trim() || !tableName) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "Please provide CSV data and select a table type.",
      });
      return;
    }

    importMutation.mutate({ csvData: csvData.trim(), tableName });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import CSV Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
            dragActive
              ? "border-ring bg-accent/20"
              : "border-border hover:bg-accent/10"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            Drop CSV file here or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports TS, OS, PS, and AC data files
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-file-input"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("csv-file-input")?.click()}
          >
            Browse Files
          </Button>
        </div>

        {/* Manual CSV Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Or paste CSV data manually:
          </label>
          <Textarea
            placeholder="name,location,status,cashBalance&#10;Till 1,Front Counter,active,1250.75&#10;Till 2,Drive Through,active,892.50&#10;&#10;Or paste your TS, OS, PS, or AC file content here..."
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        {/* Table Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Data Type:
          </label>
          <Select value={tableName} onValueChange={setTableName}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type to import" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tills">Till Summaries (TS) - Daily Sales Data</SelectItem>
              <SelectItem value="operators">Operator Summaries (OS)</SelectItem>
              <SelectItem value="products">Product Summaries (PS)</SelectItem>
              <SelectItem value="customers">Customer Summaries (CS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expected Format Info */}
        {tableName && (
          <div className="bg-accent/10 border rounded-md p-4">
            <h4 className="font-medium text-foreground mb-2">Expected CSV Format for {tableName}:</h4>
            <code className="text-sm text-foreground/80 block">
              {tableName === "tills" && "TimeSpan,Name,Qty Transactions,Gross Sales,NettTotal,Profit%,Cost of Sales..."}
              {tableName === "operators" && "TimeSpan,Name,Qty Transactions,Gross Sales,NettTotal,Profit%..."}
              {tableName === "products" && "name,category,price,stock,soldToday,revenue"}
              {tableName === "customers" && "TimeSpan,Account ID,Account Name,Balance Start,Balance End,Points Start,Points End,Payments,Charges,Payments Minus Charges,NettTurnover,GrossTurnover,Turnover Discount,Visits,Title,First Name,Last Name,Status"}
            </code>
          </div>
        )}

        {/* Import Results */}
        {importMutation.data && (
          <Alert variant={importMutation.data.success ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {importMutation.data.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <div>
                <AlertTitle>{importMutation.data.success ? "Import Successful" : "Import Failed"}</AlertTitle>
                <AlertDescription>
                  {importMutation.data.message}
                  {importMutation.data.success && (
                    <span className="block mt-1">Successfully imported {importMutation.data.imported} records</span>
                  )}
                  {importMutation.data.errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {importMutation.data.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!csvData.trim() || !tableName || importMutation.isPending}
          className="w-full"
          data-testid="button-import-csv"
        >
          {importMutation.isPending ? "Importing..." : "Import CSV Data"}
        </Button>
      </CardContent>
    </Card>
  );
}