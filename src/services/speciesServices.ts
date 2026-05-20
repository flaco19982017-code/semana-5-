import {
  DataSnapshot,
  get,
  off,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
  update,
  remove,
} from "firebase/database";

import {
  ref as storageRef,
  deleteObject,
} from "firebase/storage";

import { Species, SpeciesFormValues } from "../types/species";
import { db, storage } from "./firebaseConfig";

const SPECIES_PATH = "species";

// Convertir snapshot de RTDB a array de Species
const snapshotToArray = (snapshot: DataSnapshot): Species[] => {
  const val = snapshot.val() as Record<string, Omit<Species, "id">> | null;
  if (!val) return [];

  return Object.entries(val).map(([id, data]) => ({
    id,
    commonName: data.commonName ?? "",
    scientificName: data.scientificName ?? "",
    habitat: data.habitat ?? "",
    imageUrl: data.imageUrl ?? "",
    createdAt: data.createdAt,
  }));
};

// CREATE - Realtime Database
export const addSpecies = async (
  values: SpeciesFormValues
): Promise<string> => {
  const speciesRef = ref(db, SPECIES_PATH);
  const newRef = push(speciesRef);

  await set(newRef, {
    ...values,
    createdAt: serverTimestamp(),
  });

  return newRef.key as string;
};

// READ - Lista en tiempo real
export const subscribeToSpecies = (
  onData: (species: Species[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const speciesRef = ref(db, SPECIES_PATH);

  onValue(
    speciesRef,
    (snapshot) => {
      const data = snapshotToArray(snapshot);

      data.sort(
        (a, b) =>
          Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)
      );

      onData(data);
    },
    (error) => onError(error)
  );

  return () => off(speciesRef, "value");
};

// READ con ID
export const getSpeciesById = async (
  id: string
): Promise<Species | null> => {
  const speciesRef = ref(db, `${SPECIES_PATH}/${id}`);
  const snapshot = await get(speciesRef);

  if (!snapshot.exists()) return null;

  return {
    id,
    ...(snapshot.val() as Omit<Species, "id">),
  };
};

// UPDATE - Actualizar especie
export const updateSpecies = async (
  id: string,
  values: Partial<SpeciesFormValues>
): Promise<void> => {
  const speciesRef = ref(db, `${SPECIES_PATH}/${id}`);

  await update(speciesRef, {
    ...values,
    updatedAt: serverTimestamp(),
  });
};

// DELETE - Eliminar especie y su imagen
export const deleteSpecies = async (
  id: string,
  imageUrl?: string
): Promise<void> => {
  // 1. Eliminar el registro de Realtime Database
  const speciesRef = ref(db, `${SPECIES_PATH}/${id}`);
  await remove(speciesRef);

  // 2. Eliminar la imagen de Firebase Storage si existe
  if (imageUrl) {
    try {
      const imageReference = storageRef(storage, `${SPECIES_PATH}/${id}`);
      await deleteObject(imageReference);
    } catch (error) {
      console.log("No se pudo eliminar la imagen de Storage:", error);
    }
  }
};