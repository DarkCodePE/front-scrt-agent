import { ValidationResults } from "@/types/document-validator";

/**
 * Valida un documento PDF enviándolo al servidor para su análisis
 *
 * @param file - Archivo PDF a validar
 * @param personName - Nombre de la persona a buscar en el documento
 * @returns Resultados de la validación con la información estructurada
 */
export async function validateDocument(
    file: File,
    personName: string
): Promise<ValidationResults> {
    try {
        // Verificar que el archivo sea un PDF
        if (file.type !== 'application/pdf') {
            throw new Error('Solo se permiten archivos PDF');
        }

        // Verificar que se haya proporcionado un nombre de persona
        if (!personName.trim()) {
            throw new Error('El nombre de la persona es requerido');
        }

        // Crear el FormData para la solicitud
        const formData = new FormData();
        formData.append("file", file);
        formData.append("person_name", personName);

        // Determinar si debemos usar la API route o el backend directamente
        // En producción, deberías usar la API route de Next.js para evitar problemas de CORS
        const useApiRoute = process.env.NODE_ENV === 'production' ||
            !process.env.NEXT_PUBLIC_DIRECT_API;

        // Determinar la URL del endpoint
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/document/v2/validate`;

        console.log(`Enviando solicitud a: ${apiUrl}`);

        // Realizar la solicitud
        const response = await fetch(apiUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.error || "Error al procesar el documento");
        }

        // Procesar la respuesta
        const data = await response.json();

        // Verificar que la respuesta tenga la estructura esperada
        if (!data.extracted_text || !data.component || !data.segmented_sections) {
            throw new Error("La respuesta del servidor no tiene el formato esperado");
        }

        return data as ValidationResults;
    } catch (error) {
        console.error("Error en la validación del documento:", error);
        throw error;
    }
}