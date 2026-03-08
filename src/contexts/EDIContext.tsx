import { createContext, useContext, useState, ReactNode } from "react";
import { ParsedEDI } from "../lib/x12Parser";
import { ValidationIssue } from "../lib/validator";

export interface BatchFile {
  name: string;
  parsed: ParsedEDI;
  issues: ValidationIssue[];
}

interface EDIContextType {
  parsedFile: ParsedEDI | null;
  validationResults: ValidationIssue[];
  batchFiles: BatchFile[];
  activeFileIndex: number;
  selectedSegmentIndex: number | null;
  setParsedData: (parsed: ParsedEDI, issues: ValidationIssue[]) => void;
  setBatchData: (files: BatchFile[]) => void;
  setActiveFile: (index: number) => void;
  setSelectedSegmentIndex: (index: number | null) => void;
  clearData: () => void;
}

const EDIContext = createContext<EDIContextType>({
  parsedFile: null,
  validationResults: [],
  batchFiles: [],
  activeFileIndex: 0,
  selectedSegmentIndex: null,
  setParsedData: () => {},
  setBatchData: () => {},
  setActiveFile: () => {},
  setSelectedSegmentIndex: () => {},
  clearData: () => {},
});

export function EDIProvider({ children }: { children: ReactNode }) {
  const [parsedFile, setParsedFile] = useState<ParsedEDI | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationIssue[]>([]);
  const [batchFiles, setBatchFilesState] = useState<BatchFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);

  const setParsedData = (parsed: ParsedEDI, issues: ValidationIssue[]) => {
    setParsedFile(parsed);
    setValidationResults(issues);
    setSelectedSegmentIndex(null);
  };

  const setBatchData = (files: BatchFile[]) => {
    setBatchFilesState(files);
    if (files.length > 0) {
      setParsedFile(files[0].parsed);
      setValidationResults(files[0].issues);
      setActiveFileIndex(0);
    }
  };

  const setActiveFile = (index: number) => {
    if (batchFiles[index]) {
      setActiveFileIndex(index);
      setParsedFile(batchFiles[index].parsed);
      setValidationResults(batchFiles[index].issues);
    }
  };

  const clearData = () => {
    setParsedFile(null);
    setValidationResults([]);
    setBatchFilesState([]);
    setActiveFileIndex(0);
    setSelectedSegmentIndex(null);
  };

  return (
      <EDIContext.Provider
        value={{
          parsedFile,
          validationResults,
          batchFiles,
          activeFileIndex,
          selectedSegmentIndex,
          setParsedData,
          setBatchData,
          setActiveFile,
          setSelectedSegmentIndex,
          clearData,
        }}
      >
        {children}
      </EDIContext.Provider>
  );
}

export function useEDI() {
  return useContext(EDIContext);
}
