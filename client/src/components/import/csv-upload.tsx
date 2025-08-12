import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
      const response = await apiRequest("POST", "/api/import/csv", {
        csvData,
        tableName
      });
      return await response.json();
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
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop CSV file here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
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
          <label className="text-sm font-medium text-gray-700">
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
          <label className="text-sm font-medium text-gray-700">
            Data Type:
          </label>
          <Select value={tableName} onValueChange={setTableName}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type to import" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tills">Till Summaries (TS)</SelectItem>
              <SelectItem value="operators">Operator Summaries (OS)</SelectItem>
              <SelectItem value="products">Product Summaries (PS)</SelectItem>
              <SelectItem value="accounts">Account Summaries (AC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expected Format Info */}
        {tableName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Expected CSV Format for {tableName}:</h4>
            <code className="text-sm text-blue-800 block">
              {tableName === "tills" && "name,location,status,cashBalance,lastTransaction"}
              {tableName === "operators" && "name,employeeId,role,status,totalSales,transactionCount"}
              {tableName === "products" && "name,category,price,stock,soldToday,revenue"}
              {tableName === "accounts" && "accountName,accountType,balance,transactions,lastActivity"}
            </code>
          </div>
        )}

        {/* Import Results */}
        {importMutation.data && (
          <div className={`border rounded-lg p-4 ${
            importMutation.data.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {importMutation.data.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                importMutation.data.success ? "text-green-900" : "text-red-900"
              }`}>
                {importMutation.data.message}
              </span>
            </div>
            
            {importMutation.data.success && (
              <p className="text-sm text-green-700">
                Successfully imported {importMutation.data.imported} records
              </p>
            )}

            {importMutation.data.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {importMutation.data.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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