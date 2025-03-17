import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, FileText, Search, Calendar, Building, ClipboardCheck, Users, Copy, Check } from 'lucide-react';
import { ValidationResults } from '@/types/document-validator';
import { PersonValidationDetails, DocumentStructuredContent } from '@/types/document-validator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface DocumentAnalysisViewProps {
    results: ValidationResults;
    onReset: () => void;
}

export function DocumentAnalysisView({ results, onReset }: DocumentAnalysisViewProps) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);

    // Manejar cambio de término de búsqueda
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Copiar texto al portapapeles
    const copyToClipboard = () => {
        navigator.clipboard.writeText(results.extracted_text);
        setCopied(true);
        toast.success("Texto copiado", {
            description: "El texto extraído ha sido copiado al portapapeles"
        });
        setTimeout(() => setCopied(false), 2000);
    };

    // Resaltar términos de búsqueda en el texto
    const highlightSearchTerm = (text: string) => {
        if (!searchTerm.trim()) return text;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));

        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    // Función para formatear claves
    const formatKey = (key: string): string => {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    // Función para formatear valores
    const formatValue = (key: string, value: any): React.ReactNode => {
        if (value === null || value === undefined) return "-";
        if (Array.isArray(value)) {
            if (key === "person_by_policy" && value.length > 0) {
                console.log("key", key)
                console.log("value", value)
                return (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>Fecha Inicio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                (value as PersonValidationDetails[]).map((person, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{person.full_name}</TableCell>
                                    <TableCell>{person.document_number}</TableCell>
                                    <TableCell>{person.coverage_start_date || "-"}</TableCell>
                                </TableRow>
                            ))
                            }
                        </TableBody>
                    </Table>
                );
            }
            return value.join(', ') || "-";
        }

        return String(value);
    };

    // Renderizar contenido estructurado
    const renderStructuredContent = () => {
        if (!results.component) {
            return <div className="p-8 text-center text-gray-500">No hay contenido estructurado disponible</div>;
        }

        const content = results.component;

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Metadatos del Documento</CardTitle>
                        <CardDescription>
                            Información general sobre el contenido del documento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Longitud total</dt>
                                <dd className="mt-1 text-lg">{content.metadata.total_length}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Número de secciones</dt>
                                <dd className="mt-1 text-lg">{content.metadata.section_count}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <h3 className="text-lg font-medium mt-6">Secciones del Documento</h3>
                {/*<div className="space-y-4">*/}
                {/*    {content.sections.map((section, index) => (*/}
                {/*        <Card key={index} className="overflow-hidden">*/}
                {/*            <CardHeader className="py-3">*/}
                {/*                <CardTitle className="text-base">{section.title || "Sección sin título"}</CardTitle>*/}
                {/*            </CardHeader>*/}
                {/*            <CardContent>*/}
                {/*                <div className="whitespace-pre-wrap text-sm">{section.content}</div>*/}
                {/*            </CardContent>*/}
                {/*        </Card>*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
        );
    };

    // Renderizar pólizas y secciones segmentadas
    const renderSegmentedSections = () => {
        if (!results.segmented_sections || results.segmented_sections.length === 0) {
            return <div className="p-8 text-center text-gray-500">No hay secciones segmentadas disponibles</div>;
        }

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                    Análisis de Pólizas
                </h3>

                {results.segmented_sections.content.map((section, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Póliza #{index + 1}
                                </CardTitle>
                                {section.policy_number && (
                                    <Badge variant="outline" className="font-mono">
                                        {section.policy_number}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Accordion type="single" collapsible defaultValue="item-0">
                                {/* Información General */}
                                <AccordionItem value="item-0">
                                    <AccordionTrigger className="px-6 py-3 hover:bg-gray-50">
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      Información General
                    </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 py-3 border-t border-gray-100">
                                        <dl className="divide-y divide-gray-100">
                                            {/* Empresa */}
                                            {section.company && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Empresa</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.company}</dd>
                                                </div>
                                            )}

                                            {/* Aseguradora */}
                                            {section.insurance_company && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Aseguradora</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.insurance_company}</dd>
                                                </div>
                                            )}

                                            {/* Fecha de Emisión */}
                                            {section.validity && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Fecha de Emisión</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.validity}</dd>
                                                </div>
                                            )}

                                            {/* Otros campos */}
                                            {Object.entries(section)
                                                .filter(([key]) =>
                                                    !['company', 'insurance_company', 'policy_number',
                                                        'person_by_policy', 'start_date_validity', 'end_date_validity', 'validity'].includes(key))
                                                .map(([key, value]) => (
                                                    <div key={key} className="py-3 grid grid-cols-3 gap-4">
                                                        <dt className="font-medium text-gray-900">{formatKey(key)}</dt>
                                                        <dd className="text-gray-700 col-span-2">{formatValue(key, value)}</dd>
                                                    </div>
                                                ))
                                            }
                                        </dl>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Período de Vigencia */}
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="px-6 py-3 hover:bg-gray-50">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Período de Vigencia
                    </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 py-3 border-t border-gray-100">
                                        <dl className="divide-y divide-gray-100">
                                            {/* Vigencia completa */}
                                            {section.validity && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Vigencia</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.validity}</dd>
                                                </div>
                                            )}

                                            {/* Fecha de inicio */}
                                            {section.start_date_validity && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Fecha de Inicio</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.start_date_validity}</dd>
                                                </div>
                                            )}

                                            {/* Fecha de fin */}
                                            {section.end_date_validity && (
                                                <div className="py-3 grid grid-cols-3 gap-4">
                                                    <dt className="font-medium text-gray-900">Fecha de Fin</dt>
                                                    <dd className="text-gray-700 col-span-2">{section.end_date_validity}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Personas Aseguradas */}
                                {section.person_by_policy && section.person_by_policy.length > 0 && (
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger className="px-6 py-3 hover:bg-gray-50">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Personas Aseguradas
                      </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-3 border-t border-gray-100">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nombre</TableHead>
                                                            <TableHead>Documento</TableHead>
                                                            <TableHead>Fecha Inicio</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {(section.person_by_policy as PersonValidationDetails[]).map((person, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium">{person.full_name}</TableCell>
                                                                <TableCell>{person.document_number}</TableCell>
                                                                <TableCell>{person.coverage_start_date || "-"}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    // Renderizar texto extraído
    const renderExtractedText = () => {
        return (
            <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Texto Extraído
                        </CardTitle>
                        {results.person_name && (
                            <CardDescription>
                                Persona buscada: <span className="font-medium">{results.person_name}</span>
                            </CardDescription>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copiar
                            </>
                        )}
                    </Button>
                </CardHeader>

                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Buscar en el texto..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10"
                        />
                    </div>
                </div>

                <CardContent className="p-0">
                    <ScrollArea className="h-[500px] w-full">
                        <div className="p-4 whitespace-pre-wrap font-mono text-sm">
                            {searchTerm ? highlightSearchTerm(results.extracted_text) : results.extracted_text}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Resultados del Análisis</h2>
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Analizar otro documento
                </Button>
            </div>

            <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="analysis">Análisis del Documento</TabsTrigger>
                    <TabsTrigger value="structured">Contenido Estructurado</TabsTrigger>
                    <TabsTrigger value="raw">Texto Extraído</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="space-y-6">
                    {renderSegmentedSections()}
                </TabsContent>

                <TabsContent value="structured" className="space-y-6">
                    {renderStructuredContent()}
                </TabsContent>

                <TabsContent value="raw" className="space-y-6">
                    {renderExtractedText()}
                </TabsContent>
            </Tabs>
        </>
    );
}