'use client';

import Image from "next/image";
import type {ValidationResults, ValidationResults as ValidationResultsType} from '@/types/document-validator';
import DocumentUploader from "@/app/components/document-validator/DocumentUploader";
import {useState} from "react";
import {DocumentAnalysisView} from "@/app/components/document-validator/DocumentAnalysisView";


export default function Home() {
  const [results, setResults] = useState<ValidationResults | null>(null);

  // Manejar la finalización de la validación
  const handleValidationComplete = (newResults: ValidationResults) => {
    setResults(newResults);
  };

  // Reiniciar la aplicación
  const handleReset = () => {
    setResults(null);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              SCTR Extractor
            </h1>
            <p className="text-gray-600 mt-2">
              Herramienta para la extracción de información de documentos SCTR
            </p>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {results ? (
                <DocumentAnalysisView
                    results={results}
                    onReset={handleReset}
                />
            ) : (
                <DocumentUploader
                    onValidationComplete={handleValidationComplete}
                />
            )}
          </div>
        </main>

        <footer className="bg-white shadow-inner mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} SCTR Extractor
            </p>
          </div>
        </footer>
      </div>
  );
}
