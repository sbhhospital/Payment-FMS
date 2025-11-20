"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Image } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ApprovalRequest {
  id: string
  apPaymentNo: string
  status: string
  uniqueNo: string
  fmsName: string
  payTo: string
  amount: number
  attachment?: string
  remarks: string
  rowNumber: number
}

export function PaymentApprovalPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"approve" | "reject">("approve");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<ApprovalRequest[]>([]);

// In the updateApprovalData function, update the date format:
const updateApprovalData = async (data: {
  rowNumber: number;
  uniqueNo: string;
  status: "Approved" | "Rejected";
  approvedAmount: number;
  remarks: string;
}) => {
  try {
    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec";

    // Get current date and time
    const now = new Date();

    // Format that Google Sheets will parse as Date object: "MM/DD/YYYY HH:MM:SS"
    const formatDateForSheets = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const dateTimeString = formatDateForSheets(now);

    console.log("Updating approval data in specific columns:", {
      rowNumber: data.rowNumber,
      uniqueNo: data.uniqueNo,
      status: data.status,
      approvedAmount: data.approvedAmount,
      remarks: data.remarks,
      actualValue: dateTimeString, // For Column K
      plannedValue: dateTimeString, // For Column P
    });

    // Use the writeData action to update the row with only specific columns changed
    const updateParams = new URLSearchParams({
      action: "writeData",
      sheetName: "FMS",
      rowNumber: data.rowNumber.toString(),
      status: data.status,
      approvedAmount: data.approvedAmount.toString(),
      remarks: data.remarks,
      actualValue: dateTimeString,
      plannedValue: dateTimeString,
      callback: "?",
    });

    const updateUrl = `${scriptUrl}?${updateParams.toString()}`;
    console.log("Update URL:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "GET",
    });

    const text = await response.text();
    console.log("Raw update response:", text);

    // Handle JSONP response
    let result;
    try {
      const jsonpData = text.replace(/^\?\(|\)$/g, "");
      result = JSON.parse(jsonpData);
      console.log("Parsed update response:", result);
    } catch (e) {
      console.error("Failed to parse response:", e);
      result = { success: false, error: "Failed to parse response" };
    }

    return result;
  } catch (error) {
    console.error("Error updating approval data:", error);
    return { success: false, error: error.toString() };
  }
};

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        const scriptUrl =
          "https://script.google.com/macros/s/AKfycbxZIATrD8Qbs391MSb_exL9WNMujt_O0s8doomzmGH5hnewnlJkk2mF2QXmzde5WHyT/exec";

        const response = await fetch(
          `${scriptUrl}?action=fetchSheet&sheetName=FMS&callback=?`
        );
        const text = await response.text();

        // Handle JSONP response
        const jsonpData = text.replace(/^\?\(|\)$/g, "");
        const result = JSON.parse(jsonpData);

        if (result.success && result.data) {
          // Process the sheet data starting from row 7 (index 6)
          const sheetData = result.data.slice(6); // Skip first 6 rows (0-5), start from row 7 (index 6)

          const processedPendingData: ApprovalRequest[] = [];
          const processedHistoryData: ApprovalRequest[] = [];

          sheetData.forEach((row: any[], index: number) => {
            if (row[2] && row[2].trim() !== "") {
              // Filter out empty rows
              const request: ApprovalRequest = {
                id: `row-${index + 7}`,
                rowNumber: index + 7, // Actual row number in the sheet
                apPaymentNo: row[1] || "",
                status: row[12] || "Pending", // Column M (index 12) - Changed from row[2] to row[12]
                uniqueNo: row[3] || "", // Column D (index 3)
                fmsName: row[4] || "", // Column E (index 4)
                payTo: row[5] || "", // Column F (index 5)
                amount: parseFloat(row[6]) || 0, // Column G (index 6)
                remarks: row[7] || "", // Column H (index 7)
                attachment: row[8] || "", // Column I (index 8)
              };

              if (
                request.status.toLowerCase() === "pending" &&
                request.uniqueNo &&
                request.fmsName
              ) {
                processedPendingData.push(request);
              } else if (request.status.toLowerCase() !== "pending") {
                processedHistoryData.push(request);
              }
            }
          });

          setPendingRequests(processedPendingData);
          setHistoryRequests(processedHistoryData);
        } else {
          console.error("Failed to fetch data:", result.error);
        }
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const handleProcess = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setApprovedAmount(request.amount); // Set initial approved amount to the original amount
    setShowModal(true);
  };

  const handleSubmitApproval = async () => {
  if (!selectedRequest) return;

  try {
    setIsSubmitting(true); // Start submitting
    
    const result = await updateApprovalData({
      rowNumber: selectedRequest.rowNumber,
      uniqueNo: selectedRequest.uniqueNo,
      status: approvalStatus === "approve" ? "Approved" : "Rejected",
      approvedAmount: approvedAmount,
      remarks: approvalRemarks,
    });

    console.log("Submission result:", result);

    if (result.success) {
      // Update local state
      const updatedRequest: ApprovalRequest = {
        ...selectedRequest,
        status: approvalStatus === "approve" ? "Approved" : "Rejected",
        amount: approvedAmount,
        remarks: approvalRemarks,
      };

      setPendingRequests(
        pendingRequests.filter((r) => r.id !== selectedRequest.id)
      );
      setHistoryRequests([updatedRequest, ...historyRequests]);

      setShowModal(false);
      setSelectedRequest(null);
      setApprovalRemarks("");
      setApprovalStatus("approve");
      setApprovedAmount(0);

      // Show success message
      alert(`Approval submitted successfully! Row: ${selectedRequest.rowNumber}`);
    } else {
      console.error("Failed to update sheet:", result.error);
      alert(
        `Failed to submit approval: ${
          result.error || "Unknown error"
        }. Please try again.`
      );
    }
  } catch (error) {
    console.error("Error submitting approval:", error);
    alert("Error submitting approval. Please try again.");
  } finally {
    setIsSubmitting(false); // Stop submitting regardless of outcome
  }
};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Payment Approval</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          History ({historyRequests.length})
        </button>
      </div>

      {activeTab === "pending" && (
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading payment requests...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Payment No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Unique No
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      FMS Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Pay To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Attachment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <tr
                        key={req.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {req.apPaymentNo}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {req.uniqueNo}
                        </td>
                        <td className="px-6 py-4 text-sm">{req.fmsName}</td>
                        <td className="px-6 py-4 text-sm">{req.payTo}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          ₹{req.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.attachment ? (
                            <a
                              href={req.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Image size={20} />
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            onClick={() => handleProcess(req)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No pending payment requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Payment No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Unique No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    FMS Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Pay To
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Attachment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyRequests.length > 0 ? (
                  historyRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            req.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {req.apPaymentNo}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {req.uniqueNo}
                      </td>
                      <td className="px-6 py-4 text-sm">{req.fmsName}</td>
                      <td className="px-6 py-4 text-sm">{req.payTo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ₹{req.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                          {req.attachment ? (
                            <a
                              href={req.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Image size={20} />
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      <td className="px-6 py-4 text-sm">
                        {req.remarks || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No approval history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Process Payment Approval - {selectedRequest.uniqueNo}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <Select
                    value={approvalStatus}
                    onValueChange={(value: "approve" | "reject") =>
                      setApprovalStatus(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Approved Amount
                  </label>
                  <Input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) =>
                      setApprovedAmount(parseFloat(e.target.value) || 0)
                    }
                    className="bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Remarks
                  </label>
                  <Textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Enter approval remarks"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitApproval}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                      setApprovalRemarks("");
                      setApprovalStatus("approve");
                      setApprovedAmount(0);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}