import { useState } from "react";
import { Layout } from "../components/Layout";
import { FileJson, ListTree, ChevronRight } from "lucide-react";
import { JSONTree } from "react-json-tree";

// Mock Parsed EDI Data
const mockEdiData = {
  ISA: {
    AuthorizationInformationQualifier: "00",
    AuthorizationInformation: "          ",
    SecurityInformationQualifier: "00",
    SecurityInformation: "          ",
    InterchangeIdQualifier1: "ZZ",
    InterchangeSenderId: "SENDER1        ",
    InterchangeIdQualifier2: "ZZ",
    InterchangeReceiverId: "RECEIVER1      ",
    InterchangeDate: "230815",
    InterchangeTime: "1430",
    InterchangeControlStandards: "U",
    InterchangeControlVersion: "00501",
    InterchangeControlNumber: "000000001",
    AcknowledgmentRequested: "0",
    UsageIndicator: "T",
    ComponentElementSeparator: ":",
  },
  GS: {
    FunctionalIdentifierCode: "HC",
    ApplicationSenderCode: "SENDER1",
    ApplicationReceiverCode: "RECEIVER1",
    Date: "20230815",
    Time: "1430",
    GroupControlNumber: "1",
    ResponsibleAgencyCode: "X",
    VersionReleaseIndustryIdentifierCode: "005010X222A1",
  },
  ST: {
    TransactionSetIdentifierCode: "837",
    TransactionSetControlNumber: "0001",
    ImplementationConventionReference: "005010X222A1",
  },
  Loop_1000A: {
    NM1: {
      EntityIdentifierCode: "41",
      EntityTypeQualifier: "2",
      NameLastOrOrganizationName: "WOUND CARE SPECIALISTS",
      IdentificationCodeQualifier: "46",
      IdentificationCode: "V39X2",
    },
    PER: {
      ContactFunctionCode: "IC",
      Name: "JANE DOE",
      CommunicationNumberQualifier1: "TE",
      CommunicationNumber1: "5555551212",
    },
  },
  Loop_2000A: {
    HL: {
      HierarchicalIdNumber: "1",
      HierarchicalParentIdNumber: "",
      HierarchicalLevelCode: "20",
      HierarchicalChildCode: "1",
    },
    PRV: {
      ProviderCode: "BI",
      ReferenceIdentificationQualifier: "PXC",
      ReferenceIdentification: "207Q00000X",
    },
  },
  Loop_2300: {
    CLM: {
      ClaimSubmitterIdentifier: "1234567",
      TotalClaimChargeAmount: "250.00",
      ClaimFilingIndicatorCode: "",
      NonInstitutionalClaimTypeCode: "",
      FacilityCodeValue: "11",
      ClaimFrequencyTypeCode: "1",
      ProviderSignatureOnFile: "Y",
      MedicareAssignmentCode: "A",
      AssignmentOfBenefitsIndicator: "Y",
      ReleaseOfInformationCode: "I",
      PatientSignatureSourceCode: "P",
    },
    HI: {
      PrincipalDiagnosis: {
        DiagnosisCode: "ABK",
        DiagnosisCodeValue: "E11.9",
      },
    },
  },
  Loop_2400: {
    Service_Line_1: {
      LX: {
        AssignedNumber: "1",
      },
      SV1: {
        ProductLocationQualifier: "HC",
        ProductLocationCode: "99213",
        LineItemChargeAmount: "125.00",
        MeasurementUnitQualifier: "UN",
        ServiceUnitCount: "1",
        PlaceOfServiceCode: "11",
      },
      DTP: {
        DateTimeQualifier: "472",
        DateTimePeriodFormatQualifier: "D8",
        DateTimePeriod: "20230815",
      },
    },
  },
};

const theme = {
  scheme: "claimlens",
  author: "claimlens",
  base00: "transparent",
  base01: "#1e293b",
  base02: "#334155",
  base03: "#475569",
  base04: "#64748b",
  base05: "#94a3b8",
  base06: "#cbd5e1",
  base07: "#f1f5f9",
  base08: "#f87171",
  base09: "#fb923c",
  base0A: "#fbbf24",
  base0B: "#4ade80",
  base0C: "#2dd4bf",
  base0D: "#60a5fa",
  base0E: "#a78bfa",
  base0F: "#f472b6",
};

export function FileExplorer() {
  const [activeTab, setActiveTab] = useState<"tree" | "json">("tree");
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

  const renderSegmentItem = (name: string, content: any, isRoot = false) => {
    return (
      <div
        key={name}
        className={`ml-4 ${isRoot ? "ml-0" : "border-l border-gray-300 dark:border-slate-700 pl-4 py-1"}`}
      >
        <button
          onClick={() => setSelectedSegment({ name, content })}
          className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 group w-full text-left"
        >
          {typeof content === "object" ? (
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-500 group-hover:text-blue-600 dark:text-blue-400" />
          ) : (
            <span className="w-4 h-4" />
          )}
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{name}</span>
          {typeof content !== "object" && (
            <span className="text-slate-600 dark:text-slate-500 truncate text-xs ml-2">
              - {String(content)}
            </span>
          )}
        </button>

        {typeof content === "object" &&
          Object.keys(content).map((k) => renderSegmentItem(k, content[k]))}
      </div>
    );
  };

  return (
    <Layout
      title="File Explorer"
      icon={<FileJson className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full h-[calc(100vh-12rem)] flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Parsed Structure Viewer
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Explore the detailed hierarchical segment tree of your X12
              transaction.
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("tree")}
              className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${activeTab === "tree" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100"}`}
            >
              <ListTree className="w-4 h-4" /> Visual Tree
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition ${activeTab === "json" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100"}`}
            >
              <FileJson className="w-4 h-4" /> Raw JSON
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-2xl flex overflow-hidden shadow-sm dark:shadow-none">
          {activeTab === "tree" ? (
            <>
              {/* Left Tree Pane */}
              <div className="w-1/2 md:w-1/3 border-r border-gray-200 dark:border-gray-300 dark:border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-600 dark:text-slate-500 mb-4 font-bold">
                  Document Hierarchy
                </h3>
                <div className="space-y-1">
                  {Object.keys(mockEdiData).map((k) =>
                    renderSegmentItem(k, (mockEdiData as any)[k], true),
                  )}
                </div>
              </div>

              {/* Right Detail Pane */}
              <div className="w-1/2 md:w-2/3 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar relative">
                {selectedSegment ? (
                  <div>
                    <h3 className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2 border-b border-gray-200 dark:border-gray-300 dark:border-slate-700 pb-4">
                      {selectedSegment.name} Segment Detail
                    </h3>

                    {typeof selectedSegment.content === "object" ? (
                      <div className="mt-6 space-y-4">
                        {Object.entries(selectedSegment.content).map(
                          ([key, val]) => (
                            <div
                              key={key}
                              className="bg-slate-900 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center hover:border-blue-900/50 transition"
                            >
                              <span className="font-mono text-slate-600 dark:text-slate-400 text-sm">
                                {key}
                              </span>
                              <span className="font-mono font-medium text-slate-900 dark:text-slate-100 max-w-[50%] text-right">
                                {String(val)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="mt-8 text-center text-slate-600 dark:text-slate-400 bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-gray-300 dark:border-slate-700">
                        <span className="block text-4xl font-mono text-slate-900 dark:text-slate-100 mb-2">
                          {selectedSegment.content}
                        </span>
                        <span className="text-sm">Value</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 dark:text-slate-500 h-full">
                    <ListTree className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">
                      Select a segment or property from the tree
                    </p>
                    <p className="text-sm mt-1">
                      to view its parsed semantic data
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
              <JSONTree
                data={mockEdiData}
                theme={theme}
                invertTheme={false}
                hideRoot
                shouldExpandNodeInitially={() => true}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
