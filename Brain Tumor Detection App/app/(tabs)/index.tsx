
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    StyleSheet,
  } from "react-native";
  import React, { useState } from "react";
  import { SafeAreaView } from "react-native";
  import { StatusBar } from "expo-status-bar";
  import * as ImagePicker from "expo-image-picker";
  import { LinearGradient } from "expo-linear-gradient";

  export default function HomeScreen() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<number | null>(null);

    // Function to handle image selection
    const handleChooseFile = async () => {
      Alert.alert(
        "Choose Image",
        "Select an option to upload the image",
        [
          {
            text: "Camera",
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 1,
                });

                if (!result.canceled && result.assets?.length > 0) {
                  setSelectedImage(result.assets[0].uri);
                  setPrediction(null);
                }
              } catch (error) {
                console.error("Error opening camera: ", error);
              }
            },
          },
          {
            text: "Gallery",
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 1,
                });

                if (!result.canceled && result.assets?.length > 0) {
                  setSelectedImage(result.assets[0].uri);
                  setPrediction(null);
                }
              } catch (error) {
                console.error("Error opening gallery: ", error);
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    };

    const handlePredict = async () => {
      if (!selectedImage) {
        Alert.alert("No Image Selected", "Please upload an image first.");
        return;
      }

      try {
        let formData = new FormData();
        formData.append("image", {
          uri: selectedImage,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);

        const response = await fetch("http://192.168.1.7:5000/predict", {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = await response.json();
        if (response.ok) {
          const probability = data.prediction;
          setPrediction(probability);
        } else {
          console.error("Prediction failed:", data.error || "Unknown error");
          Alert.alert("Error", "Failed to get prediction from the server.");
        }
      } catch (error) {
        console.error("Error sending image:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    };

    return (
      <LinearGradient
        colors={["#F2F2F2", "#D6E6F2", "#BFD7EA"]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.headerText}>BRAIN TUMOR DETECTION</Text>
            </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadText}>Upload the Image</Text>
              <TouchableOpacity
                onPress={handleChooseFile}
                style={styles.uploadButton}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Choose File</Text>
              </TouchableOpacity>
            </View>

            {/* Display Selected Image */}
            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                <TouchableOpacity
                  onPress={handlePredict}
                  style={styles.predictButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Predict</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Display Prediction Result */}
            {prediction !== null && (
              <View style={styles.predictionContainer}>
                <Text style={styles.predictionText}>
                  Brain Tumor Probability: {prediction}%
                </Text>
                <Text
                  style={[
                    styles.resultText,
                    { color: prediction >= 50 ? "#E74C3C" : "#27AE60" },
                  ]}
                >
                  {prediction >= 50
                    ? "Result: Brain Tumor Detected"
                    : "Result: No Tumor Detected"}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const styles = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContainer: {
      paddingVertical: 20,
    },
    header: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 40,
    },
    headerText: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: "#34495E",
    },
    uploadSection: {
      flex: 1,
      marginTop: 40,
      alignItems: "center",
    },
    uploadText: {
      fontSize: 22,
      marginBottom: 20,
      color: "#2C3E50",
    },
    uploadButton: {
      backgroundColor: "#3498DB",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    imageContainer: {
      alignItems: "center",
      marginTop: 30,
    },
    image: {
      width: 300,
      height: 300,
      borderRadius: 8,
      borderColor: "#ccc",
      borderWidth: 1,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    predictButton: {
      backgroundColor: "#2ECC71",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    predictionContainer: {
      marginTop: 30,
      alignItems: "center",
      paddingHorizontal: 20,
    },
    predictionText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2980B9",
    },
    resultText: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 10,
    },
  });
