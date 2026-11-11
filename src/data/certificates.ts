export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
  link?: string;
  showOnCertificatesPage?: boolean;
  category: "Programming" | "Web Development" | "Database" | "IoT" | "Blockchain" | "Networking" | "Electrical";
}

export const certificates: Certificate[] = [];
