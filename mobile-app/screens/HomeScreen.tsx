import React, { useState, useEffect, useLayoutEffect, memo } from "react";
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
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  BounceIn,
  BounceInUp,
  BounceInDown,
  BounceInLeft,
  BounceInRight,
} from "react-native-reanimated";
import { supabase } from "../services/supabase";
import { ProductCard, SectionHeader, EmptyState } from "../components";
import { useAuth } from "../hooks/useAuth";
import { Colors, Spacing, Typography } from "../constants/theme";
import { Card } from "../components/common/Card";

const { width } = Dimensions.get("window");

// 🎨 BRIGHT COLOR PALETTE
const Theme = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  primary: "#4F46E5",
  primaryGradientStart: "#4F46E5",
  primaryGradientEnd: "#7C3AED",
  secondary: "#0EA5E9",
  textMain: "#1F2937",
  textSub: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
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

interface SecondHandProduct {
  id: string;
  description: string;
  condition: string;
  price: number;
  is_available: boolean;
  seller_name: string;
  image_url?: string;
  created_at: string;
}

// Memoized Service Card Component
const ServiceCard = memo(({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <View style={styles.serviceCard}>
    <View style={styles.serviceIconContainer}>
      <Text style={styles.serviceIcon}>{icon}</Text>
    </View>
    <Text style={styles.serviceTitle}>{title}</Text>
    <Text style={styles.serviceDescription}>{description}</Text>
  </View>
));

// Memoized Why Choose Card Component
const WhyChooseCard = memo(({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <View style={styles.whyChooseCard}>
    <View style={styles.whyChooseIconBox}>
      <Text style={styles.whyChooseIcon}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.whyChooseTitle}>{title}</Text>
      <Text style={styles.whyChooseDescription}>{description}</Text>
    </View>
  </View>
));

export default function HomeScreen({ navigation }: any) {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<SecondHandProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Header Styles
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: Theme.primary, shadowColor: 'transparent', elevation: 0 },
      headerTintColor: '#fff',
      headerTitle: "",
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.primary} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 50 }}
        removeClippedSubviews={true}
      >
        
        {/* ---------------------------------------------------- */}
        {/* BRIGHT HERO SECTION */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(800)}>
          <LinearGradient
            colors={[Theme.primaryGradientStart, Theme.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Animated.View entering={ZoomIn.delay(200).duration(600)} style={styles.heroBadge}>
                <Text style={styles.badgeText}>✨ Elite Repair Hub</Text>
              </Animated.View>

              <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.heroTitle}>
                Fix Your Phone{"\n"}
                <Text style={styles.heroTitleAccent}>Faster & Better.</Text>
              </Animated.Text>

              <Animated.Text entering={FadeInDown.delay(600).springify()} style={styles.heroSubtitle}>
                Premium repairs and quality marketplace deals. 
                Experience the new standard.
              </Animated.Text>
              
              <Animated.View entering={BounceInUp.delay(1000).duration(800)} style={styles.heroActions}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate("Track")}
                >
                  <Text style={styles.buttonText}>Track Repair</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate("Products")}
                >
                  <Text style={styles.secondaryButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Decorative Floating Circle */}
            <View style={styles.decorativeCircle} />
          </LinearGradient>
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* OVERLAPPING SERVICES (Float Effect) */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={SlideInDown.delay(800).duration(600)} style={styles.floatingServicesContainer}>
            <View style={styles.servicesGrid}>
                <Animated.View entering={SlideInUp.delay(0).springify().damping(12)}>
                  <ServiceCard icon="⚡" title="1-Hour Fix" description="Express Service" />
                </Animated.View>
                <Animated.View entering={SlideInUp.delay(150).springify().damping(12)}>
                  <ServiceCard icon="🛡️" title="Warranty" description="Genuine Parts" />
                </Animated.View>
                <Animated.View entering={SlideInUp.delay(300).springify().damping(12)}>
                  <ServiceCard icon="👨‍🔧" title="Experts" description="Certified Pros" />
                </Animated.View>
            </View>
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* QUICK ACTIONS */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(1200).duration(600)} style={styles.section}>
          <SectionHeader 
            title="Quick Actions" 
            icon="⚡" 
          />
          
          <View style={styles.quickActionsGrid}>
            <Animated.View entering={SlideInLeft.delay(1400).duration(500)} style={{ width: '48%' }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#EEF2FF" }]}
                onPress={() => navigation.navigate("Marketplace")}
              >
                <Text style={styles.actionButtonIcon}>🛒</Text>
                <Text style={[styles.actionButtonText, { color: Theme.primary }]}>Marketplace</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={SlideInRight.delay(1500).duration(500)} style={{ width: '48%' }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#ECFDF5" }]}
                onPress={() => navigation.navigate("Products")}
              >
                <Text style={styles.actionButtonIcon}>🛍️</Text>
                <Text style={[styles.actionButtonText, { color: Theme.success }]}>New Products</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={SlideInLeft.delay(1600).duration(500)} style={{ width: '48%' }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#FEF3C7" }]}
                onPress={() => navigation.navigate("Track")}
              >
                <Text style={styles.actionButtonIcon}>🔍</Text>
                <Text style={[styles.actionButtonText, { color: "#D97706" }]}>Track Repair</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* FEATURED PRODUCTS */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(1800).duration(600)} style={styles.section}>
          <SectionHeader 
            title="Featured Products" 
            icon="⭐" 
            actionButton={{
              label: "View All",
              onPress: () => navigation.navigate("Products")
            }}
          />
          
          {featuredProducts.length > 0 ? (
            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item, index }) => (
                <Animated.View 
                  entering={SlideInRight.delay(2000 + index * 100).duration(400)}
                  style={styles.productCardWrapper}
                >
                  <ProductCard 
                    product={item} 
                    onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
                    showBadge={true}
                  />
                </Animated.View>
              )}
              keyExtractor={(item) => item.id}
              removeClippedSubviews={true}
              maxToRenderPerBatch={4}
              windowSize={3}
              initialNumToRender={6}
            />
          ) : (
            <EmptyState 
              title="No Featured Products" 
              subtitle="Check back later for our featured products" 
              icon="🏷️"
            />
          )}
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* MARKETPLACE DEALS */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(2200).duration(600)} style={styles.section}>
          <SectionHeader 
            title="Marketplace Deals" 
            icon="📱" 
            actionButton={{
              label: "View All",
              onPress: () => navigation.navigate("Marketplace")
            }}
          />
          
          {marketplaceProducts.length > 0 ? (
            <FlatList
              data={marketplaceProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item, index }) => (
                <Animated.View 
                  entering={SlideInLeft.delay(2400 + index * 100).duration(400)}
                  style={styles.productCardWrapper}
                >
                  <ProductCard 
                    product={{
                      ...item,
                      name: item.description,
                      category: item.condition
                    }} 
                    onPress={() => navigation.navigate("MarketplaceDetail", { id: item.id })}
                  />
                </Animated.View>
              )}
              keyExtractor={(item) => item.id}
              removeClippedSubviews={true}
              maxToRenderPerBatch={4}
              windowSize={3}
              initialNumToRender={6}
            />
          ) : (
            <EmptyState 
              title="No Marketplace Items" 
              subtitle="Check back later for great deals" 
              icon="📱"
            />
          )}
        </Animated.View>

        {/* ---------------------------------------------------- */}
        {/* WHY CHOOSE US */}
        {/* ---------------------------------------------------- */}
        <Animated.View entering={FadeInUp.delay(2600).duration(600)} style={styles.section}>
          <SectionHeader 
            title="Why Choose Us" 
            icon="🏆" 
          />
          
          <Card padding="none">
            <View style={styles.whyChooseList}>
              <Animated.View entering={FadeInRight.delay(2800).springify()}>
                <WhyChooseCard icon="⏱️" title="Fast Turnaround" description="Most repairs completed within 24 hours" />
              </Animated.View>
              <Animated.View entering={FadeInRight.delay(3000).springify()}>
                <WhyChooseCard icon="💯" title="Quality Guarantee" description="90-day warranty on all repairs" />
              </Animated.View>
              <Animated.View entering={FadeInRight.delay(3200).springify()}>
                <WhyChooseCard icon="💰" title="Best Prices" description="Competitive pricing with no hidden fees" />
              </Animated.View>
              <Animated.View entering={FadeInRight.delay(3400).springify()}>
                <WhyChooseCard icon="📞" title="24/7 Support" description="Round-the-clock customer assistance" />
              </Animated.View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  signInBtn: {
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  signInText: {
    ...Typography.bodyLarge,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Hero Section
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 80,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.displaySmall,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  heroTitleAccent: {
    color: '#A5F3FC',
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.bodyLarge,
    color: Theme.primary,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: 140,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.bodyLarge,
    color: '#fff',
    fontWeight: '700',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  
  // Services
  floatingServicesContainer: {
    marginTop: -60,
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.md,
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Theme.textMain,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  serviceDescription: {
    ...Typography.bodySmall,
    color: Theme.textSub,
    textAlign: 'center',
  },
  
  // Sections
  section: {
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  actionButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  
  // Products
  horizontalList: {
    paddingHorizontal: Spacing.sm,
  },
  productCardWrapper: {
    width: 200,
    marginRight: Spacing.md,
  },
  
  // Why Choose Us
  whyChooseList: {
    padding: Spacing.md,
  },
  whyChooseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  whyChooseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  whyChooseIcon: {
    fontSize: 18,
  },
  whyChooseTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Theme.textMain,
    marginBottom: Spacing.xs,
  },
  whyChooseDescription: {
    ...Typography.bodySmall,
    color: Theme.textSub,
  },
});