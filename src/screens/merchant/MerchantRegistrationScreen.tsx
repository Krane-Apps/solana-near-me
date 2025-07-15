import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { RootStackParamList } from "../../lib/types";
import { SolanaColors, Typography, Spacing } from "../../lib/theme";
import { Button, TextInput } from "../../components/ui";
import { locationService } from "../../lib/services/locationService";
import { LocationCoords } from "../../lib/types";
import { MerchantService } from "../../lib/firebase/services";
import { encodeGeohash } from "../../lib/utils/geohash";
import { logger } from "../../lib/utils/logger";

type MerchantRegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MerchantRegistration"
>;

interface Props {
  navigation: MerchantRegistrationScreenNavigationProp;
}

const FILE_NAME = "MerchantRegistrationScreen";

const MerchantRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    category: "",
    walletAddress: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    googleMapsLink: "",
  });
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Get current location when component mounts
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      logger.info(
        FILE_NAME,
        "Getting current location for merchant registration"
      );

      if (!locationService.getHasPermission()) {
        const granted = await locationService.requestLocationPermission();
        if (!granted) {
          logger.warn(FILE_NAME, "Location permission denied");
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
      logger.info(
        FILE_NAME,
        "Location captured for merchant registration",
        currentLocation
      );
    } catch (error) {
      logger.error(FILE_NAME, "Error getting location:", error);
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
        description: "Location is required",
        type: "warning",
        duration: 3000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    logger.info(FILE_NAME, "Submitting merchant registration");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const merchantData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        category: formData.category.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        geopoint: {
          latitude: location!.latitude,
          longitude: location!.longitude,
        },
        geohash: encodeGeohash(location!.latitude, location!.longitude),
        city: "Bangalore", // Default city for now, could be improved with reverse geocoding
        walletAddress: formData.walletAddress.trim(),
        acceptedTokens: ["SOL", "USDC"],
        isActive: false, // Will be activated after approval
        isApproved: false, // Requires admin approval
        rating: 0,
        description: formData.description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(formData.contactEmail.trim() && {
          contactEmail: formData.contactEmail.trim(),
        }),
        ...(formData.contactPhone.trim() && {
          contactPhone: formData.contactPhone.trim(),
        }),
        ...(formData.googleMapsLink.trim() && {
          googleMapsLink: formData.googleMapsLink.trim(),
        }),
      };

      await MerchantService.addMerchant(merchantData);
      logger.info(FILE_NAME, "Merchant registration submitted successfully");

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
      logger.error(FILE_NAME, "Error registering merchant:", error);
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

  const renderLocationCard = () => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <MaterialIcons
          name="location-on"
          size={24}
          color={SolanaColors.primary}
        />
        <Text style={styles.locationTitle}>Business Location</Text>
        <Text style={styles.requiredBadge}>Required</Text>
      </View>

      {gettingLocation ? (
        <View style={styles.locationContent}>
          <ActivityIndicator size="small" color={SolanaColors.primary} />
          <Text style={styles.locationStatusText}>
            Getting your location...
          </Text>
        </View>
      ) : location ? (
        <View style={styles.locationContent}>
          <View style={styles.locationSuccessContainer}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={SolanaColors.status.success}
            />
            <Text style={styles.locationSuccessText}>
              Location captured successfully
            </Text>
          </View>
          <Text style={styles.locationCoords}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocation}
          >
            <MaterialIcons
              name="refresh"
              size={16}
              color={SolanaColors.text.secondary}
            />
            <Text style={styles.retryButtonText}>Update Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.locationContent}>
          <View style={styles.locationErrorContainer}>
            <MaterialIcons
              name="error"
              size={20}
              color={SolanaColors.status.error}
            />
            <Text style={styles.locationErrorText}>Location not found</Text>
          </View>
          <Text style={styles.locationHelpText}>
            We need your location to help customers find your business
          </Text>
          <TouchableOpacity
            style={styles.getLocationButton}
            onPress={getCurrentLocation}
          >
            <MaterialIcons
              name="my-location"
              size={20}
              color={SolanaColors.white}
            />
            <Text style={styles.getLocationButtonText}>
              Get Current Location
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFormSection = (title: string, children: React.ReactNode) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={SolanaColors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Business</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <MaterialIcons name="store" size={48} color={SolanaColors.primary} />
          <Text style={styles.heroTitle}>Join NearMe</Text>
          <Text style={styles.heroSubtitle}>
            Start accepting crypto payments and reach customers in your area
          </Text>
        </View>

        {/* Location Section - Top Priority */}
        {renderLocationCard()}

        {/* Business Information */}
        {renderFormSection(
          "Business Information",
          <>
            <TextInput
              label="Business Name"
              placeholder="Enter your business name"
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              containerStyle={styles.inputContainer}
            />

            <TextInput
              label="Category"
              placeholder="e.g., Coffee Shop, Restaurant, Retail"
              value={formData.category}
              onChangeText={(value) => updateFormData("category", value)}
              containerStyle={styles.inputContainer}
            />

            <TextInput
              label="Business Address"
              placeholder="Enter your full business address"
              value={formData.address}
              onChangeText={(value) => updateFormData("address", value)}
              containerStyle={styles.inputContainer}
              multiline
            />

            <TextInput
              label="Description (Optional)"
              placeholder="Tell customers about your business"
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              containerStyle={styles.inputContainer}
              multiline
            />
          </>
        )}

        {/* Payment Information */}
        {renderFormSection(
          "Payment Setup",
          <TextInput
            label="Solana Wallet Address"
            placeholder="Paste your Solana wallet address"
            value={formData.walletAddress}
            onChangeText={(value) => updateFormData("walletAddress", value)}
            containerStyle={styles.inputContainer}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        {/* Contact Information */}
        {renderFormSection(
          "Contact Information (Optional)",
          <>
            <TextInput
              label="Contact Email"
              placeholder="your@email.com"
              value={formData.contactEmail}
              onChangeText={(value) => updateFormData("contactEmail", value)}
              containerStyle={styles.inputContainer}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Contact Phone"
              placeholder="+91-XXXXXXXXXX"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData("contactPhone", value)}
              containerStyle={styles.inputContainer}
              keyboardType="phone-pad"
            />

            <TextInput
              label="Google Maps Link"
              placeholder="https://maps.app.goo.gl/..."
              value={formData.googleMapsLink}
              onChangeText={(value) => updateFormData("googleMapsLink", value)}
              containerStyle={styles.inputContainer}
              keyboardType="url"
              autoCapitalize="none"
            />
          </>
        )}

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={loading ? "Submitting..." : "Submit Registration"}
            onPress={handleSubmit}
            disabled={loading || !location}
            loading={loading}
            variant="primary"
          />

          <Text style={styles.submitNote}>
            Your registration will be reviewed and you'll be notified once
            approved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SolanaColors.background.primary,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.layout.screenPadding,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SolanaColors.border.secondary,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SolanaColors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.layout.screenPadding,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },

  heroTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  heroSubtitle: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    paddingHorizontal: Spacing.lg,
  },

  // Location Card
  locationCard: {
    backgroundColor: SolanaColors.background.card,
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    borderWidth: 2,
    borderColor: SolanaColors.primary + "20",
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },

  locationTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  requiredBadge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.status.error,
    backgroundColor: SolanaColors.status.error + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },

  locationContent: {
    alignItems: "center",
  },

  locationStatusText: {
    fontSize: Typography.fontSize.base,
    color: SolanaColors.text.secondary,
    marginLeft: Spacing.sm,
  },

  locationSuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  locationSuccessText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.status.success,
    marginLeft: Spacing.sm,
  },

  locationCoords: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.tertiary,
    fontFamily: "monospace",
    marginBottom: Spacing.md,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },

  retryButtonText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    marginLeft: Spacing.xs,
  },

  locationErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  locationErrorText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.status.error,
    marginLeft: Spacing.sm,
  },

  locationHelpText: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },

  getLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SolanaColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
  },

  getLocationButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: SolanaColors.white,
    marginLeft: Spacing.sm,
  },

  // Form Sections
  formSection: {
    marginBottom: Spacing["2xl"],
  },

  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: SolanaColors.text.primary,
    marginBottom: Spacing.lg,
  },

  inputContainer: {
    marginBottom: Spacing.lg,
  },

  // Submit Section
  submitSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },

  submitNote: {
    fontSize: Typography.fontSize.sm,
    color: SolanaColors.text.secondary,
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});

export default MerchantRegistrationScreen;
