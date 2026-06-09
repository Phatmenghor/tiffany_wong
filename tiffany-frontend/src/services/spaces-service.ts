import { axiosClientWithAuth } from "@/utils/axios/axios-client";

export interface SpacesUploadResult {
  key: string;
  url: string;
}

export async function uploadToSpaces(file: File): Promise<SpacesUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClientWithAuth.post("/api/v1/spaces/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteFromSpaces(key: string): Promise<void> {
  await axiosClientWithAuth.delete("/api/v1/spaces/object", { params: { key } });
}
