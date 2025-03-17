import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Loader2, AlertCircle, User } from 'lucide-react';
import { validateDocument } from '@/services/document-validator';
import { ValidationResults } from '@/types/document-validator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface DocumentUploaderProps {
    onValidationComplete: (results: ValidationResults) => void;
    maxFileSize?: number;
}

export default function DocumentUploader({
                                             onValidationComplete,
                                             maxFileSize = 10 * 1024 * 1024 // 10MB default
                                         }: DocumentUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [personName, setPersonName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = (file: File): boolean => {
        if (file.type !== 'application/pdf') {
            setError('Solo se permiten archivos PDF');
            toast.error("Tipo de archivo no válido", {
                description: "Solo se permiten archivos PDF"
            });
            return false;
        }

        if (file.size > maxFileSize) {
            setError(`El archivo excede el tamaño máximo permitido de ${maxFileSize / (1024 * 1024)}MB`);
            toast.error("Archivo demasiado grande", {
                description: `El archivo excede el tamaño máximo permitido de ${maxFileSize / (1024 * 1024)}MB`
            });
            return false;
        }

        return true;
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            setError(null);
            toast.success("Archivo recibido", {
                description: `${droppedFile.name} listo para procesar`
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            setError(null);
            toast.success("Archivo seleccionado", {
                description: `${selectedFile.name} listo para procesar`
            });
        }
    };

    const handleUpload = async () => {
        if (!file || !personName.trim()) {
            setError('Por favor proporciona un archivo PDF y el nombre de la persona');
            toast.error("Datos incompletos", {
                description: "Por favor proporciona un archivo PDF y el nombre de la persona"
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // Simulamos progreso para mejorar UX
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                const newProgress = Math.min(prev + 5, 90);
                return newProgress;
            });
        }, 300);

        try {
            toast.loading("Procesando documento", {
                description: "Analizando el contenido del PDF..."
            });

            const results = await validateDocument(file, personName);

            clearInterval(progressInterval);
            setUploadProgress(100);

            toast("Procesamiento completado");

            // Pequeño delay para mostrar el 100% de progreso antes de mostrar resultados
            setTimeout(() => {
                onValidationComplete(results);
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
            setError(errorMessage);
            setUploadProgress(0);

            toast("Error en el procesamiento");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Extractor de Documentos SCTR</CardTitle>
                    <CardDescription>
                        Sube un documento PDF y especifica el nombre de la persona para extraer la información
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Campo de nombre de persona */}
                    <div className="space-y-2">
                        <label htmlFor="person-name" className="text-sm font-medium">
                            Nombre de la Persona
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                id="person-name"
                                type="text"
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                className="pl-10"
                                placeholder="Ingresa el nombre de la persona a buscar"
                                required
                            />
                        </div>
                    </div>

                    {/* Área de carga de archivos */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
              border-2 border-dashed rounded-lg p-12 transition-all
              ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                        }
              ${file ? 'bg-primary/5 border-primary/30' : ''}
            `}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4">
                                    {file ? (
                                        <File className="h-16 w-16 text-primary" />
                                    ) : (
                                        <Upload className="h-16 w-16 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold">
                                    {file ? file.name : 'Arrastra o haz clic para subir un documento PDF'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Soporta documentos PDF de SCTR (máx. {maxFileSize / (1024 * 1024)}MB)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Mensajes de error */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Barra de progreso */}
                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2 w-full" />
                            <p className="text-sm text-center text-gray-600">
                                {uploadProgress >= 100
                                    ? 'Procesamiento completado'
                                    : `Procesando... ${uploadProgress}%`}
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || !personName.trim() || isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Extraer Información'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}