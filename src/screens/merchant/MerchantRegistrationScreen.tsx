import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Button, Card, TextInput } from "../../components/ui";
import { locationService } from "../../lib/services/locationService";
import { LocationCoords } from "../../lib/types";
import { MerchantService } from "../../lib/firebase/services";

type MerchantRegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MerchantRegistration"
>;

interface Props {
  navigation: MerchantRegistrationScreenNavigationProp;
}

const MerchantRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    category: "",
    walletAddress: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Get current location when component mounts
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      if (!locationService.getHasPermission()) {
        const granted = await locationService.requestLocationPermission();
        if (!granted) {
          showMessage({
            message: "Location Required",
            description:
              "Location access is required to register your business.",
            type: "warning",
            duration: 3000,
          });
          return;
        }
      }

      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      showMessage({
        message: "Location Error",
        description: "Could not get your current location. Please try again.",
        type: "danger",
        duration: 3000,
      });
    } finally {
      setGettingLocation(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showMessage({
        message: "Validation Error",
        description: "Business name is required",
        type: "warning",
        duration: 3000,
      });
      return false;
    }
    if (!formData.address.trim()) {
      showMessage({
        message: "Validation Error",
        description: "Address is required",
        type: "warning",
        duration: 3000,
      });
      return false;
    }
    if (!formData.category.trim()) {
      showMessage({
        message: "Validation Error",
        description: "Category is required",
        type: "warning",
        duration: 3000,
      });
      return false;
    }
    if (!formData.walletAddress.trim()) {
      showMessage({
        message: "Validation Error",
        description: "Wallet address is required",
        type: "warning",
        duration: 3000,
      });
      return false;
    }
    if (!location) {
      showMessage({
        message: "Validation Error",
        description: "Location is required. Please allow location access.",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    // Basic wallet address validation (Solana addresses are typically 32-44 characters)
    if (
      formData.walletAddress.length < 32 ||
      formData.walletAddress.length > 44
    ) {
      showMessage({
        message: "Validation Error",
        description: "Please enter a valid Solana wallet address",
        type: "warning",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const merchantData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        category: formData.category.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        walletAddress: formData.walletAddress.trim(),
        acceptedTokens: ["SOL", "USDC"],
        isActive: false, // Will be activated after approval
        isApproved: false, // Requires admin approval
        rating: 0,
        description: formData.description.trim(),
        registeredAt: new Date().toISOString(),
        ...(formData.contactEmail.trim() && {
          contactEmail: formData.contactEmail.trim(),
        }),
        ...(formData.contactPhone.trim() && {
          contactPhone: formData.contactPhone.trim(),
        }),
      };

      await MerchantService.addMerchant(merchantData);

      showMessage({
        message: "Registration Submitted",
        description:
          "Your business registration has been submitted for review. You will be notified once approved.",
        type: "success",
        duration: 4000,
        onPress: () => navigation.goBack(),
      });

      // Navigate back after a short delay
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      console.error("Error registering merchant:", error);
      showMessage({
        message: "Registration Error",
        description: "Failed to submit registration. Please try again.",
        type: "danger",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.formCard}>
          <Text style={styles.title}>Register Your Business</Text>
          <Text style={styles.subtitle}>
            Join the NearMe network and start accepting crypto payments
          </Text>

          {/* Business Name */}
          <TextInput
            label="Business Name *"
            placeholder="Enter your business name"
            value={formData.name}
            onChangeText={(value) => updateFormData("name", value)}
            containerStyle={styles.inputContainer}
          />

          {/* Address */}
          <TextInput
            label="Address *"
            placeholder="Enter your business address"
            value={formData.address}
            onChangeText={(value) => updateFormData("address", value)}
            containerStyle={styles.inputContainer}
            multiline
          />

          {/* Category */}
          <TextInput
            label="Category *"
            placeholder="e.g., Coffee Shop, Restaurant, Retail"
            value={formData.category}
            onChangeText={(value) => updateFormData("category", value)}
            containerStyle={styles.inputContainer}
          />

          {/* Wallet Address */}
          <TextInput
            label="Solana Wallet Address *"
            placeholder="Paste your Solana wallet address"
            value={formData.walletAddress}
            onChangeText={(value) => updateFormData("walletAddress", value)}
            containerStyle={styles.inputContainer}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Description */}
          <TextInput
            label="Description"
            placeholder="Describe your business (optional)"
            value={formData.description}
            onChangeText={(value) => updateFormData("description", value)}
            containerStyle={styles.inputContainer}
            multiline
          />

          {/* Contact Email */}
          <TextInput
            label="Contact Email"
            placeholder="your@email.com (optional)"
            value={formData.contactEmail}
            onChangeText={(value) => updateFormData("contactEmail", value)}
            containerStyle={styles.inputContainer}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Contact Phone */}
          <TextInput
            label="Contact Phone"
            placeholder="+91-XXXXXXXXXX (optional)"
            value={formData.contactPhone}
            onChangeText={(value) => updateFormData("contactPhone", value)}
            containerStyle={styles.inputContainer}
            keyboardType="phone-pad"
          />

          {/* Location Status */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Location</Text>
            {gettingLocation ? (
              <View style={styles.locationStatus}>
                <ActivityIndicator size="small" color={SolanaColors.accent} />
                <Text style={styles.locationText}>
                  Getting your location...
                </Text>
              </View>
            ) : location ? (
              <View style={styles.locationStatus}>
                <Text style={styles.locationSuccessText}>
                  ✓ Location captured
                </Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View style={styles.locationStatus}>
                <Text style={styles.locationErrorText}>Location required</Text>
                <Button
                  title="Get Location"
                  onPress={getCurrentLocation}
                  variant="outline"
                  size="small"
                  style={styles.locationButton}
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title={loading ? "Submitting..." : "Submit Registration"}
            onPress={handleSubmit}
            disabled={loading || !location}
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: Spacing.layout.screenPadding,
    backgroundColor: SolanaColors.background.card,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  locationContainer: {
    marginBottom: Spacing["2xl"],
  },
  locationLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.sm,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: SolanaColors.background.secondary,
    borderRadius: Spacing.borderRadius.md,
  },
  locationText: {
    marginLeft: Spacing.sm,
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  locationSuccessText: {
    color: SolanaColors.status.success,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  locationCoords: {
    marginLeft: Spacing.sm,
    color: SolanaColors.text.secondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: "monospace",
  },
  locationErrorText: {
    color: SolanaColors.status.error,
    fontSize: Typography.fontSize.sm,
  },
  locationButton: {
    marginLeft: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});

export default MerchantRegistrationScreen;
