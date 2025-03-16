// Tipos para las secciones de documento
export interface DocumentSection {
    title: string;
    content: string;
}

export interface DocumentMetadata {
    total_length: number;
    section_count: number;
    additional_info?: Record<string, any>;
}

export interface StructuredContent {
    sections: DocumentSection[];
    metadata: DocumentMetadata;
}

// Tipo para detalles de validación de persona
export interface PersonValidationDetails {
    full_name: string;
    document_number: string;
    coverage_start_date?: string;
}

// Tipo para el contenido estructurado del documento
export interface DocumentStructuredContent {
    content: any; // Contiene la información estructurada del documento
}

// Tipo principal para el estado de validación
export interface DocumentValidationDetails {
    start_date_validity?: string;
    end_date_validity?: string;
    validity?: string;
    policy_number?: string;
    company?: string;
    date_of_issuance?: string;
    insurance_company?: string;
    person_by_policy?: PersonValidationDetails[];
    signatories?: string[];
    extracted_text?: string;
    person_name?: string;
    structured_content?: StructuredContent;
    file_name?: string;
    segmented_sections?: DocumentStructuredContent[];
}

// Tipo para la respuesta de la API
export interface ValidationResults {
    extracted_text: string;
    component: StructuredContent;
    person_name: string;
    segmented_sections: DocumentStructuredContent[];
}