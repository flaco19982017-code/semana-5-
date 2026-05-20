// ─── DetailScreen.tsx ────────────────────────────────────────────────────────
// Muestra el detalle completo de una especie.
// Carga el documento desde Firebase por ID.
// Permite editar y eliminar registros.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

import { ScreenProps } from "../navigation/typeNavigation";
import { detailStyles } from "../theme/appStyles";
import { Species } from '../types/species';

// IMPORTA TUS FUNCIONES DEL SERVICIO FIREBASE
// Ajusta la ruta según el nombre real de tu archivo
import {
  getSpeciesById,
  deleteSpecies,
} from "../services/speciesServices";

type Props = ScreenProps<"Detail">;

export const DetailScreen = ({ route, navigation }: Props) => {
  const { speciesId } = route.params;

  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Cargar detalle de la especie
  useEffect(() => {
    loadSpecies();
  }, [speciesId]);

  const loadSpecies = async () => {
    try {
      setLoading(true);

      const data = await getSpeciesById(speciesId);

      if (data) {
        setSpecies(data);
      } else {
        Alert.alert("Aviso", "No se encontró la especie.");
        navigation.goBack();
      }
    } catch (error) {
      console.log("Error al cargar especie:", error);
      Alert.alert("Error", "No se pudo cargar la información de la especie.");
    } finally {
      setLoading(false);
    }
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Está seguro de que desea eliminar este registro?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleDelete,
        },
      ]
    );
  };

  // Eliminar registro
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await deleteSpecies(speciesId, species?.imageUrl);

      Alert.alert("Correcto", "Registro eliminado correctamente.");

      navigation.goBack();
    } catch (error) {
      console.log("Error al eliminar:", error);
      Alert.alert("Error", "No se pudo eliminar el registro.");
    } finally {
      setDeleting(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <View style={detailStyles.container}>
        <ActivityIndicator size="large" />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Cargando información...
        </Text>
      </View>
    );
  }

  // Validación si no existe especie
  if (!species) {
    return (
      <View style={detailStyles.container}>
        <Text style={{ textAlign: "center" }}>
          No existe información para mostrar.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={detailStyles.container}
      contentContainerStyle={detailStyles.content}
    >
      {species.imageUrl ? (
        <Image source={{ uri: species.imageUrl }} style={detailStyles.image} />
      ) : (
        <View style={[detailStyles.image, detailStyles.imagePlaceholder]}>
          <Text style={{ fontSize: 64 }}>🌿</Text>
        </View>
      )}

      <View style={detailStyles.dataCard}>
        <Text style={detailStyles.commonName}>{species.commonName}</Text>

        <Text style={detailStyles.scientificName}>
          {species.scientificName}
        </Text>

        <View style={detailStyles.divider} />

        <View style={detailStyles.field}>
          <Text style={detailStyles.fieldLabel}>Hábitat</Text>
          <Text style={detailStyles.fieldValue}>{species.habitat}</Text>
        </View>
      </View>

      <View style={detailStyles.actions}>
        <TouchableOpacity
          style={detailStyles.editBtn}
          onPress={() =>
            navigation.navigate("Form", {
              speciesId: speciesId,
             
            })
          }
        >
          <Text style={detailStyles.editBtnText}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={detailStyles.deleteBtn}
          onPress={confirmDelete}
          disabled={deleting}
        >
          <Text style={detailStyles.deleteBtnText}>
            {deleting ? "Eliminando..." : "🗑️ Eliminar"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};