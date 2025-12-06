import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { supabase } from "../services/supabase";
// Assuming these components can adapt to light mode or you might need to tweak them separately
import {
  ProductCard,
  SectionHeader,
  EmptyState,
} from "../components";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");

// 🎨 NEW BRIGHT COLOR PALETTE
const Theme = {
  background: "#F9FAFB",     // Very light grey (easier on eyes than pure white)
  surface: "#FFFFFF",        // Pure white for cards
  primary: "#4F46E5",        // Vibrant Indigo
  primaryGradient: ["#4F46E5", "#7C3AED"], // Indigo to Violet
  secondary: "#0EA5E9",      // Sky Blue
  textMain: "#1F2937",       // Dark Grey (Almost Black)
  textSub: "#6B7280",        // Medium Grey
  border: "#E5E7EB",         // Light Grey border
  success: "#10B981",        // Bright Green
  shadow: "rgba(0, 0, 0, 0.05)",
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_featured?: boolean;
  stock_quantity?: number;
}

export default function HomeScreen({ navigation }: any) {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Header Styles
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: Theme.primary, shadowColor: 'transparent', elevation: 0 },
      headerTintColor: '#fff',
      headerTitle: "", // Clean look
      headerRight: () =>
        !isAuthenticated ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, isAuthenticated]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: featured } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .limit(8);

      const { data: marketplace } = await supabase
        .from("second_hand_products")
        .select("*")
        .eq("is_available", true)
        .limit(8);

      setFeaturedProducts(featured || []);
      setMarketplaceProducts(marketplace || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✨ Clean Bright Service Card
  const renderServiceCard = (icon: string, title: string, description: string, index: number) => (
    <Animated.View entering={FadeInDown.delay(index * 120).springify()} style={styles.serviceCard} key={title}>
      <View style={styles.serviceIconContainer}>
        <Text style={styles.serviceIcon}>{icon}</Text>
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
    </Animated.View>
  );

  // ✨ Clean List Card
  const renderWhyChooseCard = (icon: string, title: string, description: string, index: number) => (
    <Animated.View entering={FadeInRight.delay(index * 160).springify()} style={styles.whyChooseCard} key={title}>
      <View style={styles.whyChooseIconBox}>
        <Text style={styles.whyChooseIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.whyChooseTitle}>{title}</Text>
        <Text style={styles.whyChooseDescription}>{description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.primary} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* ---------------------------------------------------- */}
        {/* BRIGHT HERO SECTION */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(900)}>
          <LinearGradient
            colors={Theme.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Animated.View entering={ZoomIn.delay(200)} style={styles.heroBadge}>
                <Text style={styles.badgeText}>✨ Elite Repair Hub</Text>
              </Animated.View>

              <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.heroTitle}>
                Fix Your Phone{"\n"}
                <Text style={styles.heroTitleAccent}>Faster & Better.</Text>
              </Animated.Text>

              <Animated.Text entering={FadeInDown.delay(500)} style={styles.heroSubtitle}>
                Premium repairs and quality marketplace deals. 
                Experience the new standard.
              </Animated.Text>
            </View>

            {/* Decorative Floating Circle */}
            <View style={styles.decorativeCircle} />
          </LinearGradient>
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* OVERLAPPING SERVICES (Float Effect) */}
        {/* ---------------------------------------------------- */}
        <View style={styles.floatingServicesContainer}>
            <View style={styles.servicesGrid}>
                {renderServiceCard("⚡", "1-Hour Fix", "Express Service", 0)}
                {renderServiceCard("🛡️", "Warranty", "Genuine Parts", 1)}
                {renderServiceCard("👨‍🔧", "Experts", "Certified Pros", 2)}
            </View>
        </View>

        {/* ---------------------------------------------------- */}
        {/* QUICK ACTIONS */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#EEF2FF" }]}
              onPress={() => navigation.navigate("Marketplace")}
            >
              <Text style={styles.actionButtonIcon}>🛒</Text>
              <Text style={[styles.actionButtonText, { color: Theme.primary }]}>Marketplace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#ECFDF5" }]}
              onPress={() => navigation.navigate("Products")}
            >
              <Text style={styles.actionButtonIcon}>🛍️</Text>
              <Text style={[styles.actionButtonText, { color: Theme.success }]}>New Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#F3F4F6" }]}
              onPress={() => navigation.navigate("Track")}
            >
              <Text style={styles.actionButtonIcon}>🔍</Text>
              <Text style={[styles.actionButtonText, { color: Theme.textMain }]}>Track Repair</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* FEATURED PRODUCTS */}
        {/* ---------------------------------------------------- */}
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionTitle}>Featured Products</Text>
                    <Text style={styles.sectionSubtitle}>Curated for excellence</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Products")}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : featuredProducts.length > 0 ? (
            <Animated.View entering={FadeInRight.delay(800)}>
              <FlatList
                horizontal
                data={featuredProducts}
                renderItem={({ item }) => (
                  <View style={styles.productCardContainer}>
                    <ProductCard
                      product={item}
                      onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
                      showBadge
                    />
                  </View>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </Animated.View>
          ) : (
            <EmptyState icon="📦" title="No items" subtitle="Check back soon" />
          )}
        </View>

        {/* ---------------------------------------------------- */}
        {/* MARKETPLACE */}
        {/* ---------------------------------------------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
                <View>
                    <Text style={styles.sectionTitle}>Marketplace Deals</Text>
                    <Text style={styles.sectionSubtitle}>Verified pre-owned devices</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Marketplace")}>
                    <Text style={styles.seeAllText}>Browse</Text>
                </TouchableOpacity>
            </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : marketplaceProducts.length > 0 ? (
            <Animated.View entering={FadeInRight.delay(1000)}>
              <FlatList
                horizontal
                data={marketplaceProducts}
                renderItem={({ item }) => (
                  <View style={styles.productCardContainer}>
                    <ProductCard
                      product={item}
                      onPress={() => navigation.navigate("MarketplaceDetail", { id: item.id })}
                    />
                  </View>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </Animated.View>
          ) : (
            <EmptyState icon="🛍️" title="Empty" subtitle="No deals today" />
          )}
        </View>

        {/* ---------------------------------------------------- */}
        {/* WHY CHOOSE US */}
        {/* ---------------------------------------------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.whyChooseGrid}>
            {renderWhyChooseCard("🚀", "Lightning Fast", "Repairs done in under 60 mins", 0)}
            {renderWhyChooseCard("💎", "Original Parts", "100% authentic components", 1)}
            {renderWhyChooseCard("🔒", "Data Secure", "Your privacy is our priority", 2)}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Device Repair Hub</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ROOT
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  
  // NAV BTN
  signInBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  signInText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // HERO
  heroSection: {
    paddingTop: 20,
    paddingBottom: 80, // Extra padding for the overlapping cards
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    alignItems: "flex-start",
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
    lineHeight: 40,
  },
  heroTitleAccent: {
    color: "#C7D2FE", // Soft lighter Indigo
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    maxWidth: 280,
    lineHeight: 22,
  },

  // FLOATING SERVICES
  floatingServicesContainer: {
    marginTop: -50, // Pull up to overlap hero
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  servicesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: Theme.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: "center",
    // SHADOWS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 22,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.textMain,
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 11,
    color: Theme.textSub,
    textAlign: "center",
  },

  // COMMON SECTION STYLES
  section: {
    paddingVertical: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Theme.textMain,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
      fontSize: 13,
      color: Theme.textSub,
      fontWeight: '500',
  },
  seeAllText: {
      color: Theme.primary,
      fontWeight: '600',
      fontSize: 14,
  },

  // QUICK ACTIONS
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // PRODUCTS LIST
  horizontalList: {
    paddingHorizontal: 20,
    paddingBottom: 20, // Space for shadows
  },
  productCardContainer: {
    width: width * 0.55,
    marginRight: 16,
  },
  loadingText: {
    marginLeft: 20,
    color: Theme.textSub,
  },

  // WHY CHOOSE US
  whyChooseGrid: {
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  whyChooseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  whyChooseIconBox: {
      width: 44, 
      height: 44,
      borderRadius: 12,
      backgroundColor: '#EFF6FF',
      justifyContent: 'center', 
      alignItems: 'center',
      marginRight: 16
  },
  whyChooseIcon: {
    fontSize: 22,
  },
  whyChooseTitle: {
    fontSize: 15,
    color: Theme.textMain,
    fontWeight: "700",
    marginBottom: 2,
  },
  whyChooseDescription: {
    fontSize: 13,
    color: Theme.textSub,
    lineHeight: 18,
  },

  // FOOTER
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 10,
  },
  footerText: {
    color: Theme.textSub,
    fontSize: 12,
    fontWeight: '500',
  },
});