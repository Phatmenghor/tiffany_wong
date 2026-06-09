import { axiosClientWithAuth } from "@/utils/axios/axios-client";

export interface SpacesUploadResult {
  key: string;
  url: string;
}

export function isBase64Image(str: string): boolean {
  return !!str && str.startsWith("data:image");
}

export async function uploadToSpaces(file: File): Promise<SpacesUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClientWithAuth.post("/api/v1/spaces/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function uploadBase64ToSpaces(base64: string): Promise<string> {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const bstr = atob(arr[1]);
  const bytes = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) bytes[i] = bstr.charCodeAt(i);
  const file = new File([bytes], "upload.jpg", { type: mime });
  const result = await uploadToSpaces(file);
  return result.url;
}

export async function deleteFromSpaces(key: string): Promise<void> {
  await axiosClientWithAuth.delete("/api/v1/spaces/object", { params: { key } });
}
